import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

Future<void> openMap(String mapQuery, BuildContext context) async {
  final query = mapQuery;
  if (query.isEmpty) return;

  final uri = Uri.parse(
    'https://www.google.com/maps/search/?api=1&query=${Uri.encodeComponent(query)}',
  );

  if (await canLaunchUrl(uri)) {
    await launchUrl(uri, mode: LaunchMode.externalApplication);
  } else {
    ScaffoldMessenger.of(
      // ignore: use_build_context_synchronously
      context,
    ).showSnackBar(const SnackBar(content: Text('Không mở được Google Maps')));
  }
}
