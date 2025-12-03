import 'package:flutter/material.dart';
import 'package:mobile/api/models/chat_message.dart';
import 'package:mobile/api/services/ai_service.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/chat_provider.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';

class ChatBox extends StatelessWidget {
  const ChatBox({super.key});

  static const Color _primaryBlue = Color(0xFF4C6FFF);
  static const Color _assistantBg = Color(0xFFF4F6FB);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => ChatProvider(AiService(AiService.defaultBaseUrl)),
      child: SafeArea(
        top: false,
        child: Container(
          decoration: const BoxDecoration(
            color: Color(0xFFF3F6FF),
            borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          ),
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
                    Container(
                      height: 32,
                      width: 32,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: Color(0xFFE0E7FF),
                      ),
                      child: Image.asset(
                        'assets/images/jobonline_logo.png',
                        height: 18,
                        fit: BoxFit.contain,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'Trợ lý AI JobOnline',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Flexible(
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.04),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Consumer<ChatProvider>(
                      builder: (_, p, __) => ListView.separated(
                        padding: const EdgeInsets.symmetric(vertical: 6),
                        itemCount: p.messages.length + (p.loading ? 1 : 0),
                        separatorBuilder: (_, __) => const SizedBox(height: 8),
                        itemBuilder: (_, i) {
                          if (p.loading && i == p.messages.length) {
                            return const _Bubble(
                              isUser: false,
                              child: Text('Trợ lý đang trả lời…'),
                            );
                          }
                          final m = p.messages[i];
                          return _Bubble(
                            isUser: m.role == 'user',
                            child: renderMessage(m, context),
                          );
                        },
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                // COMPOSER
                const _Composer(),
              ],
            ),
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
            textInputAction: TextInputAction.send,
            decoration: InputDecoration(
              hintText: 'Nhập câu hỏi của bạn…',
              filled: true,
              fillColor: Colors.white,
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 10,
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Colors.transparent),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(color: Colors.transparent),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(18),
                borderSide: const BorderSide(
                  color: ChatBox._primaryBlue,
                  width: 1.2,
                ),
              ),
            ),
            onSubmitted: (_) => _send(context),
          ),
        ),
        const SizedBox(width: 8),
        SizedBox(
          height: 40,
          width: 40,
          child: ElevatedButton(
            onPressed: p.loading ? null : () => _send(context),
            style: ElevatedButton.styleFrom(
              padding: EdgeInsets.zero,
              shape: const CircleBorder(),
              backgroundColor: ChatBox._primaryBlue,
              foregroundColor: Colors.white,
              elevation: 1,
            ),
            child: const Icon(Icons.send_rounded, size: 18),
          ),
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
    final bg = isUser ? ChatBox._primaryBlue : ChatBox._assistantBg;
    final textColor = isUser ? Colors.white : Colors.black87;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: const BoxConstraints(maxWidth: 320),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: isUser
                ? const Radius.circular(16)
                : const Radius.circular(4),
            bottomRight: isUser
                ? const Radius.circular(4)
                : const Radius.circular(16),
          ),
          boxShadow: [
            if (!isUser)
              BoxShadow(
                color: Colors.black.withOpacity(0.03),
                blurRadius: 6,
                offset: const Offset(0, 3),
              ),
          ],
        ),
        child: DefaultTextStyle.merge(
          style: TextStyle(color: textColor, fontSize: 14, height: 1.4),
          child: child,
        ),
      ),
    );
  }
}

Widget renderMessage(ChatMessage m, BuildContext context) {
  final meta = m.metadata ?? {};
  final jobUrl = meta['job_url'];

  // Nếu backend trả về job_url (intent: job_link)
  if (jobUrl != null && jobUrl.toString().isNotEmpty) {
    String? jobIdStr;

    try {
      final uri = Uri.parse(jobUrl.toString());
      if (uri.pathSegments.isNotEmpty) {
        jobIdStr = uri.pathSegments.last;
      }
    } catch (_) {
      // nếu parse fail thì fallback split '/'
      jobIdStr = jobUrl.toString().split('/').last;
    }

    jobIdStr ??= jobUrl.toString().split('/').last;
    final jobId = int.tryParse(jobIdStr);

    final baseStyle = DefaultTextStyle.of(context).style;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text('Mình đã tìm được công việc bạn đang xem.', style: baseStyle),
        const SizedBox(height: 4),
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () {
            if (jobId == null) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Không đọc được mã tin tuyển dụng.'),
                ),
              );
              return;
            }

            Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => JobDetailScreen(jobId: jobId)),
            );
          },
          child: Text(
            'Mở chi tiết công việc',
            style: baseStyle.copyWith(
              color: Theme.of(context).colorScheme.primary,
              decoration: TextDecoration.underline,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }

  // Mặc định: chỉ hiển thị text bình thường
  return Text(m.content);
}
