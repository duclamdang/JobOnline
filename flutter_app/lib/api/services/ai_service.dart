import 'package:dio/dio.dart';
import 'dart:io';

import 'package:mobile/api/models/chat_message.dart';

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
    // ignore: avoid_print
    print('[AiService] baseUrl=${_dio.options.baseUrl}');
  }

  Future<ChatMessage> ask(List<Map<String, dynamic>> messages) async {
    final r = await _dio.post('/ai/chat', data: {'messages': messages});

    return ChatMessage(
      role: 'assistant',
      content: r.data['text'],
      metadata: r.data['metadata'],
    );
  }

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

    if (Platform.isAndroid) return 'http://192.168.37.1:8000/api';
    return 'http://192.168.37.1:8000/api';
  }
}
