import 'package:flutter/material.dart';
import 'package:mobile/screens/profile/widgets/logged_out_view.dart';
import 'package:mobile/screens/profile/widgets/logged_in_view.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final loggedIn = auth.isLoggedIn;
        return Scaffold(
          backgroundColor: Colors.grey.shade100,
          appBar: AppBar(
            backgroundColor: Colors.blue,
            foregroundColor: Colors.white,
            elevation: 0,
            title: const Text('Hồ sơ cá nhân'),
          ),
          body: loggedIn ? const LoggedInView() : const LoggedOutView(),
        );
      },
    );
  }
}
