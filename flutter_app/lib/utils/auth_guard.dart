import 'package:flutter/material.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/screens/auth/login_screen.dart';

/// Trả về true nếu đã đăng nhập (hoặc login thành công), false nếu người dùng huỷ.
Future<bool> requireLogin(BuildContext context) async {
  final auth = context.read<AuthProvider>();
  if (auth.isLoggedIn) return true;

  final ok = await Navigator.of(
    context,
    rootNavigator: true,
  ).push<bool>(MaterialPageRoute(builder: (_) => const LoginScreen()));

  // ignore: use_build_context_synchronously
  return ok == true && context.read<AuthProvider>().isLoggedIn;
}
