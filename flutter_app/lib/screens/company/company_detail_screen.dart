import 'package:flutter/material.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/services/company_service.dart';
import 'package:mobile/api/services/job_service.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
import 'package:mobile/screens/job/widgets/job_item_widget.dart';
import 'package:mobile/screens/profile/widgets/section_title.dart';
import 'package:mobile/utils/url_utils.dart';
import 'package:url_launcher/url_launcher.dart';

// Màu sắc chủ đạo mới (Xanh đậm, Trắng, Xám nhạt cho nền)
const Color kPrimaryColor = Color(0xFF1E88E5); // Blue 600
const Color kHeaderBackgroundColor = Color(0xFF1565C0); // Blue 800
const Color kLightBackgroundColor = Color(0xFFF5F5F5); // Grey 100
const double kExpandedHeaderHeight = 350.0;

class CompanyDetailScreen extends StatefulWidget {
  final int companyId;

  const CompanyDetailScreen({super.key, required this.companyId});

  @override
  State<CompanyDetailScreen> createState() => _CompanyDetailScreenState();
}

class _CompanyDetailScreenState extends State<CompanyDetailScreen> {
  late Future<CompanyModel> _companyFuture;
  late Future<List<JobModel>> _jobsFuture;

  @override
  void initState() {
    super.initState();
    _reload();
  }

  void _reload() {
    _companyFuture = CompanyService.fetchCompany(widget.companyId);
    _jobsFuture = JobService.fetchJobsByCompany(widget.companyId);
  }

  Future<void> _openWebsite(String? url) async {
    if (url == null || url.trim().isEmpty) return;

    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Không mở được website')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: kLightBackgroundColor,
        body: FutureBuilder<CompanyModel>(
          future: _companyFuture,
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
                      const Icon(
                        Icons.error_outline,
                        size: 40,
                        color: kPrimaryColor,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Không tải được thông tin công ty.\n${snap.error}',
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: () {
                          setState(_reload);
                        },
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                ),
              );
            }
            final company = snap.data;
            if (company == null) {
              return const Center(child: Text('Không tìm thấy công ty.'));
            }

            final logoUrl = fullUrl(company.logo);
            final coverUrl = fullUrl(company.coverImage);

            return NestedScrollView(
              headerSliverBuilder: (context, innerBoxIsScrolled) {
                return <Widget>[
                  SliverAppBar(
                    expandedHeight: kExpandedHeaderHeight,
                    floating: false,
                    pinned: true,
                    backgroundColor: kHeaderBackgroundColor,
                    foregroundColor: Colors.white,
                    elevation: innerBoxIsScrolled ? 4.0 : 0.0,
                    flexibleSpace: FlexibleSpaceBar(
                      collapseMode: CollapseMode.pin,
                      titlePadding: EdgeInsets.zero,
                      centerTitle: true,
                      background: _Header(
                        name: company.name,
                        logoUrl: logoUrl,
                        coverUrl: coverUrl,
                        child: const SizedBox(height: 70),
                      ),
                    ),
                    // tăng height để KHÔNG bị overflow
                    bottom: PreferredSize(
                      preferredSize: const Size.fromHeight(210.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Padding(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16.0,
                            ),
                            child: _InfoCard(
                              address: company.address,
                              employeeCountText: company.companySize,
                              responseRateText: null,
                              website: company.website,
                              onWebsiteTap: () => _openWebsite(company.website),
                            ),
                          ),
                          const SizedBox(height: 8),
                          Container(
                            color: Colors.white,
                            width: double.infinity,
                            child: TabBar(
                              labelColor: kPrimaryColor,
                              unselectedLabelColor: Colors.black54,
                              indicatorColor: kPrimaryColor,
                              indicatorWeight: 3,
                              labelStyle: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                              ),
                              tabs: [
                                const Tab(text: 'Thông tin'),
                                Tab(
                                  text:
                                      'Việc làm (${company.activeJobsCount ?? 0})',
                                ),
                              ],
                            ),
                          ),
                          const Divider(height: 1, color: Colors.grey),
                        ],
                      ),
                    ),
                  ),
                ];
              },
              body: TabBarView(
                children: [
                  _AboutTab(company: company),
                  _JobsTab(
                    company: company,
                    jobsFuture: _jobsFuture,
                    onReload: () {
                      setState(() {
                        _jobsFuture = JobService.fetchJobsByCompany(
                          widget.companyId,
                        );
                      });
                    },
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }
}

/* ================== Header ================== */

class _Header extends StatelessWidget {
  final String name;
  final String? logoUrl;
  final String? coverUrl;
  final Widget? child;

  const _Header({required this.name, this.logoUrl, this.coverUrl, this.child});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const double bannerHeight = 150.0;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Banner
        SizedBox(
          height: bannerHeight,
          child: (coverUrl == null || coverUrl!.isEmpty)
              ? Container(
                  color: kHeaderBackgroundColor,
                  child: const Center(
                    child: Icon(
                      Icons.apartment,
                      size: 48,
                      color: Colors.white70,
                    ),
                  ),
                )
              : Image.network(
                  coverUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: kHeaderBackgroundColor,
                    child: const Center(
                      child: Icon(
                        Icons.apartment,
                        size: 48,
                        color: Colors.white70,
                      ),
                    ),
                  ),
                ),
        ),
        // Logo + tên công ty
        Stack(
          clipBehavior: Clip.none,
          alignment: Alignment.topCenter,
          children: [
            Container(
              color: kHeaderBackgroundColor,
              height: 100,
              padding: const EdgeInsets.only(top: 60),
              width: double.infinity,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Text(
                  name,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
              ),
            ),
            Transform.translate(
              offset: const Offset(0, -52),
              child: Container(
                width: 104,
                height: 104,
                padding: const EdgeInsets.all(4),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 4),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 15,
                      offset: const Offset(0, 6),
                    ),
                  ],
                ),
                child: ClipOval(
                  child: (logoUrl == null || logoUrl!.isEmpty)
                      ? const Icon(
                          Icons.business,
                          size: 48,
                          color: Colors.black26,
                        )
                      : Image.network(
                          logoUrl!,
                          fit: BoxFit.contain,
                          errorBuilder: (_, __, ___) => const Icon(
                            Icons.business,
                            size: 48,
                            color: Colors.black26,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
        if (child != null) child!,
      ],
    );
  }
}

