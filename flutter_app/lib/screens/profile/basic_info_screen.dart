import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:mobile/api/models/profile_model.dart';
import 'package:mobile/api/services/profile_service.dart';
import 'package:mobile/screens/profile/widgets/fields.dart';
import 'package:mobile/screens/profile/widgets/gender_selector.dart';
import 'package:mobile/screens/profile/widgets/save_button_bar.dart';
import 'package:mobile/screens/profile/widgets/section_card.dart';
import 'package:mobile/utils/day_utils.dart';

class BasicInfoScreen extends StatefulWidget {
  final ProfileModel initial;
  const BasicInfoScreen({super.key, required this.initial});

  @override
  State<BasicInfoScreen> createState() => _BasicInfoScreenState();
}

class _BasicInfoScreenState extends State<BasicInfoScreen> {
  final _formKey = GlobalKey<FormState>();

  late final TextEditingController _name;
  late final TextEditingController _email;
  late final TextEditingController _phone;
  late final TextEditingController _address;
  late final TextEditingController _birthday;
  late final TextEditingController _bank;

  String? _gender;
  bool _saving = false;

  static const _primary = Colors.blue;
  static const _bg = Color(0xFFF5F7FB);
  static const _radius = 14.0;

  @override
  void initState() {
    super.initState();
    final p = widget.initial;
    _name = TextEditingController(text: p.name);
    _email = TextEditingController(text: p.email);
    _phone = TextEditingController(text: p.phone ?? '');
    _address = TextEditingController(text: p.address ?? '');
    _birthday = TextEditingController(text: toDdMMyyyy(p.birthday));
    _bank = TextEditingController(text: p.bankInfo ?? '');
    _gender = (p.gender == null || p.gender!.isEmpty) ? null : p.gender;
  }

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _phone.dispose();
    _address.dispose();
    _birthday.dispose();
    _bank.dispose();
    super.dispose();
  }

  Future<void> _pickBirthday() async {
    DateTime initial = DateTime(2000, 1, 1);
    if (_birthday.text.trim().isNotEmpty) {
      final parts = _birthday.text.trim().split('/');
      if (parts.length == 3) {
        final d = int.tryParse(parts[0]) ?? 1;
        final m = int.tryParse(parts[1]) ?? 1;
        final y = int.tryParse(parts[2]) ?? 2000;
        initial = DateTime(y, m, d);
      }
    }
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
      helpText: 'Chọn ngày sinh',
      builder: (ctx, child) {
        return Theme(
          data: Theme.of(ctx).copyWith(
            colorScheme: const ColorScheme.light(
              primary: _primary,
              onPrimary: Colors.white,
              onSurface: Colors.black87,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      _birthday.text = DateFormat('dd/MM/yyyy').format(picked);
      setState(() {});
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final name = _name.text.trim();
      final address = _address.text.trim();
      final bank = _bank.text.trim();

      // CHỈNH Ở ĐÂY:
      final birthdayYmd = toYyyyMmDdFromDdMMyyyy(_birthday.text.trim());
      final birthdayForApi = birthdayYmd.isEmpty
          ? null
          : birthdayYmd; // "2000-04-20"

      final gender = (_gender == '0' || _gender == '1') ? _gender : null;

      final updated = ProfileModel(
        id: widget.initial.id,
        name: name,
        email: widget.initial.email,
        phone: widget.initial.phone,
        birthday: birthdayForApi,
        address: address.isEmpty ? null : address,
        gender: gender,
        bankInfo: bank.isEmpty ? null : bank,
      );

      await ProfileService.updateBasic(updated);

      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Đã lưu thông tin')));
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(SnackBar(content: Text('Lỗi lưu: $e')));
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
        title: const Text('Thông tin cá nhân'),
        elevation: 0,
      ),
      bottomNavigationBar: SaveButtonBar(
        saving: _saving,
        onPressed: _save,
        color: _primary,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
          children: [
            SectionCard(
              title: 'Thông tin cơ bản',
              radius: _radius,
              children: [
                EditableTextField(
                  controller: _name,
                  label: 'Họ và tên *',
                  validator: (v) => (v == null || v.trim().isEmpty)
                      ? 'Không được để trống'
                      : null,
                ),
                const SizedBox(height: 12),
                ReadonlyCopyField(
                  controller: _email,
                  label: 'Email',
                  icon: Icons.email_outlined,
                  copySnack: 'Đã sao chép email',
                ),
                const SizedBox(height: 12),
                ReadonlyCopyField(
                  controller: _phone,
                  label: 'Số điện thoại',
                  icon: Icons.phone_outlined,
                  copySnack: 'Đã sao chép số điện thoại',
                ),
                const SizedBox(height: 12),
                EditableTextField(
                  controller: _address,
                  label: 'Địa chỉ hiện tại',
                  icon: Icons.home_outlined,
                ),
                const SizedBox(height: 12),
                BirthdayField(controller: _birthday, onPick: _pickBirthday),
              ],
            ),
            const SizedBox(height: 16),
            SectionCard(
              title: 'Tùy chọn hiển thị',
              radius: _radius,
              children: [
                const SubLabel('Giới tính'),
                const SizedBox(height: 8),
                GenderSelector(
                  value: _gender,
                  onChanged: (v) => setState(() => _gender = v),
                  primary: _primary,
                ),
              ],
            ),
            const SizedBox(height: 16),
            SectionCard(
              title: 'Thanh toán',
              radius: _radius,
              children: [
                BankField(controller: _bank, onChanged: (_) => setState(() {})),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
