class Education {
  final int id;
  final String title;

  Education({required this.id, required this.title});

  factory Education.fromJson(Map<String, dynamic> json) {
    return Education(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
    );
  }
}
