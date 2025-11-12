import 'package:flutter/material.dart';

class CompanyEmpty extends StatelessWidget {
  final String message;
  const CompanyEmpty({super.key, required this.message});
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.only(bottom: 100, left: 16, right: 16),
        child: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.black54),
        ),
      ),
    );
  }
}
