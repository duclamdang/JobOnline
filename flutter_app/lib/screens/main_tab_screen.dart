import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:mobile/screens/job/job_list_screen.dart';
import 'package:mobile/screens/my_jobs/my_jobs_screen.dart';
import 'package:mobile/screens/profile/profile_screen.dart';
import 'package:mobile/widgets/common/draggable_fab.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/screens/chat/chat_box.dart';

class MainTabScreen extends StatefulWidget {
  const MainTabScreen({super.key});

  @override
  State<MainTabScreen> createState() => _MainTabScreenState();
}

class _MainTabScreenState extends State<MainTabScreen> {
  int _currentIndex = 0;
  final _tabKeys = <GlobalKey<NavigatorState>>[
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
    GlobalKey<NavigatorState>(),
  ];

  List<Widget> get _rootPages => const [
    JobListScreen(),
    MyJobsScreen(),
    ProfileScreen(),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_currentIndex == 1 && mounted) {
        context.read<MyJobsProvider>().ensureLoaded(context);
      }
    });
  }

  Future<bool> _onWillPop() async {
    final nav = _tabKeys[_currentIndex].currentState!;
    if (nav.canPop()) {
      nav.pop();
      return false;
    }
    return true;
  }

  void _onTap(int i) {
    if (_currentIndex == i) {
      final nav = _tabKeys[i].currentState!;
      while (nav.canPop()) {
        nav.pop();
      }
    } else {
      setState(() => _currentIndex = i);
    }
    if (i == 1) {
      Future.microtask(
        // ignore: use_build_context_synchronously
        () => context.read<MyJobsProvider>().ensureLoaded(context),
      );
    }
  }

  BottomNavigationBarItem _item({
    required IconData icon,
    required String label,
  }) => BottomNavigationBarItem(icon: Icon(icon), label: label);

  void _openChatSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) =>
          const FractionallySizedBox(heightFactor: 0.85, child: ChatBox()),
    );
  }

  @override
  Widget build(BuildContext context) {
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark);

    // ignore: deprecated_member_use
    return WillPopScope(
      onWillPop: _onWillPop,
      child: Scaffold(
        backgroundColor: Colors.grey.shade100,
        body: Stack(
          children: [
            Positioned.fill(
              child: IndexedStack(
                index: _currentIndex,
                children: List.generate(_rootPages.length, (i) {
                  return _TabNavigator(
                    navigatorKey: _tabKeys[i],
                    root: _rootPages[i],
                  );
                }),
              ),
            ),

            DraggableFab(
              heroTag: 'ai-fab',
              diameter: 56,
              initialOffset: const Offset(16, 240),
              onPressed: _openChatSheet,
            ),
          ],
        ),
        bottomNavigationBar: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: _onTap,
          type: BottomNavigationBarType.fixed,
          selectedItemColor: Colors.blue,
          unselectedItemColor: Colors.grey,
          showUnselectedLabels: true,
          items: [
            _item(icon: Icons.home_rounded, label: 'Khám phá'),
            _item(icon: Icons.work_outline_rounded, label: 'Việc của tôi'),
            _item(icon: Icons.person_outline_rounded, label: 'Tài khoản'),
          ],
        ),
      ),
    );
  }
}

class _TabNavigator extends StatelessWidget {
  final GlobalKey<NavigatorState> navigatorKey;
  final Widget root;

  const _TabNavigator({required this.navigatorKey, required this.root});

  @override
  Widget build(BuildContext context) {
    return Navigator(
      key: navigatorKey,
      onGenerateRoute: (settings) {
        return MaterialPageRoute(builder: (_) => root, settings: settings);
      },
    );
  }
}
