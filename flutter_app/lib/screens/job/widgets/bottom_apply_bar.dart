import 'package:flutter/material.dart';

class BottomApplyBar extends StatelessWidget {
  final bool isActive;
  final VoidCallback onApply;
  final VoidCallback onSave;
  const BottomApplyBar({
    super.key,
    required this.isActive,
    required this.onApply,
    required this.onSave,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Container(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: Colors.grey.shade300)),
        ),
        child: Row(
          children: [
            InkWell(
              onTap: onSave,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                height: 48,
                width: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: const Icon(Icons.bookmark_border),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(48),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: isActive ? onApply : null,
                child: const Text('Ứng tuyển ngay'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
