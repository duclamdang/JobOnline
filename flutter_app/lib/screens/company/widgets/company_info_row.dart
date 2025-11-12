import 'package:flutter/material.dart';

class CompanyInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final double labelWidth;
  final double iconSize;

  const CompanyInfoRow({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
    this.labelWidth = 90,
    this.iconSize = 22,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 28,
            child: Icon(icon, size: iconSize, color: Colors.blue),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: labelWidth,
            child: Text(
              label,
              style: const TextStyle(color: Colors.black45),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              softWrap: true,
              style: const TextStyle(
                fontWeight: FontWeight.w400,
                color: Colors.black87,
                height: 1.35,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
