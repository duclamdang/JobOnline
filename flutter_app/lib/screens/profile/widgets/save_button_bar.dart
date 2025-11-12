import 'package:flutter/material.dart';

class SaveButtonBar extends StatelessWidget {
  final bool saving;
  final VoidCallback onPressed;
  final Color color;
  const SaveButtonBar({
    super.key,
    required this.saving,
    required this.onPressed,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      minimum: const EdgeInsets.fromLTRB(16, 8, 16, 16),
      child: SizedBox(
        height: 52,
        child: ElevatedButton(
          onPressed: saving ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: color,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            elevation: 0,
          ),
          child: saving
              ? const SizedBox(
                  width: 22,
                  height: 22,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : const Text(
                  'Lưu thông tin',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
                ),
        ),
      ),
    );
  }
}
