import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';
import 'subscriptions_screen.dart';
import 'courses_screen.dart';
import 'packages_screen.dart';
import 'exams_screen.dart';
import 'profile_screen.dart';

class MainNavigationScreen extends StatefulWidget {
  final int initialIndex;

  const MainNavigationScreen({super.key, this.initialIndex = 0});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  late int _currentIndex;

  final List<Widget> _screens = const [
    HomeScreen(),
    SubscriptionsScreen(),
    CoursesScreen(),
    PackagesScreen(),
    ExamsScreen(),
    ProfileScreen(),
  ];

  final List<Map<String, dynamic>> _navItems = const [
    {'icon': Icons.home_rounded, 'outlined': Icons.home_outlined, 'label': 'الرئيسية'},
    {'icon': Icons.card_membership_rounded, 'outlined': Icons.card_membership_outlined, 'label': 'اشتراكاتي'},
    {'icon': Icons.menu_book_rounded, 'outlined': Icons.menu_book_outlined, 'label': 'الكورسات'},
    {'icon': Icons.view_carousel_rounded, 'outlined': Icons.view_carousel_outlined, 'label': 'الباقات'},
    {'icon': Icons.assignment_turned_in_rounded, 'outlined': Icons.assignment_outlined, 'label': 'الامتحانات'},
    {'icon': Icons.person_rounded, 'outlined': Icons.person_outline_rounded, 'label': 'حسابي'},
  ];

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialIndex;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      if (auth.isAuthenticated) {
        auth.refreshProfile();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
          border: Border(
            top: BorderSide(
              color: isDark ? AppColors.darkBorder.withOpacity(0.8) : AppColors.lightBorder,
              width: 1.0,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.35 : 0.04),
              blurRadius: 16,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: List.generate(_navItems.length, (index) {
                final item = _navItems[index];
                final isSelected = _currentIndex == index;

                return InkWell(
                  onTap: () {
                    if (_currentIndex != index) {
                      setState(() {
                        _currentIndex = index;
                      });
                    }
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    curve: Curves.easeOutCubic,
                    padding: EdgeInsets.symmetric(
                      horizontal: isSelected ? 12 : 8,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? AppColors.primary.withOpacity(isDark ? 0.16 : 0.12)
                          : Colors.transparent,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isSelected ? item['icon'] as IconData : item['outlined'] as IconData,
                          size: 22,
                          color: isSelected
                              ? AppColors.primary
                              : (isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          item['label'] as String,
                          style: TextStyle(
                            fontSize: 10.5,
                            fontWeight: isSelected ? FontWeight.w900 : FontWeight.w600,
                            color: isSelected
                                ? AppColors.primary
                                : (isDark ? AppColors.textMutedDark : AppColors.textMutedLight),
                            letterSpacing: -0.2,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
    );
  }
}
