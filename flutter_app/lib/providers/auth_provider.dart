// lib/providers/auth_provider.dart
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'package:mobile/api/models/user_model.dart';
import 'package:mobile/api/services/auth_service.dart';
import 'package:mobile/api/services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  bool isLoading = false;
  bool isLoggingOut = false;
  String? error;

  String? token;
  int? expiresIn;
  UserModel? currentUser;

  bool _initialized = false;

  bool get isInitialized => _initialized;
  bool get isLoggedIn => (token ?? '').isNotEmpty && currentUser != null;

  AuthProvider() {
    _loadFromStorage();
  }

  Future<void> _loadFromStorage() async {
    try {
      final sp = await SharedPreferences.getInstance();
      final savedToken = sp.getString('auth_token');
      final savedExpires = sp.getInt('auth_expires_in');
      final savedUser = sp.getString('auth_user');

      if (savedToken != null && savedUser != null) {
        try {
          final json = jsonDecode(savedUser) as Map<String, dynamic>;
          currentUser = UserModel.fromJson(json);
          token = savedToken;
          expiresIn = savedExpires;

          // set token cho ApiService để gọi API
          ApiService.setToken(savedToken);
        } catch (e) {
          if (kDebugMode) print('decode saved user error: $e');
          token = null;
          expiresIn = null;
          currentUser = null;
          ApiService.setToken(null);
        }
      }
    } catch (e) {
      if (kDebugMode) print('loadFromStorage error: $e');
    } finally {
      _initialized = true;
      notifyListeners();
    }
  }

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

      // lưu xuống SharedPreferences
      final sp = await SharedPreferences.getInstance();
      await sp.setString('auth_token', t);
      await sp.setInt('auth_expires_in', exp);
      await sp.setString('auth_user', jsonEncode(u.toJson()));

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
      // kể cả lỗi server vẫn cho logout local
      return false;
    } finally {
      token = null;
      expiresIn = null;
      currentUser = null;
      ApiService.setToken(null);

      final sp = await SharedPreferences.getInstance();
      await sp.remove('auth_token');
      await sp.remove('auth_expires_in');
      await sp.remove('auth_user');

      isLoggingOut = false;
      notifyListeners();
    }
  }
}
