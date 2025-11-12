import 'dart:ui';
import 'package:flutter/material.dart';
import '../screens/chat/chat_box.dart';

class ChatFab extends StatelessWidget {
  const ChatFab({super.key});

  @override
  Widget build(BuildContext context) {
    return _BlueExtendedFab(
      icon: Icons.chat_bubble_rounded,
      label: 'Chat AI',
      onPressed: () => _showChatBottomSheet(context),
    );
  }
}

/// ---------- Bottom Sheet UX ----------
Future<void> _showChatBottomSheet(BuildContext context) async {
  final theme = Theme.of(context);
  await showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    barrierColor: Colors.black.withOpacity(0.35),
    backgroundColor: Colors.transparent, // để thấy hiệu ứng "kính"
    builder: (_) {
      return DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.98,
        snap: true,
        snapSizes: const [0.5, 0.85, 0.98],
        builder: (context, controller) {
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(24),
              ),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 14, sigmaY: 14),
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surface.withOpacity(0.92),
                    border: Border.all(
                      color: theme.colorScheme.primary.withOpacity(0.08),
                    ),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x33000000),
                        blurRadius: 24,
                        offset: Offset(0, 10),
                      ),
                    ],
                  ),
                  child: _ChatSheet(controller: controller),
                ),
              ),
            ),
          );
        },
      );
    },
  );
}

class _ChatSheet extends StatelessWidget {
  const _ChatSheet({required this.controller});

  final ScrollController controller;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return CustomScrollView(
      controller: controller,
      slivers: [
        // Drag handle + header
        SliverToBoxAdapter(
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: cs.primary.withOpacity(0.25),
                  borderRadius: BorderRadius.circular(999),
                ),
              ),
              const SizedBox(height: 12),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [Color(0xFF1A73E8), Color(0xFF3BA5FF)],
                        ),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x330B5BD3),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.chat_bubble_rounded,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Chat AI',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w700),
                          ),
                          Text(
                            'Hỏi nhanh – gợi ý thông minh',
                            style: Theme.of(context).textTheme.bodySmall
                                ?.copyWith(
                                  color: cs.onSurface.withOpacity(0.6),
                                ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Đóng',
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: Icon(
                        Icons.close_rounded,
                        color: cs.onSurface.withOpacity(0.8),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Divider(height: 1, color: cs.outlineVariant.withOpacity(0.5)),
            ],
          ),
        ),

        // Nội dung Chat
        SliverFillRemaining(hasScrollBody: true, child: const _ChatBody()),
      ],
    );
  }
}

class _ChatBody extends StatelessWidget {
  const _ChatBody();

  @override
  Widget build(BuildContext context) {
    // Nếu ChatBox tự cuộn nội bộ, vẫn hoạt động tốt vì SliverFillRemaining cung cấp không gian còn lại
    // và DraggableScrollableSheet quản lý tổng thể chiều cao.
    return const Padding(
      padding: EdgeInsets.only(bottom: 12),
      child: ChatBox(),
    );
  }
}

/// ---------- Nâng cấp FAB xanh gradient ----------
class _BlueExtendedFab extends StatelessWidget {
  const _BlueExtendedFab({
    required this.icon,
    required this.label,
    required this.onPressed,
  });

  final IconData icon;
  final String label;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    // Tạo “extended FAB” custom để có gradient + ripple đẹp.
    return Material(
      color: Colors.transparent,
      elevation: 8,
      shadowColor: const Color(0xFF0B5BD3).withOpacity(0.45),
      borderRadius: BorderRadius.circular(999),
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(999),
        child: Ink(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(999),
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF1A73E8), Color(0xFF3BA5FF)],
            ),
            border: Border.all(color: Colors.white.withOpacity(0.45), width: 1),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const SizedBox(width: 2),
              const Icon(
                Icons.chat_bubble_rounded,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              const Text(
                'Chat AI',
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.2,
                ),
              ),
              const SizedBox(width: 2),
            ],
          ),
        ),
      ),
    );
  }
}
