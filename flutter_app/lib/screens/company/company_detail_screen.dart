import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class CompanyDetailScreen extends StatelessWidget {
  const CompanyDetailScreen({super.key, required this.company});

  Future<void> _openWebsite(BuildContext context) async {
    final url = company.website;
    if (url == null || url.trim().isEmpty) return;

    final uri = Uri.parse(url.startsWith('http') ? url : 'https://$url');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Không mở được website')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).primaryColor;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        body: SafeArea(
          child: Column(
            children: [
              // Thanh back + header (banner + logo + tên)
              _Header(company: company),
              const SizedBox(height: 12),
              // Card thông tin
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16.0),
                child: _InfoCard(
                  company: company,
                  onWebsiteTap: () => _openWebsite(context),
                ),
              ),
              const SizedBox(height: 8),
              // Tab bar
              Material(
                color: Colors.white,
                child: TabBar(
                  labelColor: primary,
                  unselectedLabelColor: Colors.black54,
                  indicatorColor: primary,
                  indicatorWeight: 3,
                  labelStyle: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                  tabs: [
                    const Tab(text: 'Thông tin'),
                    Tab(text: 'Việc làm (${company.jobsCount})'),
                  ],
                ),
              ),
              const Divider(height: 1),
              // Nội dung từng tab
              Expanded(
                child: TabBarView(
                  children: [
                    _AboutTab(company: company),
                    _JobsTab(company: company),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Header: back + banner + logo + tên công ty
class _Header extends StatelessWidget {
  final CompanyDetail company;

  const _Header({required this.company});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // hàng back + khoảng trắng trên cùng
        Padding(
          padding: const EdgeInsets.fromLTRB(4, 4, 4, 0),
          child: Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
            ],
          ),
        ),
        // banner + logo + tên
        Stack(
          clipBehavior: Clip.none,
          children: [
            // banner
            AspectRatio(
              aspectRatio: 3 / 1,
              child: company.coverUrl == null
                  ? Container(
                      color: Colors.grey.shade200,
                      child: const Center(
                        child: Icon(
                          Icons.apartment,
                          size: 48,
                          color: Colors.black26,
                        ),
                      ),
                    )
                  : Image.network(
                      company.coverUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => Container(
                        color: Colors.grey.shade200,
                        child: const Center(
                          child: Icon(
                            Icons.apartment,
                            size: 48,
                            color: Colors.black26,
                          ),
                        ),
                      ),
                    ),
            ),
            // logo
            Positioned.fill(
              top: null,
              child: Align(
                alignment: Alignment.bottomCenter,
                child: Transform.translate(
                  offset: const Offset(0, 32),
                  child: Container(
                    width: 104,
                    height: 104,
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          blurRadius: 12,
                          color: Colors.black.withOpacity(0.15),
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: company.logoUrl == null
                        ? const Icon(
                            Icons.business,
                            size: 48,
                            color: Colors.black26,
                          )
                        : Image.network(
                            company.logoUrl!,
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
            ),
          ],
        ),
        const SizedBox(height: 40),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Text(
            company.name,
            textAlign: TextAlign.center,
            style: theme.textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

/// Card thông tin địa chỉ, quy mô, tỉ lệ phản hồi, website
class _InfoCard extends StatelessWidget {
  final CompanyDetail company;
  final VoidCallback onWebsiteTap;

  const _InfoCard({required this.company, required this.onWebsiteTap});

  @override
  Widget build(BuildContext context) {
    final address = company.address ?? 'Đang cập nhật';
    final employee = company.employeeCountText ?? 'Đang cập nhật';
    final response = company.responseRateText ?? 'Đang cập nhật';
    final website = company.website;

    Widget _row({
      required IconData icon,
      required String text,
      VoidCallback? onTap,
    }) {
      final row = Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: Colors.black54),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 14))),
        ],
      );

      if (onTap == null) return row;

      return InkWell(onTap: onTap, child: row);
    }

    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.deepPurple.shade50, // hơi tím nhạt giống screenshot
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _row(icon: Icons.location_on_outlined, text: address),
            const SizedBox(height: 12),
            _row(icon: Icons.groups_outlined, text: employee),
            const SizedBox(height: 12),
            _row(icon: Icons.access_time_outlined, text: response),
            if (website != null && website.trim().isNotEmpty) ...[
              const SizedBox(height: 12),
              _row(icon: Icons.language, text: website, onTap: onWebsiteTap),
            ],
          ],
        ),
      ),
    );
  }
}

/// Tab 1: Thông tin / Giới thiệu công ty
class _AboutTab extends StatelessWidget {
  final CompanyDetail company;

  const _AboutTab({required this.company});

  @override
  Widget build(BuildContext context) {
    final description =
        company.description ?? 'Chưa có nội dung giới thiệu cho công ty này.';

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Giới thiệu công ty',
            style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16),
          ),
          const SizedBox(height: 8),
          Text(description, style: const TextStyle(fontSize: 14, height: 1.5)),
        ],
      ),
    );
  }
}

/// Tab 2: Việc làm – bạn có thể map sang danh sách JobModel / JobItemWidget
class _JobsTab extends StatelessWidget {
  final CompanyDetail company;

  const _JobsTab({required this.company});

  @override
  Widget build(BuildContext context) {
    // TODO: thay bằng FutureBuilder<List<JobModel>> dùng JobService.fetchByCompany(company.id)
    // và JobItemWidget của bạn.
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Text(
          'Danh sách việc làm của ${company.name} sẽ hiển thị ở đây.\n'
          'Bạn chỉ cần dùng FutureBuilder<List<JobModel>> và JobItemWidget để render.',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 14),
        ),
      ),
    );
  }
}