/* ================== Info card ================== */

class _InfoCard extends StatelessWidget {
  final String? address;
  final String? employeeCountText;
  final String? responseRateText;
  final String? website;
  final VoidCallback onWebsiteTap;

  const _InfoCard({
    required this.address,
    required this.employeeCountText,
    required this.responseRateText,
    required this.website,
    required this.onWebsiteTap,
  });

  @override
  Widget build(BuildContext context) {
    final addressText = address ?? 'Đang cập nhật';
    final employee = employeeCountText ?? 'Đang cập nhật';
    final response = responseRateText ?? 'Đang cập nhật';

    Widget _buildRow({
      required IconData icon,
      required String text,
      VoidCallback? onTap,
    }) {
      final row = Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: kPrimaryColor),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 15, color: Colors.black87),
            ),
          ),
          if (onTap != null)
            const Padding(
              padding: EdgeInsets.only(left: 8.0),
              child: Icon(Icons.chevron_right, size: 20, color: Colors.black54),
            ),
        ],
      );

      if (onTap != null) {
        return InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 8.0),
            child: row,
          ),
        );
      }

      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 8.0),
        child: row,
      );
    }

    return Container(
      margin: const EdgeInsets.only(top: 8, bottom: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildRow(icon: Icons.location_on_outlined, text: addressText),
          _buildRow(icon: Icons.groups_outlined, text: employee),
          _buildRow(icon: Icons.access_time_outlined, text: response),
          if (website != null && website!.trim().isNotEmpty)
            _buildRow(
              icon: Icons.language,
              text: website!,
              onTap: onWebsiteTap,
            ),
        ],
      ),
    );
  }
}

/* ================== Tab 1: Thông tin ================== */

class _AboutTab extends StatelessWidget {
  final CompanyModel company;

  const _AboutTab({required this.company});

  @override
  Widget build(BuildContext context) {
    final description =
        (company.description ?? 'Chưa có nội dung giới thiệu cho công ty này.')
            .trim();

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionTitle(title: 'Giới thiệu công ty'),
          const SizedBox(height: 8),
          Text(
            description.isEmpty ? '—' : description,
            style: const TextStyle(
              fontSize: 15,
              height: 1.6,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 16),
          if ((company.industryTitle ?? '').isNotEmpty) ...[
            const SectionTitle(title: 'Ngành nghề'),
            const SizedBox(height: 8),
            Text(
              company.industryTitle!,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 16),
          ],
          if ((company.locationName ?? '').isNotEmpty) ...[
            const SectionTitle(title: 'Khu vực'),
            const SizedBox(height: 8),
            Text(
              company.locationName!,
              style: const TextStyle(
                fontSize: 15,
                height: 1.4,
                color: Colors.black87,
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/* ================== Tab 2: Việc làm ================== */

class _JobsTab extends StatelessWidget {
  final CompanyModel company;
  final Future<List<JobModel>> jobsFuture;
  final VoidCallback onReload;

  const _JobsTab({
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
                  const Icon(
                    Icons.error_outline,
                    size: 40,
                    color: kPrimaryColor,
                  ),
                  const SizedBox(height: 8),
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
