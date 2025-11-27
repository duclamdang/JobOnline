import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';

import 'package:mobile/api/services/api_service.dart';
import 'package:mobile/app_navigator.dart';
import 'package:mobile/providers/notifications_provider.dart';
import 'package:mobile/screens/notification/notification_screen.dart';

class PushService {
  static final FirebaseMessaging _fcm = FirebaseMessaging.instance;
  static final FlutterLocalNotificationsPlugin _localNoti =
      FlutterLocalNotificationsPlugin();

  static bool _localInitialized = false;

  /// Khởi tạo flutter_local_notifications (chỉ làm 1 lần)
  static Future<void> _initLocalNoti() async {
    if (_localInitialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );

    const initSettings = InitializationSettings(android: androidSettings);

    await _localNoti.initialize(initSettings);
    _localInitialized = true;
  }

  /// Gọi sau khi LOGIN thành công để:
  /// - Xin quyền thông báo
  /// - Lấy FCM token
  /// - Gửi token lên server (/user/device/register)
  static Future<void> initAndRegisterToken() async {
    await _initLocalNoti();

    // Xin quyền (Android 13+ bắt buộc)
    final settings = await _fcm.requestPermission();
    debugPrint('FCM permission: ${settings.authorizationStatus}');

    // Lấy token hiện tại
    final token = await _fcm.getToken();
    debugPrint('🔥 FCM TOKEN HIỆN TẠI: $token');

    if (token != null) {
      await ApiService.post(
        '/user/device/register',
        body: {'device_token': token, 'platform': 'android'},
      );
    }

    // Khi token refresh (cài lại app, clear data, ...)
    _fcm.onTokenRefresh.listen((newToken) async {
      debugPrint('🔥 FCM TOKEN MỚI: $newToken');
      await ApiService.post(
        '/user/device/register',
        body: {'device_token': newToken, 'platform': 'android'},
      );
    });
  }

  /// Lắng nghe thông báo FCM (gọi trong main)
  static void listenNotification() {
    // App đang mở (foreground)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      debugPrint('📩 onMessage: ${message.messageId}');

      await _initLocalNoti();

      final noti = message.notification;
      final title =
          noti?.title ?? message.data['title']?.toString() ?? 'Thông báo';
      final body = noti?.body ?? message.data['body']?.toString() ?? '';

      // Hiện local notification
      const androidDetails = AndroidNotificationDetails(
        'jobonline_default_channel', // id kênh
        'Thông báo JobOnline', // tên kênh
        channelDescription: 'Thông báo ứng tuyển, trạng thái hồ sơ',
        importance: Importance.max,
        priority: Priority.high,
      );

      const notiDetails = NotificationDetails(android: androidDetails);

      await _localNoti.show(
        DateTime.now().millisecondsSinceEpoch ~/ 1000,
        title,
        body,
        notiDetails,
      );

      // Cập nhật badge trong app
      final ctx = appNavigatorKey.currentContext;
      if (ctx != null) {
        ctx.read<NotificationsProvider>().addFromRemoteMessage(message);
      }
    });

    // User bấm vào notification (từ system tray)
    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('📩 onMessageOpenedApp: ${message.messageId}');

      final ctx = appNavigatorKey.currentContext;
      if (ctx != null) {
        ctx.read<NotificationsProvider>().addFromRemoteMessage(message);

        Navigator.of(
          ctx,
        ).push(MaterialPageRoute(builder: (_) => const NotificationScreen()));
      }
    });
  }
}
