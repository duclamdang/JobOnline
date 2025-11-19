class WorkExperience {
  final int id;
  final String title;

  WorkExperience({required this.id, required this.title});

  factory WorkExperience.fromJson(Map<String, dynamic> json) {
    return WorkExperience(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
    );
  }
}
