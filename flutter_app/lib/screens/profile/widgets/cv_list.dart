import 'package:flutter/material.dart';
import 'package:mobile/api/models/cv_model.dart';
import 'package:mobile/screens/profile/widgets/cv_card.dart';
import 'package:mobile/utils/day_utils.dart';
import 'package:mobile/utils/url_utils.dart';
import 'package:mobile/screens/profile/cv_pdf_viewer_screen.dart';

class CvList extends StatelessWidget {
  final List<CvModel> items;
  final Future<void> Function() onRefresh;
  final void Function(CvModel cv) onSetMain;
  final void Function(CvModel cv) onDelete;

  const CvList({
    super.key,
    required this.items,
    required this.onRefresh,
    required this.onSetMain,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          final cv = items[i];
          return CvCard(
            fileName: cv.fileName,
            createdText:
                'Tải lên: ${toDdMMyyyy(cv.createdAt?.toIso8601String() ?? "")}',
            isMain: cv.main,
            onView: () {
              final url = fullUrl(cv.filePath);
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) =>
                      CvPdfViewerScreen(title: cv.fileName, pdfUrl: url),
                ),
              );
            },
            onSetMain: cv.main ? null : () => onSetMain(cv),
            onDelete: () => onDelete(cv),
          );
        },
      ),
    );
  }
}
