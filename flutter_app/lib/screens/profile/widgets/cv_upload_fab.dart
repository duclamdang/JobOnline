import 'package:flutter/material.dart';

class CvUploadFab extends StatelessWidget {
  final bool uploading;
  final VoidCallback? onPressed;
  const CvUploadFab({
    super.key,
    required this.uploading,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: uploading ? null : onPressed,
      backgroundColor: const Color(0xFF4C6FFF),
      icon: uploading
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: Colors.white,
              ),
            )
          : const Icon(Icons.upload_file),
      label: Text(uploading ? 'Đang tải...' : 'Tải CV'),
    );
  }
}
