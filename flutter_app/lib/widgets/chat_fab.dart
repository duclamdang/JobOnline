import 'package:flutter/material.dart';
import '../screens/chat/chat_box.dart';

class ChatFab extends StatelessWidget {
  const ChatFab({super.key});

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      icon: const Icon(Icons.chat_bubble_outline),
      label: const Text('Chat AI'),
      onPressed: () {
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          useSafeArea: true,
          backgroundColor: Theme.of(context).scaffoldBackgroundColor,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
          ),
          builder: (_) => DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.75, // mở ra ~75% màn hình
            minChildSize: 0.4,
            maxChildSize: 0.95,
            builder: (_, controller) {
              // Bọc ChatBox trong SingleChildScrollView để sheet kéo mượt
              return SingleChildScrollView(
                controller: controller,
                child: const SizedBox(
                  height: 0, // placeholder để controller hoạt động
                  child: null,
                ),
              );
            },
          ),
        );

        // gọi lại bottom sheet với ChatBox; cách này giữ UI gọn gàng
        Future.microtask(() {
          Navigator.of(context).pop();
          showModalBottomSheet(
            context: context,
            isScrollControlled: true,
            useSafeArea: true,
            backgroundColor: Theme.of(context).scaffoldBackgroundColor,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
            ),
            builder: (_) =>
                FractionallySizedBox(heightFactor: 0.8, child: const ChatBox()),
          );
        });
      },
    );
  }
}
