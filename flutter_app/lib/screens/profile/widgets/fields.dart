import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class BaseInputDecoration {
  static InputDecoration dec(
    String label, {
    String? hint,
    Widget? trailing,
    IconData? leading,
    double radius = 14,
    Color primary = Colors.blue,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixIcon: leading == null
          ? null
          // ignore: deprecated_member_use
          : Icon(leading, color: primary.withOpacity(.9)),
      suffixIcon: trailing,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(radius)),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius),
        borderSide: BorderSide(color: Colors.blueGrey.shade100),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius),
        borderSide: BorderSide(color: primary, width: 1.5),
      ),
      disabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(radius),
        borderSide: BorderSide(color: Colors.blueGrey.shade100),
      ),
    );
  }
}

class EditableTextField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final IconData? icon;
  final String? Function(String?)? validator;

  const EditableTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.icon,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      decoration: BaseInputDecoration.dec(label, hint: hint, leading: icon),
      validator: validator,
    );
  }
}

class ReadonlyCopyField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final String copySnack;

  const ReadonlyCopyField({
    super.key,
    required this.controller,
    required this.label,
    required this.icon,
    required this.copySnack,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      enabled: false,
      decoration: BaseInputDecoration.dec(
        label,
        leading: icon,
        trailing: IconButton(
          tooltip: 'Sao chép',
          icon: const Icon(Icons.content_copy_rounded),
          onPressed: () {
            final text = controller.text.trim();
            if (text.isEmpty) return;
            Clipboard.setData(ClipboardData(text: text));
            ScaffoldMessenger.of(
              context,
            ).showSnackBar(SnackBar(content: Text(copySnack)));
          },
        ),
      ),
    );
  }
}

class BirthdayField extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onPick;
  const BirthdayField({
    super.key,
    required this.controller,
    required this.onPick,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      readOnly: true,
      onTap: onPick,
      decoration: BaseInputDecoration.dec(
        'Ngày sinh',
        hint: 'dd/MM/yyyy',
        leading: Icons.cake_outlined,
        trailing: IconButton(
          onPressed: onPick,
          icon: const Icon(Icons.calendar_month_outlined),
        ),
      ),
    );
  }
}

class BankField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String>? onChanged;
  const BankField({super.key, required this.controller, this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      onChanged: onChanged,
      decoration: BaseInputDecoration.dec(
        'Thông tin ngân hàng',
        leading: Icons.account_balance_outlined,
        trailing: controller.text.isEmpty
            ? null
            : IconButton(
                icon: const Icon(Icons.clear),
                onPressed: () {
                  controller.clear();
                  onChanged?.call('');
                },
              ),
      ),
    );
  }
}
