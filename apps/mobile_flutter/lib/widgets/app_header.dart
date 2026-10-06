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
  Size get preferredSize => const Size.fromHeight(56);

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return AppBar(
      automaticallyImplyLeading: false,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 20),
              onPressed: () => Navigator.pop(context),
            )
          : null,
      title: Text(
        title,
        style: TextStyle(
          fontSize: 17,
          fontWeight: FontWeight.bold,
          color: isDark ? AppColors.textLight : AppColors.textDark,
        ),
      ),
      centerTitle: true,
      actions: actions ??
          (onNotificationsTap != null
              ? [
                  Stack(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.notifications_outlined),
                        onPressed: onNotificationsTap,
                      ),
                      if (unreadNotifications > 0)
                        Positioned(
                          right: 12,
                          top: 12,
                          child: Container(
                            width: 8,
                            height: 8,
                            decoration: const BoxDecoration(
                              color: AppColors.error,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                    ],
                  ),
                ]
              : null),
    );
  }
}
