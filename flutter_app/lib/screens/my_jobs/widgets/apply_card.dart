import 'package:flutter/material.dart';

class AppliedCard extends StatelessWidget {
  final String title;
  final String companyLine;
  final String salary;
  final String location;
  final String? logo;
  final String endDateText;
  final String statusText;
  final VoidCallback onViewProfile;

  const AppliedCard({
    super.key,
    required this.title,
    required this.companyLine,
    required this.salary,
    required this.location,
    required this.endDateText,
    required this.statusText,
    required this.onViewProfile,
    this.logo,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.black12),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 4,
              offset: Offset(0, 1),
            ),
          ],
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _Logo(logo: logo),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // title
                      Text(
                        title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        companyLine,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.black87),
                      ),
                      const SizedBox(height: 6),
                      if (location.isNotEmpty) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.place_outlined,
                              size: 16,
                              color: Colors.black54,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                location,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(color: Colors.black54),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                      ],
                      if (salary.isNotEmpty) ...[
                        Row(
                          children: [
                            const Icon(
                              Icons.payments_outlined,
                              size: 16,
                              color: Colors.purple,
                            ),
                            const SizedBox(width: 4),
                            Text(
                              salary,
                              style: const TextStyle(
                                color: Colors.purple,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                      ],
                      if (endDateText.isNotEmpty)
                        Row(
                          children: [
                            const Icon(
                              Icons.access_time,
                              size: 14,
                              color: Colors.black45,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              endDateText,
                              style: const TextStyle(
                                color: Colors.black45,
                                fontSize: 12,
                              ),
                            ),
                          ],
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: RichText(
                    text: TextSpan(
                      style: const TextStyle(
                        color: Colors.black54,
                        fontSize: 14,
                      ),
                      children: [
                        const TextSpan(text: 'Trạng thái: '),
                        TextSpan(
                          text: statusText,
                          style: const TextStyle(color: Colors.green),
                        ),
                      ],
                    ),
                  ),
                ),
                TextButton(
                  onPressed: onViewProfile,
                  style: TextButton.styleFrom(
                    backgroundColor: Colors.green.shade50,
                    foregroundColor: Colors.green.shade700,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 8,
                    ),
                    minimumSize: const Size(0, 0),
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Xem CV',
                    style: TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Logo extends StatelessWidget {
  final String? logo;
  const _Logo({this.logo});

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(8),
      child: Container(
        width: 50,
        height: 50,
        color: Colors.grey.shade200,
        child: (logo == null || logo!.isEmpty)
            ? const Icon(Icons.apartment_outlined, color: Colors.grey)
            : Image.network(
                logo!,
                fit: BoxFit.cover,
                errorBuilder: (_, __, ___) =>
                    const Icon(Icons.broken_image_outlined, color: Colors.grey),
              ),
      ),
    );
  }
}
