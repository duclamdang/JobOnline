import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:mobile/api/services/api_service.dart';

class AppNotification {
  final int id;
  final String title;
  final String body;
  final Map<String, dynamic>? data;
  bool isRead;
  final DateTime createdAt;

  AppNotification({
    required this.id,
    required this.title,
    required this.body,
    this.data,
    required this.isRead,
    required this.createdAt,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: (json['id'] as num).toInt(),
      title: json['title'] as String? ?? '',
      body: json['body'] as String? ?? '',
      data: json['data'] != null
          ? Map<String, dynamic>.from(json['data'] as Map)
          : null,
      isRead: json['is_read'] as bool? ?? false,
      createdAt:
          DateTime.tryParse(json['created_at'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class NotificationsProvider extends ChangeNotifier {
  final List<AppNotification> _items = [];
  bool isLoading = false;

  List<AppNotification> get items => List.unmodifiable(_items);
  int get unreadCount => _items.where((e) => !e.isRead).length;

  /// Load từ API
  Future<void> fetch() async {
    if (isLoading) return;
    isLoading = true;
    notifyListeners();

    try {
      final res = await ApiService.get<Map<String, dynamic>>(
        '/user/notifications',
        parser: (json) => Map<String, dynamic>.from(json as Map),
      );

      final data = res['data'];
      final List list = data is Map && data['data'] is List
          ? data['data'] as List
          : (data as List? ?? []);

      _items
        ..clear()
        ..addAll(
          list
              .map(
                (e) => AppNotification.fromJson(
                  Map<String, dynamic>.from(e as Map),
                ),
              )
              .toList(),
        );
    } catch (e) {
      if (kDebugMode) print('fetch notifications error: $e');
    } finally {
      isLoading = false;
      notifyListeners();
    }
  }

  /// Gọi khi FCM tới để thêm ngay vào list (không cần chờ gọi API)
  void addFromRemoteMessage(RemoteMessage message) {
    final title =
        message.notification?.title ?? message.data['title'] ?? 'Thông báo';
    final body = message.notification?.body ?? message.data['body'] ?? '';

    final item = AppNotification(
      id: DateTime.now().millisecondsSinceEpoch, // tạm id local
      title: title,
      body: body,
      data: message.data.isEmpty ? null : message.data,
      isRead: false,
      createdAt: DateTime.now(),
    );

    _items.insert(0, item);
    notifyListeners();
  }

  Future<void> markAllRead() async {
    try {
      await ApiService.post('/user/notifications/mark-all-read');
      for (final n in _items) {
        n.isRead = true;
      }
      notifyListeners();
    } catch (e) {
      if (kDebugMode) print('markAllRead error: $e');
    }
  }

  void clearLocal() {
    _items.clear();
    notifyListeners();
  }
}
