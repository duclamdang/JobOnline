import 'package:flutter/material.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/models/page_result.dart';
import 'package:mobile/api/services/job_service.dart';
import 'package:mobile/api/services/master_data_service.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/my_jobs_provider.dart';
import 'package:mobile/screens/auth/login_screen.dart';
import 'package:mobile/screens/job/job_detail_screen.dart';
import 'package:mobile/screens/job/widgets/job_item_widget.dart';
import 'package:mobile/screens/search/widgets/filter_chip.dart'
    show FilterSelectChip;
import 'package:mobile/screens/search/widgets/select_bottom_sheet.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';

class JobSearchResultScreen extends StatefulWidget {
  final String keyword;
  final int? location;
  final String? cityLabel;

  const JobSearchResultScreen({
    super.key,
    required this.keyword,
    this.location,
    this.cityLabel,
  });

  @override
  State<JobSearchResultScreen> createState() => _JobSearchResultScreenState();
}

class _JobSearchResultScreenState extends State<JobSearchResultScreen> {
  late Future<PageResult<JobModel>> _future;
  late TextEditingController _searchController;
  String _keyword = '';

  int? _selectedLocationId;
  String? _selectedLocationLabel;

  int? _selectedFieldId;
  String? _selectedFieldLabel;

  int? _selectedSalaryId;
  String? _selectedSalaryLabel;

  int? _selectedExpId;
  String? _selectedExpLabel;

  int? _selectedPositionId;
  String? _selectedPositionLabel;

  int? _selectedEducationId;
  String? _selectedEducationLabel;

  int? _selectedWorkingFormId;
  String? _selectedWorkingFormLabel;

  int? _selectedGenderId;
  String? _selectedGenderLabel;

