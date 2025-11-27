import 'package:dio/dio.dart';
import 'dart:io';

class AiService {
  final Dio _dio;

  AiService(String baseUrl)
    : _dio = Dio(
        BaseOptions(
          baseUrl: baseUrl,
          connectTimeout: const Duration(seconds: 20),
          receiveTimeout: const Duration(seconds: 30),
        ),
      ) {
    // log baseUrl khi khởi tạo
    // ignore: avoid_print
    print('[AiService] baseUrl=${_dio.options.baseUrl}');
  }

  Future<String> ask(List<Map<String, String>> messages) async {
    try {
      final r = await _dio.post('/ai/chat', data: {'messages': messages});
      // ignore: avoid_print
      print('[AiService] POST /ai/chat -> ${r.statusCode}');
      if (r.statusCode == 200) {
        final text = (r.data?['text'] as String?) ?? '';
        // ignore: avoid_print
        print(
          '[AiService] text="${text.substring(0, text.length.clamp(0, 80))}"',
        );
        return text;
      }
      throw Exception('HTTP ${r.statusCode}: ${r.data}');
    } catch (e) {
      // ignore: avoid_print
      print('[AiService] ERROR $e');
      rethrow;
    }
  }

  /// GET /api/ping để kiểm tra kết nối/network_security_config/BASE_URL
  Future<bool> ping() async {
    try {
      final r = await _dio.get('/ping');
      // ignore: avoid_print
      print('[AiService] GET /ping -> ${r.statusCode} ${r.data}');
      return r.statusCode == 200;
    } catch (e) {
      // ignore: avoid_print
      print('[AiService] PING ERROR $e');
      return false;
    }
  }

  static String get defaultBaseUrl {
    const env = String.fromEnvironment('BASE_URL', defaultValue: '');
    if (env.isNotEmpty) return env;

    // Emulator Android dùng 10.0.2.2, máy thật dùng IP LAN
    if (Platform.isAndroid) return 'http://192.168.56.1:8000/api';
    return 'http://192.168.56.1:8000/api';
  }
}
