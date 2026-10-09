import 'package:flutter/material.dart';
import '../config/theme.dart';

class AppHeader extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;
  final List<Widget>? actions;
  final int unreadNotifications;
  final VoidCallback? onNotificationsTap;

  const AppHeader({
    super.key,
    required this.title,
    this.showBackButton = false,
    this.actions,
    this.unreadNotifications = 0,
    this.onNotificationsTap,
  });

  @override
  Size get preferredSize => const Size.fromHeight(60);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppBar(
      automaticallyImplyLeading: false,
      elevation: 0,
      backgroundColor: isDark ? AppColors.darkSurface : AppColors.lightSurface,
      surfaceTintColor: Colors.transparent,
      titleSpacing: showBackButton ? 0 : 16,
      leading: showBackButton
          ? Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8.0),
              child: Center(
                child: InkWell(
                  onTap: () => Navigator.pop(context),
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkSurfaceLight : AppColors.lightSurfaceLight,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                      ),
                    ),
                    child: Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 14,
                      color: isDark ? Colors.white : AppColors.textDark,
                    ),
                  ),
                ),
              ),
            )
          : null,
      title: Text(
        title,
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.w900,
          color: isDark ? AppColors.textLight : AppColors.textDark,
          letterSpacing: -0.3,
        ),
      ),
      centerTitle: true,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(
          height: 1,
          color: isDark ? AppColors.darkBorder.withOpacity(0.6) : AppColors.lightBorder.withOpacity(0.8),
        ),
      ),
      actions: actions ??
          (onNotificationsTap != null
              ? [
                  Padding(
                    padding: const EdgeInsets.only(left: 12.0),
                    child: Center(
                      child: InkWell(
                        onTap: onNotificationsTap,
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.darkSurfaceLight : AppColors.lightSurfaceLight,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                            ),
                          ),
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              Icon(
                                Icons.notifications_none_rounded,
                                size: 20,
                                color: isDark ? Colors.white70 : AppColors.textDark,
                              ),
                              if (unreadNotifications > 0)
                                Positioned(
                                  right: -2,
                                  top: -2,
                                  child: Container(
                                    width: 9,
                                    height: 9,
                                    decoration: BoxDecoration(
                                      color: AppColors.error,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: isDark ? AppColors.darkSurface : Colors.white,
                                        width: 1.5,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ]
              : null),
    );
  }
}