  @override
  void initState() {
    super.initState();
    _keyword = widget.keyword.trim();
    _searchController = TextEditingController(text: _keyword);
    _selectedLocationId = widget.location;
    _selectedLocationLabel = widget.cityLabel;
    _loadData();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadData({int page = 1}) {
    final trimmedKeyword = _keyword.trim();

    _future = JobService.searchJobs(
      keyword: trimmedKeyword.isEmpty ? null : trimmedKeyword,
      fields: _selectedFieldId != null ? <int>[_selectedFieldId!] : null,
      location: _selectedLocationId != null
          ? <int>[_selectedLocationId!]
          : null,
      salary: _selectedSalaryId != null ? <int>[_selectedSalaryId!] : null,
      experience: _selectedExpId != null ? <int>[_selectedExpId!] : null,
      position: _selectedPositionId != null
          ? <int>[_selectedPositionId!]
          : null,
      education: _selectedEducationId != null
          ? <int>[_selectedEducationId!]
          : null,
      workingForm: _selectedWorkingFormId != null
          ? <int>[_selectedWorkingFormId!]
          : null,
      gender: _selectedGenderId != null ? <int>[_selectedGenderId!] : null,
      page: page,
    );

    setState(() {});
  }

  void _clearAllFilters() {
    setState(() {
      _searchController.clear();
      _keyword = '';

      _selectedLocationId = null;
      _selectedLocationLabel = null;

      _selectedFieldId = null;
      _selectedFieldLabel = null;

      _selectedSalaryId = null;
      _selectedSalaryLabel = null;

      _selectedExpId = null;
      _selectedExpLabel = null;

      _selectedPositionId = null;
      _selectedPositionLabel = null;

      _selectedEducationId = null;
      _selectedEducationLabel = null;

      _selectedWorkingFormId = null;
      _selectedWorkingFormLabel = null;

      _selectedGenderId = null;
      _selectedGenderLabel = null;
    });

    _loadData(page: 1);
  }

  Future<void> _pickLocation() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn tỉnh / thành',
      loader: () async {
        final provinces = await MasterDataService.fetchProvinces();
        return provinces
            .map((p) => SelectItem(id: p.id, label: p.name))
            .toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedLocationId = result.id;
        _selectedLocationLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickField() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn ngành nghề',
      loader: () async {
        final list = await MasterDataService.fetchWorkFields();
        return list.map((e) => SelectItem(id: e.id, label: e.title)).toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedFieldId = result.id;
        _selectedFieldLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickSalary() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn mức lương',
      loader: () async {
        return <SelectItem>[
          SelectItem(id: 1, label: 'Dưới 3 triệu'),
          SelectItem(id: 2, label: '3 - 5 triệu'),
          SelectItem(id: 3, label: '5 - 7 triệu'),
          SelectItem(id: 4, label: '7 - 10 triệu'),
          SelectItem(id: 5, label: '10 - 15 triệu'),
          SelectItem(id: 6, label: '15 - 20 triệu'),
          SelectItem(id: 7, label: '20 - 30 triệu'),
          SelectItem(id: 8, label: '30 - 40 triệu'),
          SelectItem(id: 9, label: '40 - 50 triệu'),
        ];
      },
    );

    if (result != null) {
      setState(() {
        _selectedSalaryId = result.id;
        _selectedSalaryLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickExp() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn kinh nghiệm',
      loader: () async {
        final list = await MasterDataService.fetchWorkExperiences();
        return list.map((e) => SelectItem(id: e.id, label: e.title)).toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedExpId = result.id;
        _selectedExpLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickPosition() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn chức vụ',
      loader: () async {
        final list = await MasterDataService.fetchPositions();
        return list.map((e) => SelectItem(id: e.id, label: e.title)).toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedPositionId = result.id;
        _selectedPositionLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickEducation() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn trình độ',
      loader: () async {
        final list = await MasterDataService.fetchEducations();
        return list.map((e) => SelectItem(id: e.id, label: e.title)).toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedEducationId = result.id;
        _selectedEducationLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickWorkingForm() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn loại công việc',
      loader: () async {
        final list = await MasterDataService.fetchWorkingForms();
        return list.map((e) => SelectItem(id: e.id, label: e.title)).toList();
      },
    );

    if (result != null) {
      setState(() {
        _selectedWorkingFormId = result.id;
        _selectedWorkingFormLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  Future<void> _pickGender() async {
    final result = await showSelectBottomSheet(
      context: context,
      title: 'Chọn giới tính',
      loader: () async {
        return <SelectItem>[
          SelectItem(id: 1, label: 'Nam'),
          SelectItem(id: 2, label: 'Nữ'),
          SelectItem(id: 3, label: 'Không yêu cầu'),
        ];
      },
    );

    if (result != null) {
      setState(() {
        _selectedGenderId = result.id;
        _selectedGenderLabel = result.label;
      });
      _loadData(page: 1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final primary = colorScheme.primary;

    final bool hasActiveFilters =
        _keyword.trim().isNotEmpty ||
        _selectedLocationId != null ||
        _selectedFieldId != null ||
        _selectedSalaryId != null ||
        _selectedExpId != null ||
        _selectedPositionId != null ||
        _selectedEducationId != null ||
        _selectedWorkingFormId != null ||
        _selectedGenderId != null;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        scrolledUnderElevation: 2,
        iconTheme: IconThemeData(color: primary),
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: Container(
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: Colors.grey.shade300, width: 1),
              boxShadow: [
                BoxShadow(
                  // ignore: deprecated_member_use
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 6,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                const SizedBox(width: 10),
                Icon(Icons.search, size: 20, color: Colors.grey.shade600),
                const SizedBox(width: 4),
                Expanded(
                  child: TextField(
                    controller: _searchController,
                    textInputAction: TextInputAction.search,
                    onChanged: (_) => setState(() {}),
                    onSubmitted: (value) {
                      _keyword = value;
                      _loadData(page: 1);
                    },
                    decoration: const InputDecoration(
                      hintText: 'Tìm kiếm công việc',
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 8,
                        horizontal: 0,
                      ),
                    ),
                  ),
                ),
                if (_searchController.text.isNotEmpty)
                  IconButton(
                    icon: const Icon(Icons.clear, size: 18),
                    splashRadius: 18,
                    onPressed: () {
                      setState(() {
                        _searchController.clear();
                        _keyword = '';
                      });
                      _loadData(page: 1);
                    },
                  ),
              ],
            ),
          ),
        ),
        actions: [
          IconButton(
            tooltip: 'Xoá tất cả bộ lọc',
            splashRadius: 20,
            icon: Icon(
              Icons.filter_alt_off_outlined,
              color: hasActiveFilters
                  ? primary
                  // ignore: deprecated_member_use
                  : colorScheme.onSurface.withOpacity(0.4),
            ),
            onPressed: hasActiveFilters ? _clearAllFilters : null,
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            child: Column(
              children: [
                SizedBox(
                  height: 48,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                    children: [
                      FilterSelectChip(
                        label: 'Ngành nghề',
                        selectedText: _selectedFieldLabel,
                        isActive: _selectedFieldId != null,
                        onPressed: _pickField,
                      ),
                      FilterSelectChip(
                        label: 'Tỉnh thành',
                        selectedText: _selectedLocationLabel ?? 'Tỉnh thành',
                        isActive: _selectedLocationId != null,
                        onPressed: _pickLocation,
                      ),
                      FilterSelectChip(
                        label: 'Mức lương',
                        selectedText: _selectedSalaryLabel,
                        isActive: _selectedSalaryId != null,
                        onPressed: _pickSalary,
                      ),
                      FilterSelectChip(
                        label: 'Kinh nghiệm',
                        selectedText: _selectedExpLabel,
                        isActive: _selectedExpId != null,
                        onPressed: _pickExp,
                      ),
                      FilterSelectChip(
                        label: 'Chức vụ',
                        selectedText: _selectedPositionLabel,
                        isActive: _selectedPositionId != null,
                        onPressed: _pickPosition,
                      ),
                      FilterSelectChip(
                        label: 'Trình độ',
                        selectedText: _selectedEducationLabel,
                        isActive: _selectedEducationId != null,
                        onPressed: _pickEducation,
                      ),
                      FilterSelectChip(
                        label: 'Loại công việc',
                        selectedText: _selectedWorkingFormLabel,
                        isActive: _selectedWorkingFormId != null,
                        onPressed: _pickWorkingForm,
                      ),
                      FilterSelectChip(
                        label: 'Giới tính',
                        selectedText: _selectedGenderLabel,
                        isActive: _selectedGenderId != null,
                        onPressed: _pickGender,
                      ),
                    ],
                  ),
                ),
                Divider(height: 1, thickness: 1, color: Colors.grey.shade200),
              ],
            ),
          ),

          Expanded(
            child: FutureBuilder<PageResult<JobModel>>(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (snapshot.hasError) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.error_outline,
                            size: 40,
                            color: colorScheme.error,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Đã xảy ra lỗi',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${snapshot.error}',
                            textAlign: TextAlign.center,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  );
                }
                if (!snapshot.hasData) {
                  return const Center(child: Text('Không có dữ liệu'));
                }

                final pageResult = snapshot.data!;
                final jobs = pageResult.items;
                final totalResults = pageResult.total;

                if (jobs.isEmpty) {
                  return Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.search_off_rounded,
                            size: 40,
                            color: primary,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Không tìm thấy công việc phù hợp',
                            style: Theme.of(context).textTheme.titleMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Thử thay đổi từ khoá hoặc bộ lọc nhé.',
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 6,
                      ),
                      child: Text(
                        '$totalResults kết quả',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                          // ignore: deprecated_member_use
                          color: Colors.blue..withOpacity(0.75),
                        ),
                      ),
                    ),

                    Divider(height: 1, color: Colors.grey),
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 8,
                        ),
                        itemCount: jobs.length,
                        itemBuilder: (context, index) {
                          final job = jobs[index];
                          final remainingDays = job.deadline ?? 0;

                          final my = context.watch<MyJobsProvider>();
                          final isFav = my.isSaved(job.id);
                          final savedLoading = false;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: JobItemWidget(
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
                                  // ignore: dead_code
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
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
