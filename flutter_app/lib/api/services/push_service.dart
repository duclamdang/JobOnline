// lib/api/services/push_service.dart
import 'package:flutter/foundation.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import 'package:mobile/api/services/api_service.dart';

class PushService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;

  static final FlutterLocalNotificationsPlugin _localNoti =
      FlutterLocalNotificationsPlugin();

  static bool _initialized = false;

  static Future<void> _initLocalNoti() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const initSettings = InitializationSettings(android: androidSettings);

    await _localNoti.initialize(initSettings);
    _initialized = true;
  }

  /// Gọi sau khi login để xin quyền + gửi token lên server
  static Future<void> initAndRegisterToken(int userId) async {
    await _initLocalNoti();

    // Xin quyền
    final settings = await _fcm.requestPermission();
    if (settings.authorizationStatus == AuthorizationStatus.denied) {
      debugPrint('FCM permission denied');
    }

    // Lấy token
    final token = await _fcm.getToken();
    if (token != null) {
      await ApiService.post(
        '/user/device/register',
        body: {'device_token': token, 'platform': 'android'},
      );
    }

    // Lắng nghe token thay đổi
    _fcm.onTokenRefresh.listen((newToken) {
      ApiService.post(
        '/user/device/register',
        body: {'device_token': newToken, 'platform': 'android'},
      );
    });
  }

  /// Lắng nghe thông báo (gọi trong main)
  static void listenNotification() {
    // App đang mở
    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      await _initLocalNoti();

      final notification = message.notification;
      if (notification != null) {
        await _showLocalNotification(notification.title, notification.body);
      }
    });

    // User bấm vào notification
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('Notification clicked: ${message.data}');
    });
  }

  /// Hiển thị local notification
  static Future<void> _showLocalNotification(
    String? title,
    String? body,
  ) async {
    const androidDetails = AndroidNotificationDetails(
      'jobonline_channel',
      'JobOnline',
      importance: Importance.max,
      priority: Priority.high,
    );

    const notiDetails = NotificationDetails(android: androidDetails);

    await _localNoti.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title ?? 'Thông báo',
      body ?? '',
      notiDetails,
    );
  }
}
