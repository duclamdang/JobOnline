// lib/api/services/auth_service.dart
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

    // HỖ TRỢ CẢ 2 KIỂU:
    // - ApiService đã unwrap -> raw = { user, access_token, expires_in }
    // - ApiService KHÔNG unwrap -> raw = { status_code, message, data: {...} }
    final data = raw.containsKey('data')
        ? Map<String, dynamic>.from(raw['data'])
        : raw;

    final token = (data['access_token'] ?? data['token'] ?? '').toString();
    final expiresIn = (data['expires_in'] as num?)?.toInt() ?? 0;

    if (token.isEmpty) {
      // Gợi ý debug: in ra để thấy cấu trúc thực tế
      // print('login response data: $data');
      throw 'Máy chủ không trả về access_token';
    }

    // user có thể đang nằm trong data['user'] hoặc data trực tiếp
    final userSrc = data['user'] ?? data['profile'] ?? {};
    final user = UserModel.fromJson({'data': userSrc});

    return (token, expiresIn, user);
  }

  static Future<void> logout() {
    return ApiService.post<dynamic>('/user/logout', parser: (_) => null);
  }
}
