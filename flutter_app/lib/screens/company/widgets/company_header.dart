import 'package:flutter/material.dart';

class CompanyHeader extends StatelessWidget {
  final String? logo;
  final String name;
  final String? address;
  final VoidCallback? onTap;

  const CompanyHeader({
    super.key,
    this.logo,
    required this.name,
    this.address,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (logo != null)
            ClipOval(
              child: Image.network(
                logo!,
                width: 48,
                height: 48,
                fit: BoxFit.cover,
              ),
            )
          else
            const Icon(Icons.business, size: 48, color: Colors.black26),

          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  name,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                if (address != null && address!.isNotEmpty) ...[
                  const SizedBox(height: 4),
                  Text(
                    address!,
                    style: const TextStyle(fontSize: 13, color: Colors.black54),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
