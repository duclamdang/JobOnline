import 'package:flutter/material.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/utils/auth_guard.dart';

class ProfileRoutes {
  static const editProfile = '/profile/edit';
  static const verifyAccount = '/profile/verify';
  static const faq = '/help/faq';
  static const comments = '/profile/comments';
  static const notifications = '/notifications';
}

class ProfileProvider extends ChangeNotifier {
  bool isLoading = false;
  String? error;

  String displayName(BuildContext context) =>
      context.read<AuthProvider>().currentUser?.name ?? '—';

  String email(BuildContext context) =>
      context.read<AuthProvider>().currentUser?.email ?? '—';

  String? avatarUrl(BuildContext context) =>
      context.read<AuthProvider>().currentUser?.avatar;

  bool isVerified(BuildContext context) =>
      context.read<AuthProvider>().currentUser?.isVerify ?? false;

  Future<void> logout(BuildContext context) async {
    await context.read<AuthProvider>().logout();
    Navigator.of(context).maybePop();
    notifyListeners();
  }

  Future<void> openEditProfile(BuildContext context) async {
    final ok = await requireLogin(context);
    if (!ok) return;
    Navigator.of(context).pushNamed(ProfileRoutes.editProfile);
  }

  Future<void> openVerifyAccount(BuildContext context) async {
    final ok = await requireLogin(context);
    if (!ok) return;
    Navigator.of(context).pushNamed(ProfileRoutes.verifyAccount);
  }

  Future<void> openFAQ(BuildContext context) async {
    Navigator.of(context).pushNamed(ProfileRoutes.faq);
  }

  Future<void> openComments(BuildContext context) async {
    final ok = await requireLogin(context);
    if (!ok) return;
    Navigator.of(context).pushNamed(ProfileRoutes.comments);
  }

  Future<void> openNotifications(BuildContext context) async {
    final ok = await requireLogin(context);
    if (!ok) return;
    Navigator.of(context).pushNamed(ProfileRoutes.notifications);
  }
}
