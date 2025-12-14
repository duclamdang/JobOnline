class ChatMessage {
  final String role;
  final String content;
  final Map<String, dynamic>? metadata;

  ChatMessage({required this.role, required this.content, this.metadata});

  Map<String, dynamic> toJson() {
    return {
      'role': role,
      'content': content,
      if (metadata != null) 'metadata': metadata,
    };
  }

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      role: json['role'] as String,
      content: json['content'] as String? ?? '',
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}
