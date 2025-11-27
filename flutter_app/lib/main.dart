// lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';

import 'package:mobile/api/services/push_service.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/company_provider.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/providers/profile_provider.dart';
import 'package:mobile/providers/job_provider.dart';
import 'package:mobile/screens/main_tab_screen.dart';

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  PushService.listenNotification();

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider<JobProvider>(create: (_) => JobProvider()),
        ChangeNotifierProvider<CompanyProvider>(
          create: (_) => CompanyProvider(),
        ),
        ChangeNotifierProvider<AuthProvider>(create: (_) => AuthProvider()),
        ChangeNotifierProvider<MyJobsProvider>(create: (_) => MyJobsProvider()),
        ChangeNotifierProvider<ProfileProvider>(
          create: (_) => ProfileProvider(),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        if (!auth.isInitialized) {
          return const MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(body: Center(child: CircularProgressIndicator())),
          );
        }

        return const MaterialApp(
          debugShowCheckedModeBanner: false,
          title: 'JobOnline',
          home: MainTabScreen(),
        );
      },
    );
  }
}
