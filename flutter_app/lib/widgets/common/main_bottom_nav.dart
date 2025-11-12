import 'package:flutter/material.dart';

class MainBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const MainBottomNav({
    Key? key,
    required this.currentIndex,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      selectedItemColor: Colors.blue,
      unselectedItemColor: Colors.black54,
      onTap: onTap,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.search), label: 'Việc làm'),
        BottomNavigationBarItem(icon: Icon(Icons.file_copy), label: 'CV & Profile'),
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Trang chủ'),
        BottomNavigationBarItem(icon: Icon(Icons.notifications), label: 'Thông báo'),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Tài khoản'),
      ],
    );
  }
}
