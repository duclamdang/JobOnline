class ChatMessage {
  final String role;
  final String content;
  final Map<String, dynamic>? metadata;

  ChatMessage({required this.role, required this.content, this.metadata});

  Map<String, String> toJson() => {'role': role, 'content': content};
}
