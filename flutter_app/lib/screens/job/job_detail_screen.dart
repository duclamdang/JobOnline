import 'package:flutter/material.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/services/company_service.dart';
import 'package:mobile/screens/company/widgets/company_header.dart';
import 'package:mobile/screens/company/widgets/company_info_row.dart';
import 'package:mobile/screens/job/widgets/bottom_apply_bar.dart';
import 'package:mobile/screens/job/widgets/info_group.dart';
import 'package:mobile/screens/job/widgets/job_item_widget.dart';
import 'package:mobile/screens/job/widgets/top_card.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:mobile/providers/job_provider.dart';
import 'package:mobile/utils/auth_guard.dart';

class JobDetailScreen extends StatefulWidget {
  final int jobId;
  final bool initialApplied;
  final String? initialAppliedStatus;

  const JobDetailScreen({
    super.key,
    required this.jobId,
    this.initialApplied = false,
    this.initialAppliedStatus,
  });

  @override
  State<JobDetailScreen> createState() => _JobDetailScreenState();
}

class _JobDetailScreenState extends State<JobDetailScreen> {
  bool? _hasApplied; // null: chưa biết, true/false: đã xác định
  String? _appliedStatus;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<JobProvider>().fetchJobDetail(widget.jobId);
    });
    _hasApplied = widget.initialApplied;
    _appliedStatus = widget.initialAppliedStatus;
  }

  Future<void> _onRefresh() async {
    await context.read<JobProvider>().fetchJobDetail(widget.jobId);
  }

  // ====== BOTTOM BAR: đưa vào trong State để dùng được context/_hasApplied ======
  Widget _buildBottomBar(JobModel d) {
    final isActive = _asBool(d.isActive);

    if (!isActive) {
      return BottomApplyBar(
        isActive: false,
        onApply: () {},
        onSave: () async {
          final ok = await requireLogin(context);
          if (!ok) return;
          ScaffoldMessenger.of(
            context,
          ).showSnackBar(const SnackBar(content: Text('Đã lưu việc')));
        },
      );
    }

    // Đã ứng tuyển: hiện trạng thái + nút Xem hồ sơ
    if (_hasApplied == true) {
      return Card(
        margin: EdgeInsets.zero,
        elevation: 2,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        child: SafeArea(
          top: false,
          minimum: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Row(
            children: [
              const Icon(Icons.verified_outlined, color: Colors.green),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Trạng thái: ${_appliedStatus ?? "Đã ứng tuyển"}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    color: Colors.green,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: () {
                  // TODO: mở màn xem hồ sơ đã nộp
                },
                child: const Text('Xem hồ sơ'),
              ),
            ],
          ),
        ),
      );
    }

    // Chưa ứng tuyển: CTA mặc định
    return BottomApplyBar(
      isActive: true,
      onApply: () async {
        final ok = await requireLogin(context);
        if (!ok) return;

        // TODO: call API apply
        setState(() {
          _hasApplied = true;
          _appliedStatus = 'Đã ứng tuyển';
        });
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Ứng tuyển thành công')));
      },
      onSave: () async {
        final ok = await requireLogin(context);
        if (!ok) return;
        // TODO: call API save
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Đã lưu việc')));
      },
    );
  }
  // ============================================================================

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Consumer<JobProvider>(
        builder: (context, p, _) {
          final d = p.detail;

          if (p.isDetailLoading && d == null) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }
          if (p.detailError != null && d == null) {
            return Scaffold(
              body: Center(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 40,
                        color: Colors.blue,
                      ),
                      const SizedBox(height: 12),
                      Text(p.detailError!, textAlign: TextAlign.center),
                      const SizedBox(height: 12),
                      ElevatedButton(
                        onPressed: _onRefresh,
                        child: const Text('Thử lại'),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }
          if (d == null) {
            return const Scaffold(
              body: Center(child: Text('Không tìm thấy công việc.')),
            );
          }

          final remainedDays =
              d.deadline ?? _calcRemainingDaysFromString(d.endDate);

          return Scaffold(
            backgroundColor: Colors.grey.shade100,
            bottomNavigationBar: _buildBottomBar(d),
            body: RefreshIndicator(
              onRefresh: _onRefresh,
              child: NestedScrollView(
                headerSliverBuilder: (context, inner) => [
                  const SliverAppBar(
                    pinned: true,
                    backgroundColor: Colors.blue,
                    title: Text('Chi tiết công việc'),
                    actions: [
                      IconButton(icon: Icon(Icons.more_vert), onPressed: null),
                    ],
                    bottom: TabBar(
                      indicatorColor: Colors.white,
                      tabs: [
                        Tab(text: 'Thông tin'),
                        Tab(text: 'Việc làm liên quan'),
                        Tab(text: 'Công ty'),
                      ],
                    ),
                  ),
                ],
                body: TabBarView(
                  children: [
                    // -------- Tab 1: Thông tin ----------
                    SingleChildScrollView(
                      padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          TopCard(
                            urgentLabel: (d.isUrgent ?? '').isEmpty
                                ? null
                                : d.isUrgent,
                            logo: d.companyLogo,
                            title: d.title,
                            companyLine:
                                ((d.companyAddress ?? '').trim().isEmpty)
                                ? d.companyName
                                : '${d.companyName} - ${d.companyAddress}',
                            salary: d.salaryRange,
                            location: d.location,
                            quantity: d.quantity?.toString() ?? '—',
                          ),
                          const SizedBox(height: 16),
                          InfoGroup(
                            items: [
                              InfoItem(
                                icon: Icons.badge_outlined,
                                label: 'Kinh nghiệm',
                                value: d.workExperience ?? '—',
                              ),
                              InfoItem(
                                icon: Icons.work_outline,
                                label: 'Hình thức',
                                value: d.workingForm ?? '—',
                              ),
                              InfoItem(
                                icon: Icons.school_outlined,
                                label: 'Học vấn',
                                value: d.education ?? '—',
                              ),
                              InfoItem(
                                icon: Icons.leaderboard_outlined,
                                label: 'Cấp bậc',
                                value: d.position ?? '—',
                              ),
                              InfoItem(
                                icon: Icons.event_available_outlined,
                                label: 'Hạn nộp',
                                value: _formatEndDate(d.endDate) ?? '—',
                              ),
                              if (remainedDays != null)
                                InfoItem(
                                  icon: Icons.hourglass_bottom,
                                  label: 'Còn lại',
                                  value: '$remainedDays ngày',
                                ),
                              InfoItem(
                                icon: Icons.female,
                                label: 'Giới tính',
                                value: d.gender ?? '—',
                              ),
                              InfoItem(
                                icon: Icons.people_outline,
                                label: 'Số lượng',
                                value: d.quantity?.toString() ?? '—',
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          if ((d.description ?? '').isNotEmpty) ...[
                            const _SectionTitle(title: 'Mô tả công việc'),
                            const SizedBox(height: 8),
                            _BulletText(d.description!),
                            const SizedBox(height: 16),
                          ],
                          if ((d.benefit ?? '').isNotEmpty) ...[
                            const _SectionTitle(title: 'Quyền lợi'),
                            const SizedBox(height: 8),
                            _BulletText(d.benefit!),
                            const SizedBox(height: 16),
                          ],
                          if ((d.requirement ?? '').isNotEmpty) ...[
                            const _SectionTitle(title: 'Yêu cầu'),
                            const SizedBox(height: 8),
                            _BulletText(d.requirement!),
                            const SizedBox(height: 16),
                          ],
                          if ((d.skills ?? '').isNotEmpty) ...[
                            const _SectionTitle(title: 'Kỹ năng yêu cầu'),
                            const SizedBox(height: 8),
                            Text(
                              d.skills!,
                              style: const TextStyle(height: 1.4),
                            ),
                            const SizedBox(height: 12),
                          ],
                        ],
                      ),
                    ),

                    // -------- Tab 2: Việc làm liên quan ----------
                    Builder(
                      builder: (_) {
                        final sims = d.similar;
                        if (sims.isEmpty) {
                          return SingleChildScrollView(
                            padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
                            child: const Center(
                              child: Text(
                                'Chưa có dữ liệu việc làm liên quan.',
                                style: TextStyle(color: Colors.black54),
                              ),
                            ),
                          );
                        }
                        return ListView.separated(
                          padding: const EdgeInsets.fromLTRB(16, 14, 16, 100),
                          itemCount: sims.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (context, i) {
                            final job = sims[i];
                            final remainingDays = job.deadline ?? 0;
                            return JobItemWidget(
                              title: job.title,
                              company: job.companyName,
                              salary: job.salaryRange,
                              location: job.location,
                              remainingDays: remainingDays,
                              urgent:
                                  job.isUrgent == '1' || job.isUrgent == 'true',
                              imageUrl: job.companyLogo,
                              isFavorite: false,
                              onFavoriteTap: () {},
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

                    // -------- Tab 3: Công ty ----------
                    Builder(
                      builder: (context) {
                        final companyId = d.companyId;
                        return FutureBuilder<CompanyModel>(
                          future: CompanyService.fetchCompany(companyId),
                          builder: (context, snap) {
                            if (snap.connectionState ==
                                ConnectionState.waiting) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: 100),
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            }
                            if (snap.hasError) {
                              return Center(
                                child: Padding(
                                  padding: const EdgeInsets.only(
                                    bottom: 100,
                                    left: 16,
                                    right: 16,
                                  ),
                                  child: Text(
                                    'Không tải được thông tin công ty.\n${snap.error}',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.black54,
                                    ),
                                  ),
                                ),
                              );
                            }
                            final company = snap.data;
                            if (company == null) {
                              return const Center(
                                child: Padding(
                                  padding: EdgeInsets.only(bottom: 100),
                                  child: Text(
                                    'Chưa có dữ liệu công ty.',
                                    style: TextStyle(color: Colors.black54),
                                  ),
                                ),
                              );
                            }
                            return SingleChildScrollView(
                              padding: const EdgeInsets.fromLTRB(
                                16,
                                14,
                                16,
                                100,
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  CompanyHeader(
                                    logo: _fullUrl(company.logo),
                                    name: company.name,
                                    address: company.address,
                                  ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.badge_outlined,
                                    label: 'Ngành',
                                    value: company.industryTitle ?? '—',
                                  ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.place_outlined,
                                    label: 'Khu vực',
                                    value: company.locationName ?? '—',
                                  ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.apartment_outlined,
                                    label: 'Địa chỉ',
                                    value: company.address ?? '—',
                                  ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.groups_2_outlined,
                                    label: 'Quy mô',
                                    value: company.companySize ?? '—',
                                  ),
                                  const SizedBox(height: 8),
                                  if ((company.email ?? '').isNotEmpty)
                                    CompanyInfoRow(
                                      icon: Icons.email_outlined,
                                      label: 'Email',
                                      value: company.email!,
                                    ),
                                  const SizedBox(height: 8),
                                  if ((company.phone ?? '').isNotEmpty)
                                    CompanyInfoRow(
                                      icon: Icons.call_outlined,
                                      label: 'Điện thoại',
                                      value: company.phone!,
                                    ),
                                  const SizedBox(height: 8),
                                  if ((company.website ?? '').isNotEmpty)
                                    CompanyInfoRow(
                                      icon: Icons.language,
                                      label: 'Website',
                                      value: company.website!,
                                    ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.verified_user_outlined,
                                    label: 'Trạng thái',
                                    value: company.isActive
                                        ? 'Đang hoạt động'
                                        : 'Tạm ngưng',
                                  ),
                                  const SizedBox(height: 8),
                                  CompanyInfoRow(
                                    icon: Icons.work_outline,
                                    label: 'Đang tuyển',
                                    value: '${company.activeJobsCount} việc',
                                  ),
                                  const SizedBox(height: 8),
                                  const _SectionTitle(
                                    title: 'Giới thiệu công ty',
                                  ),
                                  const SizedBox(height: 8),
                                  Builder(
                                    builder: (_) {
                                      final desc = (company.description ?? '')
                                          .trim();
                                      return Text(
                                        desc.isEmpty ? '—' : desc,
                                        style: const TextStyle(height: 1.5),
                                      );
                                    },
                                  ),
                                ],
                              ),
                            );
                          },
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

/* ================== helpers & widgets nhỏ ================== */

String? _formatEndDate(String? endDateStr) {
  if (endDateStr == null || endDateStr.trim().isEmpty) return null;
  final dt = DateTime.tryParse(endDateStr);
  if (dt == null) return null;
  return DateFormat('dd/MM/yyyy').format(dt);
}

int? _calcRemainingDaysFromString(String? endDateStr) {
  if (endDateStr == null || endDateStr.trim().isEmpty) return null;
  final dt = DateTime.tryParse(endDateStr);
  if (dt == null) return null;
  final diff = dt.difference(DateTime.now());
  return diff.isNegative ? 0 : diff.inDays;
}

bool _asBool(String? raw) {
  if (raw == null) return false;
  final s = raw.toLowerCase().trim();
  return s == '1' || s == 'true' || s == 'còn tuyển' || s == 'con tuyen';
}

class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle({required this.title});
  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
    );
  }
}

class _BulletText extends StatelessWidget {
  final String text;
  const _BulletText(this.text);
  @override
  Widget build(BuildContext context) {
    final lines = text
        .split(RegExp(r'\r?\n'))
        .where((e) => e.trim().isNotEmpty)
        .toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: lines.map((l) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 6),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('•  ', style: TextStyle(height: 1.4)),
              Expanded(
                child: Text(l.trim(), style: const TextStyle(height: 1.4)),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

String _fullUrl(String? p) {
  if (p == null || p.isEmpty) return '';
  if (p.startsWith('http')) return p;
  // sửa base theo server của bạn
  const base = 'http://192.168.56.1:8000';
  // API thường trả "companies/images/..." -> cần prefix 'storage/'
  final path = p.startsWith('storage/') ? p : 'storage/$p';
  return '$base/$path';
}
