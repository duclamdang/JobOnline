class CvModel {
  final int id;
  final String fileName;
  final String filePath;
  final DateTime? createdAt;
  final bool main;

  CvModel({
    required this.id,
    required this.fileName,
    required this.filePath,
    required this.main,
    this.createdAt,
  });

  factory CvModel.fromJson(Map<String, dynamic> j) {
    return CvModel(
      id: j['id'] as int,
      fileName: (j['file_name'] ?? '') as String,
      filePath: (j['file_path'] ?? '') as String,
      main: j['main_cv'] == true || j['main_cv'] == 1 || j['main_cv'] == '1',
      createdAt: DateTime.tryParse(j['created_at'] ?? ''),
    );
  }
}
