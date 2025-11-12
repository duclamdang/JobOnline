// lib/providers/auth_provider.dart
import 'package:flutter/foundation.dart';
import 'package:mobile/api/models/user_model.dart';
import 'package:mobile/api/services/auth_service.dart';
import 'package:mobile/api/services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool isLoading = false; // cho login
  bool isLoggingOut = false; // cho logout
  String? error;

  String? token;
  int? expiresIn;
  UserModel? currentUser;

  bool get isLoggedIn => (token ?? '').isNotEmpty;

  Future<bool> login(String account, String password) async {
    if (isLoading) return false;
    isLoading = true;
    error = null;
    notifyListeners();

    try {
      final (t, exp, u) = await AuthService.login(
        account: account,
        password: password,
      );
      token = t;
      expiresIn = exp;
      currentUser = u;
      ApiService.setToken(t);
      return true;
    } catch (e) {
      error = e.toString();
      if (kDebugMode) print('login error: $e');
      return false;
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> logout() async {
    if (isLoggingOut) return false;
    isLoggingOut = true;
    notifyListeners();

    try {
      await AuthService.logout();
      return true;
    } catch (e) {
      if (kDebugMode) print('logout error: $e');
      return false;
    } finally {
      token = null;
      expiresIn = null;
      currentUser = null;
      ApiService.setToken(null);
      isLoggingOut = false;
      notifyListeners();
    }
  }
}
