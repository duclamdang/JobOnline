import 'package:flutter/material.dart';

class FilterSelectChip extends StatelessWidget {
  final String label;
  final String? selectedText;
  final VoidCallback onPressed;
  final bool isActive;

  const FilterSelectChip({
    super.key,
    required this.label,
    required this.onPressed,
    this.selectedText,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final String displayText =
        (selectedText != null && selectedText!.isNotEmpty)
        ? selectedText!
        : label;

    final ColorScheme colorScheme = Theme.of(context).colorScheme;

    final Color blue = colorScheme.primary;
    // ignore: deprecated_member_use
    final Color inactiveBorder = blue.withOpacity(0.35);
    final Color activeBorder = blue;
    // ignore: deprecated_member_use
    final Color activeBg = blue.withOpacity(0.08);
    final Color inactiveBg = Colors.white;

    return Container(
      margin: const EdgeInsets.only(right: 8),
      child: OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          backgroundColor: isActive ? activeBg : inactiveBg,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          side: BorderSide(
            color: isActive ? activeBorder : inactiveBorder,
            width: 1.2,
          ),
          foregroundColor: isActive
              ? blue
              // ignore: deprecated_member_use
              : colorScheme.onSurface.withOpacity(0.8),
          textStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Flexible(child: Text(displayText, overflow: TextOverflow.ellipsis)),
            const SizedBox(width: 4),
            const Icon(Icons.keyboard_arrow_down, size: 18),
          ],
        ),
      ),
    );
  }
}
