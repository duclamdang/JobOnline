import 'package:flutter/material.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class LogoutSettingItem extends StatefulWidget {
  const LogoutSettingItem({super.key});

  @override
  State<LogoutSettingItem> createState() => _LogoutSettingItemState();
}

class _LogoutSettingItemState extends State<LogoutSettingItem> {
  bool _processing = false;

  Future<void> _handleLogout() async {
    final ok = await showLogoutDialogMaterial(context);
    if (!ok) return;

    setState(() => _processing = true);
    try {
      // ignore: use_build_context_synchronously
      await context.read<AuthProvider>().logout();
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã đăng xuất')));
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Đăng xuất lỗi: $e')));
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: _processing ? null : _handleLogout,
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          // ignore: deprecated_member_use
          color: Colors.redAccent.withOpacity(0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: const Icon(Icons.logout, color: Colors.redAccent),
      ),
      title: const Text(
        'Đăng xuất',
        style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w500),
      ),
      trailing: _processing
          ? const SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : const Icon(Icons.chevron_right),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12),
    );
  }
}

/// Dialog Material “xịn”
Future<bool> showLogoutDialogMaterial(BuildContext context) async {
  final result = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      titlePadding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
      contentPadding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
      actionsPadding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      title: Row(
        children: const [
          CircleAvatar(
            radius: 18,
            backgroundColor: Color(0xFFFFEBEE),
            child: Icon(Icons.logout, color: Color(0xFFD32F2F)),
          ),
          SizedBox(width: 10),
          Text('Đăng xuất', style: TextStyle(fontWeight: FontWeight.w800)),
        ],
      ),
      content: const Text(
        'Bạn có chắc chắn muốn đăng xuất?',
        style: TextStyle(color: Colors.black54),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Huỷ'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Đăng xuất'),
        ),
      ],
    ),
  );
  return result ?? false;
}
