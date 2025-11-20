import 'package:flutter/material.dart';

class BottomApplyBar extends StatelessWidget {
  final bool isActive;
  final bool isSaved;
  final VoidCallback onApply;
  final VoidCallback onSave;

  const BottomApplyBar({
    super.key,
    required this.isActive,
    required this.onApply,
    required this.onSave,
    this.isSaved = false,
  });

  @override
  Widget build(BuildContext context) {
    const blue = Color(0xFF1A73E8);
    final grayBorder = Colors.grey.shade300;

    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(16, 8, 16, 12),
      child: Row(
        children: [
          SizedBox(
            width: 44,
            height: 44,
            child: InkWell(
              onTap: onSave,
              borderRadius: BorderRadius.circular(12),
              child: Container(
                decoration: BoxDecoration(
                  // ignore: deprecated_member_use
                  color: isSaved ? blue.withOpacity(0.12) : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSaved ? blue : grayBorder,
                    width: 1.4,
                  ),
                ),
                child: Icon(
                  isSaved ? Icons.bookmark : Icons.bookmark_border,
                  size: 22,
                  color: isSaved ? blue : Colors.grey.shade700,
                ),
              ),
            ),
          ),

          const SizedBox(width: 14),

          Expanded(
            child: GestureDetector(
              onTap: isActive ? onApply : null,
              child: Container(
                height: 48,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(14),
                  gradient: isActive
                      ? const LinearGradient(
                          colors: [Color(0xFF1A73E8), Color(0xFF4285F4)],
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                        )
                      : null,
                  color: isActive ? null : Colors.grey.shade300,
                ),
                alignment: Alignment.center,
                child: Text(
                  isActive ? 'Ứng tuyển ngay' : 'Đã hết hạn',
                  style: TextStyle(
                    color: isActive ? Colors.white : Colors.grey.shade600,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
