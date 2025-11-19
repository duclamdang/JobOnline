class Position {
  final int id;
  final String title;

  Position({required this.id, required this.title});

  factory Position.fromJson(Map<String, dynamic> json) {
    return Position(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
    );
  }
}
