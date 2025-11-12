import 'package:flutter/material.dart';

class TopCard extends StatelessWidget {
  final String? urgentLabel;
  final String? logo;
  final String title;
  final String companyLine;
  final String salary;
  final String location;
  final String quantity;

  const TopCard({
    super.key,
    required this.urgentLabel,
    required this.logo,
    required this.title,
    required this.companyLine,
    required this.salary,
    required this.location,
    required this.quantity,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0.5,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.blue, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 18, 16, 16),
        child: Column(
          children: [
            Stack(
              alignment: Alignment.topLeft,
              children: [
                Center(
                  child: CircleAvatar(
                    radius: 36,
                    backgroundColor: Colors.grey.shade200,
                    backgroundImage: (logo != null && logo!.isNotEmpty)
                        ? NetworkImage(logo!)
                        : null,
                    child: (logo == null || logo!.isEmpty)
                        ? const Icon(
                            Icons.apartment_outlined,
                            size: 32,
                            color: Colors.grey,
                          )
                        : null,
                  ),
                ),
                if (urgentLabel != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade600,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text(
                      'GẤP',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              title,
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(
              companyLine,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 12),
            const Divider(height: 20),
            IntrinsicHeight(
              child: Row(
                children: [
                  MiniStat(
                    icon: Icons.attach_money,
                    label: 'Mức lương',
                    value: salary,
                  ),
                  MiniDivider(),
                  MiniStat(
                    icon: Icons.place_outlined,
                    label: 'Địa điểm',
                    value: location,
                  ),
                  MiniDivider(),
                  MiniStat(
                    icon: Icons.groups_outlined,
                    label: 'Số lượng',
                    value: quantity,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class MiniStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const MiniStat({
    super.key,
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6),
        constraints: const BoxConstraints(minHeight: 70),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 18, color: Colors.teal),
            const SizedBox(height: 6),
            Text(
              label,
              style: const TextStyle(color: Colors.black54, fontSize: 12),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 2),
            Text(
              value,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }
}

class MiniDivider extends StatelessWidget {
  const MiniDivider({super.key});
  @override
  Widget build(BuildContext context) {
    return VerticalDivider(
      color: Colors.grey.shade300,
      thickness: 1,
      width: 24,
    );
  }
}
