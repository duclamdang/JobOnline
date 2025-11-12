import 'package:flutter/material.dart';

class SettingItem extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final TextStyle? titleStyle;
  final VoidCallback? onTap;

  const SettingItem({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.title,
    this.titleStyle,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      child: ListTile(
        onTap: onTap,
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            // ignore: deprecated_member_use
            color: iconColor.withOpacity(0.08),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor),
        ),
        title: Text(
          title,
          style: titleStyle ?? const TextStyle(fontWeight: FontWeight.w500),
        ),
        trailing: const Icon(Icons.chevron_right),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12),
      ),
    );
  }
}
