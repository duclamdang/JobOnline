import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

Future<bool> openWebsite(
  String? rawUrl, {
  BuildContext? context,
  bool inApp = false,
}) async {
  if (rawUrl == null) return false;

  final trimmed = rawUrl.trim();
  if (trimmed.isEmpty) return false;
  var url = trimmed;
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    url = 'https://$trimmed';
  }

  final uri = Uri.tryParse(url);
  if (uri == null) {
    _showError(context, 'Địa chỉ website không hợp lệ');
    return false;
  }

  final mode = inApp
      ? LaunchMode.inAppBrowserView
      : LaunchMode.externalApplication;

  if (await canLaunchUrl(uri)) {
    final ok = await launchUrl(uri, mode: mode);
    if (!ok) {
      // ignore: use_build_context_synchronously
      _showError(context, 'Không mở được website');
    }
    return ok;
  } else {
    // ignore: use_build_context_synchronously
    _showError(context, 'Không mở được website');
    return false;
  }
}

void _showError(BuildContext? context, String message) {
  if (context == null) return;

  ScaffoldMessenger.of(context)
    ..clearSnackBars()
    ..showSnackBar(SnackBar(content: Text(message)));
}
