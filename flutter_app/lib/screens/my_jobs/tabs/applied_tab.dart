import 'package:flutter/material.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/screens/my_jobs/widgets/apply_card.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';

class AppliedTab extends StatelessWidget {
  const AppliedTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<MyJobsProvider>(
      builder: (context, p, _) {
        final items = p.applied;

        if (p.isAppliedLoading && items.isEmpty) {
          return const _ListSkeleton();
        }
        if (items.isEmpty) {
          return const _EmptyState(
            icon: Icons.assignment_turned_in_outlined,
            title: 'Chưa có hồ sơ ứng tuyển',
            subtitle:
                'Nhấn nút “Ứng tuyển” trong chi tiết công việc để lưu tại đây.',
          );
        }

        return RefreshIndicator(
          onRefresh: p.refreshApplied,
          child: ListView.separated(
            controller: p.appliedScroll,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            itemCount: items.length + (p.isAppliedMore ? 1 : 0),
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              if (i >= items.length) return const _LoadingMore();
              final a = items[i];

              return InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => p.openJobDetail(context, a.jobId, true, a.status),
                child: AppliedCard(
                  logo: a.companyLogo,
                  title: a.jobTitle,
                  companyLine: a.companyName,
                  salary: a.salaryRange ?? '—',
                  location: a.location ?? '—',
                  endDateText: _fmtDate(a.endDate),
                  statusText: a.status ?? 'Đã ứng tuyển',
                  onViewProfile: () {
                    // TODO: xử lý sau
                  },
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 80, 16, 120),
      child: Column(
        children: [
          Icon(icon, size: 56, color: Colors.black26),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.black54),
          ),
        ],
      ),
    );
  }
}

class _ListSkeleton extends StatelessWidget {
  const _ListSkeleton();
  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      itemBuilder: (_, __) => Container(
        height: 96,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemCount: 6,
    );
  }
}

class _LoadingMore extends StatelessWidget {
  const _LoadingMore();
  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.symmetric(vertical: 16),
      child: Center(child: CircularProgressIndicator()),
    );
  }
}

String _fmtDate(DateTime? dt) {
  if (dt == null) return '—';
  final d = dt.day.toString().padLeft(2, '0');
  final m = dt.month.toString().padLeft(2, '0');
  final y = dt.year.toString();
  return '$d/$m/$y';
}
