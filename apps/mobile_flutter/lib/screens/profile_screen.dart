import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../services/legal_links.dart';
import '../widgets/app_header.dart';
import 'welcome_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final auth = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final user = auth.currentUser;

    return Scaffold(
      appBar: const AppHeader(
        title: 'الملف الشخصي والحساب',
        showBackButton: false,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
        child: Column(
          children: [
            // Luxury Profile Card Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(22),
              decoration: BoxDecoration(
                color: isDark ? AppColors.darkCard : AppColors.lightCard,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: AppColors.primaryGradient,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.35),
                          blurRadius: 16,
                          offset: const Offset(0, 5),
                        ),
                      ],
                    ),
                    child: const Icon(Icons.person_rounded, size: 44, color: Colors.white),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    user?.name ?? 'طالب منصة مستر عمر مكاوي',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                      color: isDark ? Colors.white : AppColors.textDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.mobileNumber ?? '',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.school_rounded, size: 14, color: AppColors.primary),
                        const SizedBox(width: 6),
                        Text(
                          user?.academicYearName ?? 'المرحلة الثانوية',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Wallet & Financial Status Card
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: isDark ? AppColors.heroDarkGradient : AppColors.primaryGradient,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primary.withOpacity(isDark ? 0.15 : 0.25),
                    blurRadius: 14,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.account_balance_wallet_rounded, color: AppColors.accentGold, size: 26),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'رصيد المحفظة الإلكترونية',
                          style: TextStyle(fontSize: 12, color: Colors.white70, fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '${(user?.walletBalance ?? 0.0).toStringAsFixed(0)} جنيهاً مصرياً',
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w900,
                            color: Colors.white,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.25),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.lock_rounded, size: 12, color: Colors.white70),
                        SizedBox(width: 4),
                        Text('آمن 100%', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Account Information
            _buildLuxurySection(
              title: 'بيانات الطالب والحساب',
              icon: Icons.badge_outlined,
              isDark: isDark,
              children: [
                _buildInfoTile(
                  icon: Icons.phone_android_rounded,
                  title: 'رقم هاتف الطالب',
                  value: user?.mobileNumber ?? 'غير مسجل',
                  isDark: isDark,
                ),
                if (user?.parentMobileNumber != null && user!.parentMobileNumber!.isNotEmpty)
                  _buildInfoTile(
                    icon: Icons.contact_phone_outlined,
                    title: 'رقم ولي الأمر للمتابعة',
                    value: user.parentMobileNumber!,
                    isDark: isDark,
                  ),
                if (user?.governorate != null && user!.governorate!.isNotEmpty)
                  _buildInfoTile(
                    icon: Icons.location_on_outlined,
                    title: 'المحافظة',
                    value: user.governorate!,
                    isDark: isDark,
                  ),
              ],
            ),
            const SizedBox(height: 16),

            // App Settings & Theme
            _buildLuxurySection(
              title: 'إعدادات التطبيق والمظهر',
              icon: Icons.tune_rounded,
              isDark: isDark,
              children: [
                SwitchListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  title: Text(
                    'الوضع الليلي (Dark Mode)',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textDark,
                    ),
                  ),
                  secondary: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(
                      isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                      color: AppColors.primary,
                      size: 20,
                    ),
                  ),
                  activeColor: AppColors.primary,
                  value: themeProvider.isDarkMode,
                  onChanged: (val) => themeProvider.toggleTheme(),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Legal & Security
            _buildLuxurySection(
              title: 'الخصوصية والأمان',
              icon: Icons.shield_outlined,
              isDark: isDark,
              children: [
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.privacy_tip_outlined, color: AppColors.primary, size: 20),
                  ),
                  title: Text(
                    'سياسة الخصوصية والاستخدام',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: isDark ? Colors.white : AppColors.textDark,
                    ),
                  ),
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? Colors.white38 : Colors.black38),
                  onTap: LegalLinks.openPrivacyPolicy,
                ),
                ListTile(
                  leading: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.error.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.delete_outline_rounded, color: AppColors.error, size: 20),
                  ),
                  title: const Text(
                    'طلب حذف الحساب والبيانات',
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: FontWeight.w700,
                      color: AppColors.error,
                    ),
                  ),
                  trailing: Icon(Icons.arrow_forward_ios_rounded, size: 14, color: isDark ? Colors.white38 : Colors.black38),
                  onTap: LegalLinks.openDeleteAccount,
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Logout Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                      title: const Text('تسجيل الخروج', style: TextStyle(fontWeight: FontWeight.bold)),
                      content: const Text('هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟'),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.pop(ctx, false),
                          child: const Text('إلغاء'),
                        ),
                        ElevatedButton(
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.error),
                          onPressed: () => Navigator.pop(ctx, true),
                          child: const Text('تسجيل الخروج', style: TextStyle(color: Colors.white)),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true) {
                    await auth.logout();
                    if (context.mounted) {
                      Navigator.pushAndRemoveUntil(
                        context,
                        MaterialPageRoute(builder: (_) => const WelcomeScreen()),
                        (route) => false,
                      );
                    }
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.error.withOpacity(0.12),
                  foregroundColor: AppColors.error,
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                    side: BorderSide(color: AppColors.error.withOpacity(0.35)),
                  ),
                ),
                icon: const Icon(Icons.logout_rounded, size: 20),
                label: const Text(
                  'تسجيل الخروج من الحساب',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'منصة مستر عمر مكاوي • الإصدار 1.0.0',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLuxurySection({
    required String title,
    required IconData icon,
    required bool isDark,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkCard : AppColors.lightCard,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
            child: Row(
              children: [
                Icon(icon, size: 18, color: AppColors.primary),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: isDark ? Colors.white : AppColors.textDark,
                  ),
                ),
              ],
            ),
          ),
          Divider(
            height: 1,
            color: isDark ? AppColors.darkBorder.withOpacity(0.6) : AppColors.lightBorder,
          ),
          ...children,
        ],
      ),
    );
  }

  Widget _buildInfoTile({
    required IconData icon,
    required String title,
    required String value,
    required bool isDark,
  }) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(isDark ? 0.16 : 0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(
        title,
        style: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
        ),
      ),
      subtitle: Text(
        value,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w800,
          color: isDark ? Colors.white : AppColors.textDark,
        ),
      ),
    );
  }
}
