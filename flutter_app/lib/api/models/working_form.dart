class WorkingForm {
  final int id;
  final String title;

  WorkingForm({required this.id, required this.title});

  factory WorkingForm.fromJson(Map<String, dynamic> json) {
    return WorkingForm(
      id: json['id'] is int ? json['id'] : int.tryParse('${json['id']}') ?? 0,
      title: json['title'] ?? '',
    );
  }
}
