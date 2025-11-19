import 'package:mobile/api/services/api_service.dart';
import 'package:mobile/api/models/user_model.dart';

class AuthService {
  static Future<(String token, int expiresIn, UserModel user)> login({
    required String account,
    required String password,
  }) async {
    final raw = await ApiService.post<Map<String, dynamic>>(
      '/user/login',
      body: {'account': account, 'password': password},
      parser: (json) => Map<String, dynamic>.from(json as Map),
    );
    final data = raw.containsKey('data')
        ? Map<String, dynamic>.from(raw['data'])
        : raw;

    final token = (data['access_token'] ?? data['token'] ?? '').toString();
    final expiresIn = (data['expires_in'] as num?)?.toInt() ?? 0;

    if (token.isEmpty) {
      throw 'Máy chủ không trả về access_token';
    }

    final userSrc = data['user'] ?? data['profile'] ?? {};
    final user = UserModel.fromJson({'data': userSrc});

    return (token, expiresIn, user);
  }

  static Future<void> logout() {
    return ApiService.post<dynamic>('/user/logout', parser: (_) => null);
  }

  static Future<void> register({
    required String name,
    String? phone,
    String? email,
    required String password,
    required String passwordConfirmation,
  }) async {
    final body = <String, dynamic>{
      'name': name.trim(),
      'password': password.trim(),
      'password_confirmation': passwordConfirmation.trim(),
    };

    if (phone != null && phone.trim().isNotEmpty) {
      body['phone'] = phone.trim();
    }
    if (email != null && email.trim().isNotEmpty) {
      body['email'] = email.trim();
    }

    await ApiService.post<dynamic>(
      '/user/register',
      body: body,
      parser: (_) => null,
    );
  }
}
