import 'package:flutter/material.dart';

class CvCard extends StatelessWidget {
  final String fileName;
  final String createdText;
  final bool isMain;
  final VoidCallback onView;
  final VoidCallback? onSetMain;
  final VoidCallback onDelete;

  const CvCard({
    super.key,
    required this.fileName,
    required this.createdText,
    required this.isMain,
    required this.onView,
    required this.onDelete,
    this.onSetMain,
  });

  static const _primary = Color(0xFF4C6FFF);

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: const Color(0xFFF7F8FF),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          // ignore: deprecated_member_use
          color: _primary.withOpacity(0.18),
          width: 1.2,
        ),
      ),

      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEFF3FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.picture_as_pdf, color: _primary),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fileName,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        createdText,
                        style: const TextStyle(color: Colors.black54),
                      ),
                    ],
                  ),
                ),
                if (isMain) const SizedBox(width: 8),
                if (isMain)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(999),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.verified, size: 16, color: Colors.green),
                        SizedBox(width: 6),
                        Text(
                          'CV chính',
                          style: TextStyle(fontSize: 12, color: Colors.green),
                        ),
                      ],
                    ),
                  ),
              ],
            ),

            const SizedBox(height: 12),

            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Wrap(
                    spacing: 10,
                    runSpacing: 10,
                    children: [
                      FilledButton.tonalIcon(
                        onPressed: onView,
                        icon: const Icon(Icons.visibility_outlined),
                        label: const Text('Xem CV'),
                        style: FilledButton.styleFrom(
                          // ignore: deprecated_member_use
                          backgroundColor: _primary.withOpacity(.08),
                          foregroundColor: _primary,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 10,
                          ),
                          shape: const StadiumBorder(),
                          textStyle: const TextStyle(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (onSetMain != null)
                        TextButton.icon(
                          onPressed: onSetMain,
                          icon: const Icon(Icons.star_border_rounded),
                          label: const Text('Đặt làm chính'),
                          style: TextButton.styleFrom(
                            foregroundColor: _primary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 8,
                            ),
                            textStyle: const TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                _DeleteIcon(onDelete: onDelete),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DeleteIcon extends StatelessWidget {
  final VoidCallback onDelete;
  const _DeleteIcon({required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Material(
      // ignore: deprecated_member_use
      color: Colors.red.withOpacity(.08),
      shape: const CircleBorder(),
      child: InkWell(
        customBorder: const CircleBorder(),
        onTap: onDelete,
        child: const Padding(
          padding: EdgeInsets.all(8),
          child: Icon(Icons.delete_outline, color: Colors.redAccent),
        ),
      ),
    );
  }
}
