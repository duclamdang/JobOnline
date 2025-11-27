import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/screens/profile/basic_info_screen.dart';
import 'package:mobile/screens/profile/cv_screen.dart';
import 'package:mobile/screens/profile/general-info_screen.dart';
import 'package:mobile/screens/profile/job_criteria_screen.dart';
import 'package:mobile/screens/profile/widgets/divider_inset.dart';
import 'package:mobile/screens/profile/widgets/logout_setting_item.dart';
import 'package:mobile/screens/profile/widgets/section_title.dart';
import 'package:mobile/screens/profile/widgets/setting_item.dart';
import 'package:mobile/screens/profile/widgets/logged_out_view.dart';
import 'package:mobile/utils/url_utils.dart';
import 'package:path_provider/path_provider.dart';
// ignore: depend_on_referenced_packages
import 'package:provider/provider.dart';
import 'package:mobile/providers/auth_provider.dart';

class LoggedInView extends StatefulWidget {
  const LoggedInView({super.key});

  @override
  State<LoggedInView> createState() => LoggedInViewState();
}

class LoggedInViewState extends State<LoggedInView> {
  static const Color primaryBlue = Color(0xFF4C6FFF);
  static const double _avatarSize = 120;

  late Future<ProfileModel> _future;
  bool _uploadingAvatar = false;

  @override
  void initState() {
    super.initState();
    _future = ProfileService.fetchDetail();
  }

  void _reload() {
    setState(() {
      _future = ProfileService.fetchDetail();
    });
  }

  Future<File> _materializeFile(PlatformFile f) async {
    if (f.path != null) return File(f.path!);
    final dir = await getTemporaryDirectory();
    final out = File('${dir.path}/${f.name}');
    await out.writeAsBytes(f.bytes ?? const []);
    return out;
  }

  Future<void> _pickAndUploadAvatar() async {
    try {
      final picked = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: const ['jpg', 'jpeg', 'png'],
        withData: true,
      );
      if (picked == null || picked.files.isEmpty) return;

      setState(() => _uploadingAvatar = true);

      final pf = picked.files.single;
      final file = await _materializeFile(pf);
      await ProfileService.uploadAvatar(file);

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Cập nhật ảnh đại diện thành công')),
      );
      _reload();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi cập nhật ảnh: $e')));
    } finally {
      if (mounted) setState(() => _uploadingAvatar = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<ProfileModel>(
      future: _future,
      builder: (context, snap) {
        // loading
        if (snap.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }

        // lỗi (ví dụ token sai / hết hạn)
        if (snap.hasError) {
          final msg = snap.error.toString();

          // Nếu lỗi kiểu "Please check your login credentials..."
          // => coi như hết phiên đăng nhập -> logout & show LoggedOutView
          if (msg.contains('login credentials') ||
              msg.contains('Unauthenticated') ||
              msg.contains('401')) {
            // gọi logout sau frame build để tránh setState trong build
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (!mounted) return;
              context.read<AuthProvider>().logout();
            });
            return const LoggedOutView();
          }

          // các lỗi khác (mạng, server...)
          return Center(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Lỗi tải hồ sơ: $msg'),
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: _reload,
                    child: const Text('Thử lại'),
                  ),
                ],
              ),
            ),
          );
        }

        // có data
        final u = snap.data!;
        final avatarUrl = fullUrl(u.avatar);

        return RefreshIndicator(
          onRefresh: () async => _reload(),
          child: ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
            children: [
              // HEADER
              Container(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 24),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, 2),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(_avatarSize),
                          child: Container(
                            width: _avatarSize,
                            height: _avatarSize,
                            color: Colors.grey.shade200,
                            child: (avatarUrl.isEmpty)
                                ? const Icon(
                                    Icons.person,
                                    size: 56,
                                    color: Colors.grey,
                                  )
                                : Image.network(
                                    avatarUrl,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => const Icon(
                                      Icons.person,
                                      size: 56,
                                      color: Colors.grey,
                                    ),
                                  ),
                          ),
                        ),
                        Material(
                          color: Colors.white,
                          shape: const CircleBorder(),
                          elevation: 1,
                          child: InkWell(
                            customBorder: const CircleBorder(),
                            onTap: _uploadingAvatar
                                ? null
                                : _pickAndUploadAvatar,
                            child: Padding(
                              padding: const EdgeInsets.all(6),
                              child: _uploadingAvatar
                                  ? const SizedBox(
                                      width: 20,
                                      height: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.camera_alt, size: 18),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          u.name.isEmpty ? '—' : u.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(width: 8),
                        if (u.isVerify == true)
                          Container(
                            padding: const EdgeInsets.all(3),
                            decoration: const BoxDecoration(
                              color: primaryBlue,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.check,
                              size: 14,
                              color: Colors.white,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      u.email,
                      style: const TextStyle(color: Colors.black54),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),

              const SectionTitle(title: 'Cài đặt tài khoản'),
              SettingItem(
                icon: Icons.edit_outlined,
                iconColor: primaryBlue,
                title: 'Chỉnh sửa hồ sơ cá nhân',
                onTap: () async {
                  final changed = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                      builder: (_) => BasicInfoScreen(initial: u),
                    ),
                  );
                  if (changed == true) _reload();
                },
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.picture_as_pdf_outlined,
                iconColor: primaryBlue,
                title: 'CV của tôi',
                onTap: () async {
                  final changed = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(builder: (_) => const CvScreen()),
                  );
                  if (changed == true) _reload();
                },
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.tune,
                iconColor: primaryBlue,
                title: 'Tiêu chí tìm việc',
                onTap: () async {
                  final changed = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(
                      builder: (_) => const JobCriteriaScreen(),
                    ),
                  );
                  if (changed == true) _reload();
                },
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.info_outline,
                iconColor: primaryBlue,
                title: 'Thông tin chung',
                onTap: () async {
                  final changed = await Navigator.of(context).push<bool>(
                    MaterialPageRoute(builder: (_) => GeneralInfoScreen()),
                  );
                  if (changed == true) _reload();
                },
              ),
              const DividerInset(),

              const SectionTitle(title: 'Hệ thống'),
              SettingItem(
                icon: Icons.lock_outline,
                iconColor: primaryBlue,
                title: 'Quyền riêng tư & bảo mật',
                onTap: () {},
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.help_outline,
                iconColor: primaryBlue,
                title: 'Hướng dẫn sự dụng',
                onTap: () {},
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.privacy_tip_outlined,
                iconColor: primaryBlue,
                title: 'Chính sách bảo mật',
                onTap: () {},
              ),
              const DividerInset(),

              SettingItem(
                icon: Icons.person_outline,
                iconColor: primaryBlue,
                title: 'Chính sách dữ liệu cá nhân',
                onTap: () {},
              ),
              const DividerInset(),

              const LogoutSettingItem(),
            ],
          ),
        );
      },
    );
  }
}
