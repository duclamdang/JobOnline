import 'package:flutter/material.dart';

class HeaderSearch extends StatelessWidget {
  final TextEditingController controller;
  final VoidCallback onSearch;
  final VoidCallback onBellTap;

  const HeaderSearch({
    required this.controller,
    required this.onSearch,
    required this.onBellTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF9C8CFF), Color(0xFF6A5BE2)],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ),
      ),
      child: Row(
        children: [
          Expanded(
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  const Icon(Icons.search, color: Colors.grey),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: controller,
                      decoration: const InputDecoration(
                        hintText: 'Tìm công việc tại đây...',
                        border: InputBorder.none,
                        isDense: true,
                      ),
                      textInputAction: TextInputAction.search,
                      onSubmitted: (_) => onSearch(),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(width: 10),
          InkWell(
            onTap: onBellTap,
            borderRadius: BorderRadius.circular(22),
            child: Container(
              height: 44,
              width: 44,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(22),
                boxShadow: const [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(Icons.notifications_none, color: Colors.blue),
            ),
          ),
        ],
      ),
    );
  }
}