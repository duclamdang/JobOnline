import 'package:flutter/material.dart';

class InfoGroup extends StatelessWidget {
  final List<InfoItem> items;
  const InfoGroup({super.key, required this.items});

  @override
  Widget build(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 0.5,
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          children: items.map((e) {
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                children: [
                  Icon(e.icon, color: Colors.teal),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      e.label,
                      style: const TextStyle(color: Colors.black54),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    e.value,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}

class InfoItem {
  final IconData icon;
  final String label;
  final String value;
  InfoItem({required this.icon, required this.label, required this.value});
}
