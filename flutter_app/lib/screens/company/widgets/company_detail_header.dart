import 'package:flutter/material.dart';

const Color _primaryColor = Color(0xFF1E88E5);
const Color _headerBgColor = Color(0xFF1565C0);
const Color _bannerFallbackBg = Color(0xFFE3F2FD);

class Header extends StatelessWidget {
  final String name;
  final String? logoUrl;
  final String? coverUrl;
  final Widget? child;

  const Header({
    super.key,
    required this.name,
    this.logoUrl,
    this.coverUrl,
    this.child,
  });

  static const double _headerHeight = 220.0;
  static const double _avatarSize = 96.0;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: _headerHeight,
          width: double.infinity,
          child: Stack(
            fit: StackFit.expand,
            children: [
              if (coverUrl != null && coverUrl!.isNotEmpty)
                Image.network(
                  coverUrl!,
                  fit: BoxFit.cover,
                  errorBuilder: (_, __, ___) => Container(
                    color: _headerBgColor,
                    child: const Center(
                      child: Icon(
                        Icons.apartment,
                        size: 48,
                        color: Colors.white70,
                      ),
                    ),
                  ),
                )
              else
                Container(
                  color: _bannerFallbackBg,
                  child: const Center(
                    child: Icon(
                      Icons.apartment,
                      size: 48,
                      color: _primaryColor,
                    ),
                  ),
                ),

              Positioned.fill(
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        // ignore: deprecated_member_use
                        Colors.black.withOpacity(0.0),
                        // ignore: deprecated_member_use
                        Colors.black.withOpacity(0.6),
                      ],
                    ),
                  ),
                ),
              ),

              Align(
                alignment: Alignment.bottomCenter,
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 16),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: _avatarSize,
                        height: _avatarSize,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.white,
                          border: Border.all(color: Colors.white, width: 4),
                          boxShadow: [
                            BoxShadow(
                              // ignore: deprecated_member_use
                              color: Colors.black.withOpacity(0.25),
                              blurRadius: 12,
                              offset: const Offset(0, 6),
                            ),
                          ],
                        ),
                        child: ClipOval(
                          child: (logoUrl == null || logoUrl!.isEmpty)
                              ? const Icon(
                                  Icons.business,
                                  size: 48,
                                  color: Colors.black26,
                                )
                              : Image.network(
                                  logoUrl!,
                                  fit: BoxFit.contain,
                                  errorBuilder: (_, __, ___) => const Icon(
                                    Icons.business,
                                    size: 48,
                                    color: Colors.black26,
                                  ),
                                ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        name,
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),

        if (child != null) child!,
      ],
    );
  }
}
