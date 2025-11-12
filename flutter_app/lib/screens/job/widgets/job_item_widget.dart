import 'package:flutter/material.dart';

class JobItemWidget extends StatelessWidget {
  final String title;
  final String company;
  final String location;
  final String salary;
  final int remainingDays;
  final bool urgent;
  final String? imageUrl;
  final bool isFavorite;
  final VoidCallback? onFavoriteTap;
  final VoidCallback? onTap;

  const JobItemWidget({
    super.key,
    required this.title,
    required this.company,
    required this.location,
    required this.salary,
    required this.remainingDays,
    required this.urgent,
    this.imageUrl,
    this.isFavorite = false,
    this.onFavoriteTap,
    this.onTap,
  });

  String get _postedText {
    if (remainingDays <= 0) return "Đăng hôm nay";
    if (remainingDays == 1) return "Đăng 1 ngày trước";
    if (remainingDays < 7) return "Đăng $remainingDays ngày trước";
    final weeks = remainingDays ~/ 7;
    return "Đăng $weeks tuần trước";
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 1,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(12),
                ),
                clipBehavior: Clip.antiAlias,
                child: imageUrl == null
                    ? const Icon(Icons.business, size: 28, color: Colors.grey)
                    : Image.network(
                        imageUrl!,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) {
                          return const Icon(
                            Icons.business,
                            size: 28,
                            color: Colors.grey,
                          );
                        },
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Text(
                            title,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.titleMedium?.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        InkWell(
                          onTap: onFavoriteTap,
                          child: Icon(
                            isFavorite ? Icons.favorite : Icons.favorite_border,
                            color: isFavorite ? Colors.purple : Colors.grey,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      company,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(
                          Icons.location_on_outlined,
                          size: 16,
                          color: Colors.grey,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            location,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: Colors.black54,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
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
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.purple,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        if (urgent) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red.shade50,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Gấp',
                              style: theme.textTheme.labelSmall?.copyWith(
                                color: Colors.red,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _postedText,
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.black45,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
