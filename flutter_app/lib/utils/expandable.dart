import 'package:flutter/material.dart';

class Expandable extends StatefulWidget {
  final String text;

  const Expandable({super.key, required this.text});

  @override
  State<Expandable> createState() => _ExpandableState();
}

class _ExpandableState extends State<Expandable> {
  bool _expanded = false;
  static const int _trimLength = 220;

  @override
  Widget build(BuildContext context) {
    final raw = widget.text.trim().isEmpty ? '—' : widget.text.trim();
    final bool isLong = raw.length > _trimLength;

    final String displayText;
    if (!_expanded && isLong) {
      displayText = '${raw.substring(0, _trimLength).trimRight()}...';
    } else {
      displayText = raw;
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          displayText,
          style: const TextStyle(
            fontSize: 15,
            height: 1.6,
            color: Colors.black87,
          ),
        ),
        if (isLong)
          TextButton(
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: const Size(0, 0),
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            onPressed: () {
              setState(() {
                _expanded = !_expanded;
              });
            },
            child: Text(
              _expanded ? 'Thu gọn' : 'Xem thêm',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),
      ],
    );
  }
}
