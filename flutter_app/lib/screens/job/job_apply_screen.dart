import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile/api/models/job_model.dart';
import 'package:mobile/api/models/cv_model.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/api/services/my_jobs_service.dart';
import 'package:mobile/providers/my_jobs_provider.dart';

class JobApplyScreen extends StatefulWidget {
  final JobModel job;

  const JobApplyScreen({super.key, required this.job});

  @override
  State<JobApplyScreen> createState() => _JobApplyScreenState();
}

class _JobApplyScreenState extends State<JobApplyScreen> {
  final _formKey = GlobalKey<FormState>();

  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();

  bool _loading = true;
  bool _submitting = false;

  List<CvModel> _cvs = [];
  int? _selectedCvId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final basic = await ProfileService.fetchBasic();
      final cvs = await ProfileService.fetchCVs();

      setState(() {
        _cvs = cvs;

        _nameCtrl.text = basic.name;
        _emailCtrl.text = basic.email;
        _phoneCtrl.text = basic.phone ?? '';

        if (cvs.isNotEmpty) {
          final main = cvs.where((e) => e.main).toList();
          _selectedCvId = (main.isNotEmpty ? main.first : cvs.first).id;
        }

        _loading = false;
      });
    } catch (e) {
      setState(() {
        _loading = false;
      });
      ScaffoldMessenger.of(
        // ignore: use_build_context_synchronously
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải hồ sơ: $e')));
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    if (_selectedCvId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng chọn CV ứng tuyển')),
      );
      return;
    }

    setState(() => _submitting = true);

    try {
      await MyJobsService.applyJob(jobId: widget.job.id, cvId: _selectedCvId!);

      if (!mounted) return;
      context.read<MyJobsProvider>().markApplied(widget.job.id);
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Ứng tuyển thành công')));
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Ứng tuyển thất bại: $e')));
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primary = theme.colorScheme.primary;
    final hasCv = _cvs.isNotEmpty;

    if (_loading) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Ứng tuyển'),
          backgroundColor: Colors.white,
          foregroundColor: Colors.black87,
          elevation: 0.5,
        ),
        body: const Center(child: CircularProgressIndicator()),
        backgroundColor: const Color(0xFFF4F7FB),
      );
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7FB), // nền xám xanh rất nhạt
      appBar: AppBar(
        title: const Text('Ứng tuyển'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black87,
        elevation: 0.5,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
          children: [
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        // ignore: deprecated_member_use
                        color: primary.withOpacity(0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(Icons.work_outline, color: primary),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            widget.job.title,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (widget.job.companyName.isNotEmpty)
                            Text(
                              widget.job.companyName,
                              style: TextStyle(
                                fontSize: 13,
                                color: Colors.grey.shade700,
                              ),
                            ),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 8,
                            runSpacing: 4,
                            children: [
                              if (widget.job.location.isNotEmpty)
                                _InfoChip(
                                  icon: Icons.location_on_outlined,
                                  label: widget.job.location,
                                ),
                              if (widget.job.salaryRange.isNotEmpty)
                                _InfoChip(
                                  icon: Icons.attach_money,
                                  label: widget.job.salaryRange,
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // --- SECTION: THÔNG TIN LIÊN HỆ ---
            _SectionHeader(
              title: 'Thông tin ứng viên',
              subtitle: 'Thông tin được lấy từ hồ sơ tài khoản của bạn',
              primary: primary,
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Họ và tên
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: _inputDecoration(label: 'Họ và tên *'),
                      readOnly: true,
                      validator: (v) => (v == null || v.trim().isEmpty)
                          ? 'Nhập họ tên'
                          : null,
                    ),
                    const SizedBox(height: 12),

                    // Email
                    TextFormField(
                      controller: _emailCtrl,
                      decoration: _inputDecoration(label: 'Email *'),
                      readOnly: true,
                    ),
                    const SizedBox(height: 12),

                    // Số điện thoại
                    TextFormField(
                      controller: _phoneCtrl,
                      decoration: _inputDecoration(label: 'Số điện thoại *'),
                      readOnly: true,
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Muốn chỉnh sửa? Hãy cập nhật trong hồ sơ cá nhân.',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // --- SECTION: CV ỨNG TUYỂN ---
            _SectionHeader(
              title: 'CV ứng tuyển',
              subtitle: hasCv
                  ? 'Chọn 1 CV để gửi cho nhà tuyển dụng'
                  : 'Bạn chưa có CV nào',
              primary: primary,
            ),
            const SizedBox(height: 8),
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: hasCv
                    ? Column(
                        children: _cvs.map((cv) {
                          final title = cv.fileName;
                          return RadioListTile<int>(
                            value: cv.id,
                            groupValue: _selectedCvId,
                            onChanged: (v) {
                              setState(() {
                                _selectedCvId = v;
                              });
                            },
                            activeColor: primary,
                            title: Text(
                              title,
                              style: const TextStyle(fontSize: 14),
                            ),
                            subtitle: cv.main
                                ? Text(
                                    'CV chính',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: primary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  )
                                : null,
                          );
                        }).toList(),
                      )
                    : Padding(
                        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Icon(
                              Icons.info_outline,
                              color: Colors.red.shade400,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Bạn chưa có CV nào. Vui lòng tạo / upload CV trước khi ứng tuyển.',
                                style: TextStyle(
                                  color: Colors.red.shade600,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        minimum: const EdgeInsets.all(16),
        child: SizedBox(
          width: double.infinity,
          child: ElevatedButton(
            onPressed: _submitting || !hasCv ? null : _submit,
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              backgroundColor: primary,
              // ignore: deprecated_member_use
              disabledBackgroundColor: primary.withOpacity(0.3),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: _submitting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : const Text(
                    'Gửi ứng tuyển',
                    style: TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
                  ),
          ),
        ),
      ),
    );
  }

  InputDecoration _inputDecoration({required String label}) {
    return InputDecoration(
      labelText: label,
      filled: true,
      fillColor: const Color(0xFFF5F8FF), // nền input xanh rất nhạt
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide.none,
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Color primary;

  const _SectionHeader({
    required this.title,
    this.subtitle,
    required this.primary,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 4,
          height: 18,
          decoration: BoxDecoration(
            color: primary,
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              if (subtitle != null) ...[
                const SizedBox(height: 2),
                Text(
                  subtitle!,
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;

  const _InfoChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    final primary = Theme.of(context).colorScheme.primary;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        // ignore: deprecated_member_use
        color: primary.withOpacity(0.06),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: primary),
          const SizedBox(width: 4),
          Text(
            label,
            // ignore: deprecated_member_use
            style: TextStyle(fontSize: 12, color: primary.withOpacity(0.95)),
          ),
        ],
      ),
    );
  }
}
