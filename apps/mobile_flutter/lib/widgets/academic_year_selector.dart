import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/academic_year.dart';

class AcademicYearSelector extends StatelessWidget {
  final List<AcademicYear> years;
  final String selectedYearId;
  final ValueChanged<String> onSelect;

  const AcademicYearSelector({
    super.key,
    required this.years,
    required this.selectedYearId,
    required this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SizedBox(
      height: 44,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: years.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final year = years[index];
          final isSelected = year.id == selectedYearId;

          return GestureDetector(
            onTap: () => onSelect(year.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: isSelected
                    ? AppColors.primary
                    : (isDark ? AppColors.darkSurfaceLight : AppColors.lightSurfaceLight),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: isSelected
                      ? AppColors.primary
                      : (isDark ? AppColors.darkSurfaceBorder : AppColors.lightSurfaceBorder),
                  width: 1,
                ),
              ),
              child: Center(
                child: Text(
                  year.name,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    color: isSelected
                        ? Colors.white
                        : (isDark ? AppColors.textMutedDark : AppColors.textDark),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
