import 'package:flutter/material.dart';

class CompanyHeader extends StatelessWidget {
  final String? logo;
  final String name;
  final String? address;
  const CompanyHeader({
    super.key,
    required this.logo,
    required this.name,
    this.address,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.grey.shade200,
          backgroundImage: (logo != null && logo!.isNotEmpty)
              ? NetworkImage(logo!)
              : null,
          child: (logo == null || logo!.isEmpty)
              ? const Icon(
                  Icons.apartment_outlined,
                  size: 24,
                  color: Colors.grey,
                )
              : null,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 16,
                ),
              ),
              if ((address ?? '').isNotEmpty)
                Text(address!, style: const TextStyle(color: Colors.black54)),
            ],
          ),
        ),
      ],
    );
  }
}
