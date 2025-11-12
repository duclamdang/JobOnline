import 'package:flutter/material.dart';

Widget buttonGrid(List<Widget> items, {int crossAxisCount = 2}) {
    return GridView.count(
      crossAxisCount: crossAxisCount,
      childAspectRatio: 2.0,
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      children: items,
    );
  }