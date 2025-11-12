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
    final meta = (json['meta'] as Map?) ?? const {};

    return PageResult<T>(
      items: data.map((e) => itemParser(Map<String, dynamic>.from(e))).toList(),
      currentPage: (meta['current_page'] ?? 1) as int,
      lastPage: (meta['last_page'] ?? 1) as int,
      perPage: (meta['per_page'] ?? data.length) as int,
      total: (meta['total'] ?? data.length) as int,
    );
  }
}
