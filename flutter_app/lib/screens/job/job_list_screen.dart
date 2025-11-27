import 'package:flutter/material.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/providers/notifications_provider.dart';
import 'package:mobile/screens/auth/login_screen.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
import 'package:mobile/screens/notification/notification_screen.dart';
import 'package:mobile/screens/search/job_search_screen.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/job_provider.dart';
import 'package:mobile/screens/job/widgets/job_item_widget.dart';
import 'package:mobile/screens/job/widgets/header_search.dart';

class JobListScreen extends StatefulWidget {
  const JobListScreen({super.key});

  @override
  State<JobListScreen> createState() => _JobListScreenState();
}

class _JobListScreenState extends State<JobListScreen> {
  final _scrollController = ScrollController();
  final _searchCtrl = TextEditingController();
  bool _initialized = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!_initialized) {
        _initialized = true;
        await context.read<JobProvider>().fetchFirstPage();
        // ignore: use_build_context_synchronously
        await context.read<MyJobsProvider>().ensureLoaded(context);
      }
    });

    _scrollController.addListener(() {
      final p = context.read<JobProvider>();
      if (!p.isLoading &&
          !p.isLoadingMore &&
          p.hasMore &&
          _scrollController.position.pixels >=
              _scrollController.position.maxScrollExtent - 300) {
        p.fetchNextPage();
      }
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _onRefresh() async {
    await context.read<JobProvider>().fetchFirstPage();
    // ignore: use_build_context_synchronously
    await context.read<MyJobsProvider>().refreshSaved();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: SafeArea(
        child: Column(
          children: [
            HeaderSearch(
              onSearch: () {
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const JobSearchScreen()),
                );
              },
              onBellTap: () async {
                final noti = context.read<NotificationsProvider>();
                await noti.fetch();
                // ignore: use_build_context_synchronously
                Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => const NotificationScreen()),
                );
              },
            ),
            const SizedBox(height: 8),

            Expanded(
              child: Consumer<JobProvider>(
                builder: (context, provider, _) {
                  if (provider.isLoading && provider.jobs.isEmpty) {
                    return const Center(child: CircularProgressIndicator());
                  }

                  if (provider.jobs.isEmpty) {
                    return RefreshIndicator(
                      onRefresh: _onRefresh,
                      child: ListView(
                        children: const [
                          SizedBox(height: 140),
                          Center(child: Text("Không có công việc nào.")),
                        ],
                      ),
                    );
                  }

                  return RefreshIndicator(
                    onRefresh: _onRefresh,
                    child: ListView.separated(
                      controller: _scrollController,
                      padding: const EdgeInsets.all(16),
                      itemCount:
                          provider.jobs.length +
                          (provider.isLoadingMore ? 1 : 0),
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        if (index >= provider.jobs.length) {
                          return const Padding(
                            padding: EdgeInsets.symmetric(vertical: 16),
                            child: Center(child: CircularProgressIndicator()),
                          );
                        }

                        final job = provider.jobs[index];
                        final remainingDays = job.deadline ?? 0;

                        return Selector<MyJobsProvider, (bool, bool)>(
                          selector: (_, p) =>
                              (p.isSaved(job.id), p.isSavedLoading),
                          builder: (context, tuple, _) {
                            final (isFav, savedLoading) = tuple;
                            context.read<MyJobsProvider>();

                            return JobItemWidget(
                              title: job.title,
                              company: job.companyName,
                              salary: job.salaryRange,
                              location: job.location,
                              remainingDays: remainingDays,
                              urgent:
                                  job.isUrgent == '1' || job.isUrgent == 'true',
                              imageUrl: job.companyLogo is Uri
                                  ? job.companyLogo.toString()
                                  : job.companyLogo,
                              isFavorite: isFav,
                              onFavoriteTap: savedLoading
                                  ? null
                                  : () async {
                                      final auth = context.read<AuthProvider>();
                                      if (!auth.isLoggedIn) {
                                        Navigator.of(context).push(
                                          MaterialPageRoute(
                                            builder: (_) => const LoginScreen(),
                                          ),
                                        );
                                        return;
                                      }

                                      final my = context.read<MyJobsProvider>();
                                      try {
                                        await my.toggleSave(job.id);
                                        if (!context.mounted) return;
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(
                                            content: Text(
                                              isFav
                                                  ? 'Đã bỏ lưu'
                                                  : 'Đã lưu công việc',
                                            ),
                                          ),
                                        );
                                      } catch (e) {
                                        if (!context.mounted) return;
                                        ScaffoldMessenger.of(
                                          context,
                                        ).showSnackBar(
                                          SnackBar(content: Text('Lỗi: $e')),
                                        );
                                      }
                                    },
                              onTap: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) =>
                                        JobDetailScreen(jobId: job.id),
                                  ),
                                );
                              },
                            );
                          },
                        );
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
