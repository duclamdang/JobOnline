import 'package:flutter/material.dart';
import 'package:mobile/api/services/ai_service.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/chat_provider.dart';

class ChatBox extends StatelessWidget {
  const ChatBox({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ChatProvider(AiService(AiService.defaultBaseUrl)),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 44,
                height: 5,
                margin: const EdgeInsets.only(bottom: 10),
                decoration: BoxDecoration(
                  color: Colors.black26,
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              Row(
                children: [
                  const Text(
                    'Trợ lý AI',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 6),

              // STATUS: ping / lỗi
              Consumer<ChatProvider>(
                builder: (_, p, __) {
                  if (p.error != null) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.red.withOpacity(0.3)),
                      ),
                      child: Text(
                        p.error!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    );
                  }
                  if (!p.ready) {
                    return Container(
                      margin: const EdgeInsets.only(bottom: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.amber.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: Colors.amber.withOpacity(0.3),
                        ),
                      ),
                      child: const Text('Đang kiểm tra kết nối (ping)…'),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),

              Flexible(
                child: Consumer<ChatProvider>(
                  builder: (_, p, __) => ListView.separated(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    itemCount: p.messages.length + (p.loading ? 1 : 0),
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemBuilder: (_, i) {
                      if (p.loading && i == p.messages.length) {
                        return const _Bubble(
                          isUser: false,
                          child: Text('Đang gõ...'),
                        );
                      }
                      final m = p.messages[i];
                      return _Bubble(
                        isUser: m.role == 'user',
                        child: Text(m.content),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),
              const _Composer(),
            ],
          ),
        ),
      ),
    );
  }
}

class _Composer extends StatefulWidget {
  const _Composer();
  @override
  State<_Composer> createState() => _ComposerState();
}

class _ComposerState extends State<_Composer> {
  final _ctrl = TextEditingController();
  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final p = context.watch<ChatProvider>();
    return Row(
      children: [
        Expanded(
          child: TextField(
            controller: _ctrl,
            minLines: 1,
            maxLines: 4,
            decoration: const InputDecoration(
              hintText: 'Nhập câu hỏi…',
              border: OutlineInputBorder(),
              isDense: true,
            ),
            onSubmitted: (_) => _send(context),
          ),
        ),
        const SizedBox(width: 8),
        IconButton(
          onPressed: p.loading ? null : () => _send(context),
          icon: const Icon(Icons.send),
        ),
      ],
    );
  }

  void _send(BuildContext context) {
    final t = _ctrl.text.trim();
    if (t.isEmpty) return;
    context.read<ChatProvider>().send(t);
    _ctrl.clear();
  }
}

class _Bubble extends StatelessWidget {
  final bool isUser;
  final Widget child;
  const _Bubble({required this.isUser, required this.child});
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isUser ? Colors.blue.shade50 : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black12),
        ),
        child: child,
      ),
    );
  }
}
