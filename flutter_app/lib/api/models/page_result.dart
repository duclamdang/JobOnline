class PageResult<T> {
  final List<T> items;
  final int currentPage;
  final int lastPage;
  final int perPage;
  final int total;

  bool get hasMore => currentPage < lastPage;

  PageResult({
    required this.items,
    required this.currentPage,
    required this.lastPage,
    required this.perPage,
    required this.total,
  });

  factory PageResult.fromLaravelJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) itemParser,
  ) {
    final List data = (json['data'] as List?) ?? const [];

    final rawMeta = json['meta'] ?? json['pagination'] ?? {};
    final meta = Map<String, dynamic>.from(rawMeta as Map);

    // ignore: no_leading_underscores_for_local_identifiers
    int _intOrDefault(String key, int fallback) {
      final v = meta[key];
      if (v == null) return fallback;
      if (v is int) return v;
      if (v is num) return v.toInt();
      if (v is String) return int.tryParse(v) ?? fallback;
      return fallback;
    }

    return PageResult<T>(
      items: data.map((e) => itemParser(Map<String, dynamic>.from(e))).toList(),
      currentPage: _intOrDefault('current_page', 1),
      lastPage: _intOrDefault('last_page', 1),
      perPage: _intOrDefault('per_page', data.length),
      total: _intOrDefault('total', data.length),
    );
  }
}
