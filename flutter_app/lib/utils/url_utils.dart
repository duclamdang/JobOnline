import 'package:mobile/api/services/api_service.dart';

String fullUrl(String? path, {String storagePrefix = 'storage/'}) {
  if (path == null || path.isEmpty) return '';
  final p = path.trim();

  if (p.startsWith('http://') ||
      p.startsWith('https://') ||
      p.startsWith('data:')) {
    return p;
  }

  final base = Uri.parse(ApiService.baseUrl);
  final origin =
      '${base.scheme}://${base.host}${base.hasPort ? ':${base.port}' : ''}';

  final prefix = storagePrefix.endsWith('/')
      ? storagePrefix
      : '$storagePrefix/';
  final rel = p.startsWith('/') ? p.substring(1) : p;

  return '$origin/$prefix$rel';
}
