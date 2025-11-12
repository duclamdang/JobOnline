import 'package:flutter/material.dart';

class GenderSelector extends StatelessWidget {
  final String? value; // "0"/"1"
  final ValueChanged<String> onChanged;
  final Color primary;
  const GenderSelector({
    super.key,
    required this.value,
    required this.onChanged,
    this.primary = Colors.blue,
  });

  Widget _seg(BuildContext context, String label, String v, bool selected) {
    return GestureDetector(
      onTap: () => onChanged(v),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          // ignore: deprecated_member_use
          color: selected ? primary.withOpacity(.08) : Colors.white,
          borderRadius: BorderRadius.circular(999),
          border: Border.all(
            color: selected ? primary : Colors.blueGrey.shade200,
          ),
          boxShadow: [
            if (selected)
              BoxShadow(
                // ignore: deprecated_member_use
                color: primary.withOpacity(.08),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
          ],
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? primary : Colors.black87,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sel = value;
    return Wrap(
      spacing: 10,
      children: [
        _seg(context, 'Nữ', '0', sel == '0'),
        _seg(context, 'Nam', '1', sel == '1'),
      ],
    );
  }
}
