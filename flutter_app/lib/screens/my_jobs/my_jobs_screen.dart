import 'package:flutter/material.dart';
import 'package:mobile/screens/my_jobs/tabs/applied_tab.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/my_jobs_provider.dart';

class MyJobsScreen extends StatefulWidget {
  const MyJobsScreen({super.key});

  @override
  State<MyJobsScreen> createState() => _MyJobsScreenState();
}

class _MyJobsScreenState extends State<MyJobsScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<MyJobsProvider>().ensureLoaded(context);
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      context.read<MyJobsProvider>().ensureLoaded(context);
    });
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        elevation: 0,
        backgroundColor: const Color(0xFF6A8BFF),
        foregroundColor: Colors.white,
        title: const Text('Việc của tôi'),
        bottom: TabBar(
          controller: _tab,
          indicatorColor: Colors.white,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: const [
            Tab(text: 'Đã ứng tuyển'),
            Tab(text: 'Đã lưu'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tab,
        children: const [AppliedTab(), _SavedTab()],
      ),
    );
  }
}

/* ------------------ TAB: ĐÃ LƯU ------------------ */

class _SavedTab extends StatelessWidget {
  const _SavedTab();

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
            icon: Icons.bookmark_border,
            title: 'Chưa có việc làm đã lưu',
            subtitle:
                'Nhấn biểu tượng “Lưu” ở danh sách hoặc chi tiết công việc.',
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

              final s = items[i];
              final j = s.job;
              return JobMiniCard(
                logo: j.companyLogo,
                title: j.title,
                company: j.companyName,
                salary: j.salaryRange,
                location: j.location,
                trailing: IconButton(
                  icon: const Icon(Icons.bookmark_remove_outlined),
                  onPressed: () => p.unsave(j.id),
                  tooltip: 'Bỏ lưu',
                ),
                onTap: () {},
              );
            },
          ),
        );
      },
    );
  }
}

/* ------------------ REUSABLE WIDGETS ------------------ */

class JobMiniCard extends StatelessWidget {
  final String title;
  final String company;
  final String salary;
  final String location;
  final String? logo;
  final Widget? trailing;
  final VoidCallback? onTap;

  const JobMiniCard({
    super.key,
    required this.title,
    required this.company,
    required this.salary,
    required this.location,
    this.logo,
    this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final showSalary = salary.trim().isNotEmpty;
    final showLocation = location.trim().isNotEmpty;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            _CompanyLogo(url: logo),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    company,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.black54),
                  ),
                  if (showSalary) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(
                          Icons.paid_outlined,
                          size: 16,
                          color: Colors.deepPurple,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            salary,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                  if (showLocation) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.place_outlined,
                          size: 16,
                          color: Colors.deepPurple,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            if (trailing != null) const SizedBox(width: 8),
            trailing ?? const SizedBox.shrink(),
          ],
        ),
      ),
    );
  }
}

class _CompanyLogo extends StatelessWidget {
  final String? url;
  const _CompanyLogo({this.url});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 56,
        height: 56,
        color: Colors.grey.shade200,
        child: (url == null || url!.isEmpty)
            ? const Icon(Icons.apartment_outlined, color: Colors.grey)
            : Image.network(
                url!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.broken_image_outlined, color: Colors.grey),
              ),
      ),
    );
  }
}

// ignore: unused_element
class _StatusChip extends StatelessWidget {
  final String text;
  const _StatusChip({required this.text});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.indigo.shade50,
        borderRadius: BorderRadius.circular(999),
        border: Border.all(color: Colors.indigo.shade200),
      ),
      child: Text(text, style: const TextStyle(fontSize: 12)),
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
