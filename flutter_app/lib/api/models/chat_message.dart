class ChatMessage {
  final String role; // 'system' | 'user' | 'assistant'
  final String content;

  ChatMessage({required this.role, required this.content});

  Map<String, String> toJson() => {'role': role, 'content': content};
}
