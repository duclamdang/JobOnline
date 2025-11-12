import 'package:flutter/material.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/screens/my_jobs/widgets/save_card.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';

class SavedTab extends StatelessWidget {
  const SavedTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<MyJobsProvider>(
      builder: (context, p, _) {
        final items = p.saved;

        if (p.isSavedLoading && items.isEmpty) {
          return const _ListSkeleton();
        }
        if (items.isEmpty) {
          return const _EmptyState(
            icon: Icons.assignment_turned_in_outlined,
            title: 'Chưa có hồ sơ lưu công việc',
            subtitle: 'Nhấn nút “Lưu” trong chi tiết công việc để lưu tại đây.',
          );
        }

        return RefreshIndicator(
          onRefresh: p.refreshSaved,
          child: ListView.separated(
            controller: p.savedScroll,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            itemCount: items.length + (p.isSavedMore ? 1 : 0),
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, i) {
              if (i >= items.length) return const _LoadingMore();
              final a = items[i];

              final endDateText = a.deadline == 0
                  ? 'Hết hạn'
                  : 'Còn ${a.deadline} ngày';

              return InkWell(
                borderRadius: BorderRadius.circular(12),
                onTap: () => p.openJobDetail(context, a.id, false, null),
                child: SavedCard(
                  logo: a.companyLogo,
                  title: a.title,
                  companyLine: a.companyName,
                  salary: a.salaryRange,
                  location: a.location,
                  endDateText: endDateText,
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
