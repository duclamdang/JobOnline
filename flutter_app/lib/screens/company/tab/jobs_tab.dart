import 'package:flutter/material.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
import 'package:mobile/screens/job/widgets/job_item_widget.dart';

class JobsTab extends StatelessWidget {
  final CompanyModel company;
  final Future<List<JobModel>> jobsFuture;
  final VoidCallback onReload;

  const JobsTab({
    super.key,
    required this.company,
    required this.jobsFuture,
    required this.onReload,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<JobModel>>(
      future: jobsFuture,
      builder: (context, snap) {
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snap.hasError) {
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, size: 40, color: Colors.blue),
                  Text(
                    'Không tải được danh sách việc làm.\n${snap.error}',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Colors.black54),
                  ),
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: onReload,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            ),
          );
        }

        final jobs = snap.data ?? const <JobModel>[];
        if (jobs.isEmpty) {
          return SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
            child: Center(
              child: Text(
                'Hiện tại ${company.name} chưa đăng tin tuyển dụng nào.',
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54),
              ),
            ),
          );
        }

        return ListView.separated(
          key: const PageStorageKey<String>('JobsList'),
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          itemCount: jobs.length,
          separatorBuilder: (_, __) => const SizedBox(height: 12),
          itemBuilder: (context, i) {
            final job = jobs[i];
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
                    builder: (_) =>
                        JobDetailScreen(jobId: job.id, initialApplied: false),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }
}
