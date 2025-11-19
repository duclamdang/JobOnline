import 'package:flutter/foundation.dart';
import 'package:mobile/api/models/chat_message.dart';
import 'package:mobile/api/services/ai_service.dart';

class ChatProvider extends ChangeNotifier {
  final AiService _service;

  final List<ChatMessage> _all = [
    ChatMessage(
      role: 'system',
      content:
          'Bạn là trợ lý tuyển dụng JobOnline. Trả lời tiếng Việt, ngắn gọn.',
    ),
  ];
  bool _loading = false;
  String? _error;
  bool _ready = false;

  ChatProvider(AiService service) : _service = service {
    _init();
  }

  Future<void> _init() async {
    final ok = await _service.ping();
    _ready = ok;
    if (!ok) {
      _error =
          'Không kết nối được server (ping fail). Kiểm tra BASE_URL/HTTP/host.';
    }
    notifyListeners();
  }

  List<ChatMessage> get messages =>
      _all.where((m) => m.role != 'system').toList();
  bool get loading => _loading;
  String? get error => _error;
  bool get ready => _ready;

  Future<void> send(String text) async {
    if (text.trim().isEmpty || _loading) return;
    _error = null;
    _all.add(ChatMessage(role: 'user', content: text));
    _loading = true;
    notifyListeners();

    try {
      final reply = await _service.ask(_all.map((m) => m.toJson()).toList());
      _all.add(
        ChatMessage(
          role: 'assistant',
          content: reply.isEmpty ? '(Không có nội dung)' : reply,
        ),
      );
    } catch (e) {
      _error = 'Lỗi gọi AI: $e';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
