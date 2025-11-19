import 'package:flutter/material.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/models/province.dart';
import 'package:mobile/api/models/work_field.dart';
import 'package:mobile/api/models/working_form.dart';
import 'package:mobile/api/services/master_data_service.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/screens/profile/widgets/save_button_bar.dart';
import 'package:mobile/screens/profile/widgets/select_item.dart';
import 'package:mobile/screens/profile/widgets/section_card.dart';
import 'package:mobile/screens/profile/widgets/fields.dart';

class JobCriteriaScreen extends StatefulWidget {
  const JobCriteriaScreen({super.key});

  @override
  State<JobCriteriaScreen> createState() => _JobCriteriaScreenState();
}

class _JobCriteriaScreenState extends State<JobCriteriaScreen> {
  final _formKey = GlobalKey<FormState>();

  final _positionCtrl = TextEditingController();
  final _minSalaryCtrl = TextEditingController();
  final _maxSalaryCtrl = TextEditingController();

  String? _workFieldLabel;
  String? _provinceLabel;
  String? _workingFormLabel;

  int? _workFieldId;
  int? _provinceId;
  int? _workingFormId;

  bool _loading = true;
  bool _saving = false;

  static const _primary = Colors.blue;
  static const _bg = Color(0xFFF5F7FB);
  static const _radius = 14.0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final ProfileModel profile = await ProfileService.fetchJobCriteria();

      _positionCtrl.text = profile.desiredPosition ?? '';

      _workFieldId = profile.workFieldId;
      _provinceId = profile.provinceId;
      _workingFormId = profile.workingFormId;

      _workFieldLabel = profile.workFieldTitle;
      _provinceLabel = profile.provinceName;
      _workingFormLabel = profile.workingFormTitle;

