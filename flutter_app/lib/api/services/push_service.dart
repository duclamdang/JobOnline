// lib/services/push_service.dart
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

  static Future<void> _initLocalNoti() async {
    if (_localInitialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );

    const initSettings = InitializationSettings(android: androidSettings);

    await _localNoti.initialize(initSettings);
    _localInitialized = true;
  }

  static Future<void> initAndRegisterToken() async {
    await _initLocalNoti();

    final settings = await _fcm.requestPermission();
    debugPrint('FCM permission: ${settings.authorizationStatus}');

    final token = await _fcm.getToken();
    debugPrint('FCM TOKEN HIỆN TẠI: $token');

    if (token != null) {
      try {
        final res = await ApiService.post<dynamic>(
          '/user/device/register',
          body: {'device_token': token, 'platform': 'android'},
          parser: (json) => json,
        );
        debugPrint('Register device OK: $res');
      } catch (e) {
        debugPrint('Register device ERROR: $e');
      }
    }

    _fcm.onTokenRefresh.listen((newToken) async {
      debugPrint('FCM TOKEN MỚI: $newToken');

      try {
        final res = await ApiService.post<dynamic>(
          '/user/device/register',
          body: {'device_token': newToken, 'platform': 'android'},
          parser: (json) => json,
        );
        debugPrint('Register device (refresh) OK: $res');
      } catch (e) {
        debugPrint('Register device (refresh) ERROR: $e');
      }
    });
  }

  static void listenNotification() {
    FirebaseMessaging.onMessage.listen((RemoteMessage message) async {
      debugPrint('onMessage: ${message.messageId}');

      await _initLocalNoti();

      final noti = message.notification;
      final title =
          noti?.title ?? message.data['title']?.toString() ?? 'Thông báo';
      final body = noti?.body ?? message.data['body']?.toString() ?? '';

      const androidDetails = AndroidNotificationDetails(
        'jobonline_default_channel',
        'Thông báo JobOnline',
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

      final ctx = appNavigatorKey.currentContext;
      if (ctx != null) {
        ctx.read<NotificationsProvider>().addFromRemoteMessage(message);
      }
    });

    FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
      debugPrint('onMessageOpenedApp: ${message.messageId}');

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
