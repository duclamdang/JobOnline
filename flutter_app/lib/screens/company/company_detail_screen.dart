import 'package:flutter/material.dart';
import 'package:mobile/api/models/company_model.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/services/company_service.dart';
import 'package:mobile/api/services/job_service.dart';
import 'package:mobile/screens/company/tab/about_tab.dart';
import 'package:mobile/screens/company/tab/jobs_tab.dart';
import 'package:mobile/screens/company/widgets/company_detail_header.dart';
import 'package:mobile/utils/url_utils.dart';

const Color _primaryColor = Color(0xFF1E88E5);
const Color _headerBgColor = Color(0xFF1565C0);
const Color _pageBgColor = Color(0xFFF5F5F5);
const Color _dividerColor = Color(0xFFE0E0E0);

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

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        backgroundColor: _pageBgColor,
        body: FutureBuilder<CompanyModel>(
          future: _companyFuture,
          builder: (context, snap) {
            if (snap.connectionState == ConnectionState.waiting) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(_primaryColor),
                ),
              );
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
                        color: _primaryColor,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Không tải được thông tin công ty.\n${snap.error}',
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 14, height: 1.4),
                      ),
                      const SizedBox(height: 4),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _primaryColor,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 10,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
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
                    expandedHeight: 260,
                    floating: false,
                    pinned: true,
                    backgroundColor: _headerBgColor,
                    foregroundColor: Colors.white,
                    elevation: innerBoxIsScrolled ? 4.0 : 0.0,
                    centerTitle: true,
                    flexibleSpace: FlexibleSpaceBar(
                      collapseMode: CollapseMode.pin,
                      titlePadding: EdgeInsets.zero,
                      background: Header(
                        name: company.name,
                        logoUrl: logoUrl,
                        coverUrl: coverUrl,
                        child: const SizedBox(height: 70),
                      ),
                    ),
                    bottom: PreferredSize(
                      preferredSize: const Size.fromHeight(210.0),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            color: Colors.white,
                            width: double.infinity,
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const SizedBox(height: 2),
                                TabBar(
                                  labelColor: _primaryColor,
                                  unselectedLabelColor: Colors.black54,
                                  indicatorColor: _primaryColor,
                                  indicatorWeight: 3,
                                  labelStyle: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  tabs: [
                                    const Tab(text: 'Thông tin'),
                                    Tab(
                                      text:
                                          'Việc làm (${company.activeJobsCount})',
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                              ],
                            ),
                          ),
                          Container(height: 1, color: _dividerColor),
                        ],
                      ),
                    ),
                  ),
                ];
              },
              body: Container(
                color: Colors.white,
                child: TabBarView(
                  children: [
                    AboutTab(company: company),
                    JobsTab(
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
              ),
            );
          },
        ),
      ),
    );
  }
}
