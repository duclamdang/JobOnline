import 'package:flutter/material.dart';

class BulletText extends StatelessWidget {
  final String text;
  const BulletText(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    final lines = text
        .split(RegExp(r'\r?\n'))
        .where((e) => e.trim().isNotEmpty)
        .toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((l) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('•  ', style: TextStyle(height: 1.4)),
              Expanded(
                child: Text(l.trim(), style: const TextStyle(height: 1.4)),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}
