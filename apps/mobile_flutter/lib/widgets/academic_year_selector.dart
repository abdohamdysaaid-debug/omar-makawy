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
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: years.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final year = years[index];
          final isSelected = year.id == selectedYearId;

          return GestureDetector(
            onTap: () => onSelect(year.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 250),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                gradient: isSelected ? AppColors.primaryGradient : null,
                color: isSelected
                    ? null
                    : (isDark ? AppColors.darkCard : AppColors.lightCard),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected
                      ? Colors.transparent
                      : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
                  width: 1.2,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ]
                    : null,
              ),
              child: Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isSelected) ...[
                      const Icon(Icons.check_circle_rounded, size: 14, color: Colors.white),
                      const SizedBox(width: 6),
                    ],
                    Text(
                      year.name,
                      style: TextStyle(
                        fontSize: 12.5,
                        fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                        color: isSelected
                            ? Colors.white
                            : (isDark ? AppColors.textMutedDark : AppColors.textDark),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
