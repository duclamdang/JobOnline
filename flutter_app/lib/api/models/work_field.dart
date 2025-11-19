class WorkField {
  final int id;
  final String title;

  WorkField({required this.id, required this.title});

  factory WorkField.fromJson(Map<String, dynamic> json) {
    return WorkField(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
    );
  }
}
