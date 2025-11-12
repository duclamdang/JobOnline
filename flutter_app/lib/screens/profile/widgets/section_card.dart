import 'package:flutter/material.dart';
import 'package:mobile/screens/profile/widgets/section_title.dart';

class SectionCard extends StatelessWidget {
  final String title;
  final List<Widget> children;
  final double radius;
  const SectionCard({
    super.key,
    required this.title,
    required this.children,
    this.radius = 14,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(radius),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionTitle(title: title),
          const SizedBox(height: 10),
          ...children,
        ],
      ),
    );
  }
}

class SubLabel extends StatelessWidget {
  final String text;
  const SubLabel(this.text, {super.key});
  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      style: TextStyle(
        // ignore: deprecated_member_use
        color: Colors.black.withOpacity(.6),
        fontWeight: FontWeight.w600,
      ),
    );
  }
}
