import 'package:flutter/material.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
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
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      body: SafeArea(
        child: Column(
          children: [
            HeaderSearch(
              controller: _searchCtrl,
              onSearch: () => context.read<JobProvider>().fetchFirstPage(),
              onBellTap: () {},
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

                        return JobItemWidget(
                          title: job.title,
                          company: job.companyName,
                          salary: job.salaryRange,
                          location: job.location,
                          remainingDays: remainingDays,
                          urgent: job.isUrgent == '1' || job.isUrgent == 'true',
                          imageUrl: job.companyLogo,
                          isFavorite: false,
                          onFavoriteTap: () {},
                          onTap: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => JobDetailScreen(jobId: job.id),
                              ),
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
