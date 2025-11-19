import 'package:flutter/material.dart';
import 'package:mobile/api/models/education.dart';
import 'package:mobile/api/models/position.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/models/work_experience.dart';
import 'package:mobile/api/services/master_data_service.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/screens/profile/widgets/save_button_bar.dart';
import 'package:mobile/screens/profile/widgets/select_item.dart';
import 'package:mobile/screens/profile/widgets/section_card.dart';

class GeneralInfoScreen extends StatefulWidget {
  const GeneralInfoScreen({super.key});

  @override
  State<GeneralInfoScreen> createState() => _GeneralInfoScreenState();
}

class _GeneralInfoScreenState extends State<GeneralInfoScreen> {
  final _formKey = GlobalKey<FormState>();

  String? _workExperienceLabel;
  String? _positionLabel;
  String? _educationLabel;

  int? _workExperienceId;
  int? _positionId;
  int? _educationId;

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
      final ProfileModel profile = await ProfileService.fetchGeneralInfo();

      _workExperienceId = profile.workExperienceId;
      _positionId = profile.positionId;
      _educationId = profile.educationId;

      _workExperienceLabel = profile.workExperienceTitle;
      _positionLabel = profile.positionTitle;
      _educationLabel = profile.educationTitle;
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải thông tin chung: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _onSave() async {
    if (_saving) return;
    setState(() => _saving = true);
    try {
      await ProfileService.updateGeneralInfo(
        workExperienceId: _workExperienceId,
        positionId: _positionId,
        educationId: _educationId,
      );

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã lưu thông tin chung')));
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
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _bg,
      appBar: AppBar(
        backgroundColor: _primary,
        foregroundColor: Colors.white,
        title: const Text('Thông tin chung'),
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
                    title: 'Thông tin chung',
                    radius: _radius,
                    children: [
                      SelectItem(
                        label: 'Kinh nghiệm làm việc',
                        icon: Icons.assignment_outlined,
                        text:
                            _workExperienceLabel ?? 'Chọn kinh nghiệm làm việc',
                        onTap: _onSelectWorkExperience,
                      ),
                      const SizedBox(height: 12),

                      SelectItem(
                        label: 'Vị trí',
                        icon: Icons.work_outline,
                        text: _positionLabel ?? 'Chọn vị trí',
                        onTap: _onSelectPosition,
                      ),
                      const SizedBox(height: 12),

                      SelectItem(
                        label: 'Trình độ học vấn',
                        icon: Icons.school_outlined,
                        text: _educationLabel ?? 'Chọn trình độ học vấn',
                        onTap: _onSelectEducation,
                      ),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Future<void> _onSelectWorkExperience() async {
    try {
      final List<WorkExperience> list =
          await MasterDataService.fetchWorkExperiences();

      if (!mounted) return;

      final selected = await showModalBottomSheet<WorkExperience>(
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
                      'Chọn kinh nghiệm làm việc',
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
          _workExperienceId = selected.id;
          _workExperienceLabel = selected.title;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Lỗi tải danh sách kinh nghiệm: $e')),
      );
    }
  }

  Future<void> _onSelectPosition() async {
    try {
      final List<Position> list = await MasterDataService.fetchPositions();

      if (!mounted) return;

      final selected = await showModalBottomSheet<Position>(
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
                      'Chọn vị trí',
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
          _positionId = selected.id;
          _positionLabel = selected.title;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải danh sách vị trí: $e')));
    }
  }

  Future<void> _onSelectEducation() async {
    try {
      final List<Education> list = await MasterDataService.fetchEducations();

      if (!mounted) return;

      final selected = await showModalBottomSheet<Education>(
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
                      'Chọn trình độ học vấn',
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
          _educationId = selected.id;
          _educationLabel = selected.title;
        });
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi tải danh sách trình độ: $e')));
    }
  }
}
