import 'package:flutter/material.dart';

Widget sectionTitle(String title) {
  return Padding(
    padding: const EdgeInsets.symmetric(vertical: 8),
    child: Text(
      title,
      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
    ),
  );
}
