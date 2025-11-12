import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class DraggableFab extends StatefulWidget {
  const DraggableFab({
    super.key,
    required this.onPressed,
    this.heroTag,
    this.initialOffset,
    this.diameter = 60,
    this.margin = const EdgeInsets.all(16),
    this.snapToEdges = true,
    this.tooltip = 'Chat trợ lý',
  });

  final VoidCallback onPressed;
  final String? heroTag;
  final Offset? initialOffset;
  final double diameter;
  final EdgeInsets margin;
  final bool snapToEdges;
  final String tooltip;

  @override
  State<DraggableFab> createState() => _DraggableFabState();
}

class _DraggableFabState extends State<DraggableFab> {
  Offset? _pos;
  bool _dragging = false;

  Offset _clamp(Offset p, double maxW, double maxH) {
    final minX = widget.margin.left;
    final minY = widget.margin.top;
    final maxX = maxW - widget.diameter - widget.margin.right;
    final maxY = maxH - widget.diameter - widget.margin.bottom;
    return Offset(p.dx.clamp(minX, maxX), p.dy.clamp(minY, maxY));
  }

  Offset _snapToEdge(Offset p, double maxW) {
    final minX = widget.margin.left;
    final maxX = maxW - widget.diameter - widget.margin.right;
    final middle = (minX + maxX) / 2;
    final snappedX = p.dx <= middle ? minX : maxX;
    return Offset(snappedX, p.dy);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: true,
      bottom: false,
      child: LayoutBuilder(
        builder: (context, c) {
          final maxW = c.maxWidth;
          final maxH = c.maxHeight;

          _pos ??= _clamp(
            widget.initialOffset ??
                Offset(
                  maxW - widget.diameter - widget.margin.right,
                  maxH - widget.diameter - widget.margin.bottom,
                ),
            maxW,
            maxH,
          );

          final diameter = widget.diameter;

          return Stack(
            children: [
              AnimatedPositioned(
                duration: _dragging
                    ? Duration.zero
                    : const Duration(milliseconds: 200),
                curve: Curves.easeOutCubic,
                left: _pos!.dx,
                top: _pos!.dy,
                child: Listener(
                  onPointerDown: (_) {
                    setState(() => _dragging = true);
                    HapticFeedback.selectionClick();
                  },
                  onPointerUp: (_) {
                    setState(() => _dragging = false);
                  },
                  child: GestureDetector(
                    onPanUpdate: (d) {
                      setState(() {
                        _pos = _clamp(_pos! + d.delta, maxW, maxH);
                      });
                    },
                    onPanEnd: (_) {
                      if (!widget.snapToEdges) return;
                      setState(() {
                        _pos = _clamp(_snapToEdge(_pos!, maxW), maxW, maxH);
                      });
                    },
                    onLongPress: () {
                      setState(() {
                        _pos = _clamp(
                          Offset(
                            maxW - diameter - widget.margin.right,
                            maxH - diameter - widget.margin.bottom,
                          ),
                          maxW,
                          maxH,
                        );
                      });
                      HapticFeedback.mediumImpact();
                    },
                    child: _BlueGlowFab(
                      diameter: diameter,
                      heroTag: widget.heroTag,
                      tooltip: widget.tooltip,
                      dragging: _dragging,
                      onPressed: widget.onPressed,
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _BlueGlowFab extends StatelessWidget {
  const _BlueGlowFab({
    required this.diameter,
    required this.heroTag,
    required this.tooltip,
    required this.dragging,
    required this.onPressed,
  });

  final double diameter;
  final String? heroTag;
  final String tooltip;
  final bool dragging;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    const Color c1 = Color(0xFF1A73E8);
    const Color c2 = Color(0xFF3BA5FF);
    const Color c3 = Color(0xFF0B5BD3);

    return AnimatedScale(
      duration: const Duration(milliseconds: 120),
      scale: dragging ? 0.94 : 1.0,
      child: SizedBox(
        width: diameter,
        height: diameter,
        child: Stack(
          alignment: Alignment.center,
          children: [
            AnimatedOpacity(
              duration: const Duration(milliseconds: 200),
              opacity: dragging ? 0.45 : 0.25,
              child: Container(
                width: diameter + 18,
                height: diameter + 18,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(color: c3, blurRadius: 24, spreadRadius: 6),
                  ],
                ),
              ),
            ),
            Material(
              color: Colors.transparent,
              shape: const CircleBorder(),
              elevation: 8,
              // ignore: deprecated_member_use
              shadowColor: c3.withOpacity(0.55),
              child: Tooltip(
                message: tooltip,
                preferBelow: false,
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: onPressed,
                  child: Ink(
                    width: diameter,
                    height: diameter,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: const LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [c1, c2],
                      ),
                      border: Border.all(
                        // ignore: deprecated_member_use
                        color: Colors.white.withOpacity(0.55),
                        width: 1,
                      ),
                    ),
                    child: const Icon(
                      Icons.chat_bubble_rounded,
                      color: Colors.white,
                      size: 26,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