      if (profile.minSalary != null) {
        _minSalaryCtrl.text = profile.minSalary.toString();
      }
      if (profile.maxSalary != null) {
        _maxSalaryCtrl.text = profile.maxSalary.toString();
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải tiêu chí: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _onSave() async {
    if (_saving) return;

    final desired = _positionCtrl.text.trim();
    final minSalaryStr = _minSalaryCtrl.text.trim();
    final maxSalaryStr = _maxSalaryCtrl.text.trim();

    final minSalary = minSalaryStr.isEmpty ? null : int.tryParse(minSalaryStr);
    final maxSalary = maxSalaryStr.isEmpty ? null : int.tryParse(maxSalaryStr);

    if (minSalaryStr.isNotEmpty && minSalary == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lương tối thiểu không hợp lệ')),
      );
      return;
    }
    if (maxSalaryStr.isNotEmpty && maxSalary == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lương tối đa không hợp lệ')),
      );
      return;
    }
    if (minSalary != null && maxSalary != null && minSalary > maxSalary) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lương tối thiểu không được lớn hơn lương tối đa'),
        ),
      );
      return;
    }

    setState(() => _saving = true);
    try {
      await ProfileService.updateJobCriteria(
        desiredPosition: desired.isEmpty ? null : desired,
        workFieldId: _workFieldId,
        provinceId: _provinceId,
        minSalary: minSalary,
        maxSalary: maxSalary,
        workingFormId: _workingFormId,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã lưu tiêu chí tìm việc')));
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lưu thất bại: $e')));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  void dispose() {
    _positionCtrl.dispose();
    _minSalaryCtrl.dispose();
    _maxSalaryCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: _primary,
        foregroundColor: Colors.white,
        title: const Text('Tiêu chí tìm việc'),
        elevation: 0,
      ),
      bottomNavigationBar: SaveButtonBar(
        saving: _saving,
        onPressed: _onSave,
        color: _primary,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                children: [
                  SectionCard(
                    title: 'Tiêu chí tìm việc',
                    radius: _radius,
                    children: [
                      EditableTextField(
                        controller: _positionCtrl,
                        label: 'Vị trí mong muốn',
                        icon: Icons.work_outline,
                      ),
                      const SizedBox(height: 12),

                      SelectItem(
                        label: 'Ngành nghề',
                        icon: Icons.apps_outlined,
                        text: _workFieldLabel ?? 'Chọn ngành nghề',
                        onTap: _onSelectWorkField,
                      ),
                      const SizedBox(height: 12),

                      SelectItem(
                        label: 'Địa điểm làm việc',
                        icon: Icons.location_on_outlined,
                        text: _provinceLabel ?? 'Chọn tỉnh/thành',
                        onTap: _onSelectProvince,
                      ),
                      const SizedBox(height: 12),

                      Row(
                        children: [
                          Expanded(
                            child: EditableTextField(
                              controller: _minSalaryCtrl,
                              label: 'Lương tối thiểu',
                              icon: Icons.attach_money,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: EditableTextField(
                              controller: _maxSalaryCtrl,
                              label: 'Lương tối đa',
                              icon: Icons.attach_money,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      SelectItem(
                        label: 'Hình thức làm việc',
                        icon: Icons.schedule_outlined,
                        text: _workingFormLabel ?? 'Chọn hình thức làm việc',
                        onTap: _onSelectWorkingForm,
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Future<void> _onSelectWorkField() async {
    try {
      final list = await MasterDataService.fetchWorkFields();
      if (!mounted) return;

      final selected = await showModalBottomSheet<WorkField>(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        builder: (ctx) {
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.7,
            maxChildSize: 0.9,
            minChildSize: 0.4,
            builder: (_, controller) {
              return Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'Chọn ngành nghề',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.builder(
                      controller: controller,
                      itemCount: list.length,
                      itemBuilder: (_, i) {
                        final item = list[i];
                        return ListTile(
                          title: Text(item.title),
                          onTap: () => Navigator.of(ctx).pop(item),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          );
        },
      );

      if (selected != null) {
        setState(() {
          _workFieldId = selected.id;
          _workFieldLabel = selected.title;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải ngành nghề: $e')));
    }
  }

  Future<void> _onSelectProvince() async {
    try {
      final list = await MasterDataService.fetchProvinces();
      if (!mounted) return;

      final selected = await showModalBottomSheet<Province>(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        builder: (ctx) {
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.7,
            maxChildSize: 0.9,
            minChildSize: 0.4,
            builder: (_, controller) {
              return Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'Chọn địa điểm',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.builder(
                      controller: controller,
                      itemCount: list.length,
                      itemBuilder: (_, i) {
                        final item = list[i];
                        return ListTile(
                          title: Text(item.name),
                          onTap: () => Navigator.of(ctx).pop(item),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          );
        },
      );

      if (selected != null) {
        setState(() {
          _provinceId = selected.id;
          _provinceLabel = selected.name;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải địa điểm: $e')));
    }
  }

  Future<void> _onSelectWorkingForm() async {
    try {
      final list = await MasterDataService.fetchWorkingForms();
      if (!mounted) return;

      final selected = await showModalBottomSheet<WorkingForm>(
        context: context,
        isScrollControlled: true,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
        ),
        builder: (ctx) {
          return DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.7,
            maxChildSize: 0.9,
            minChildSize: 0.4,
            builder: (_, controller) {
              return Column(
                children: [
                  const Padding(
                    padding: EdgeInsets.all(16),
                    child: Text(
                      'Chọn hình thức làm việc',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  Expanded(
                    child: ListView.builder(
                      controller: controller,
                      itemCount: list.length,
                      itemBuilder: (_, i) {
                        final item = list[i];
                        return ListTile(
                          title: Text(item.title),
                          onTap: () => Navigator.of(ctx).pop(item),
                        );
                      },
                    ),
                  ),
                ],
              );
            },
          );
        },
      );

      if (selected != null) {
        setState(() {
          _workingFormId = selected.id;
          _workingFormLabel = selected.title;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải hình thức làm việc: $e')));
    }
  }
}
