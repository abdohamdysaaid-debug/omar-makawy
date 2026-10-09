import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../config/theme.dart';
import '../providers/auth_provider.dart';
import '../services/legal_links.dart';
import 'main_navigation_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _rememberMe = true;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    );
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOutCubic,
    ));

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _mobileController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.login(
      _mobileController.text.trim(),
      _passwordController.text,
    );

    if (success && mounted) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const MainNavigationScreen()),
        (route) => false,
      );
    } else if (mounted && authProvider.errorMessage != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.error_outline_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  authProvider.errorMessage!,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ],
          ),
          backgroundColor: AppColors.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: Navigator.canPop(context)
            ? IconButton(
                icon: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                    shape: BoxShape.circle,
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
                onPressed: () => Navigator.pop(context),
              )
            : null,
      ),
      body: Stack(
        children: [
          // Background ambient light gradients
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withOpacity(isDark ? 0.20 : 0.10),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: -80,
            left: -80,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF06B6D4).withOpacity(isDark ? 0.15 : 0.08),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 12.0),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Form(
                      key: _formKey,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          // Luxury Logo Badge
                          Center(
                            child: Container(
                              width: 86,
                              height: 86,
                              decoration: BoxDecoration(
                                gradient: AppColors.primaryGradient,
                                borderRadius: BorderRadius.circular(26),
                                boxShadow: [
                                  BoxShadow(
                                    color: AppColors.primary.withOpacity(0.40),
                                    blurRadius: 24,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  const Icon(
                                    Icons.school_rounded,
                                    size: 46,
                                    color: Colors.white,
                                  ),
                                  Positioned(
                                    top: 8,
                                    right: 8,
                                    child: Container(
                                      padding: const EdgeInsets.all(3),
                                      decoration: const BoxDecoration(
                                        color: AppColors.accentGold,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.star_rounded,
                                        size: 10,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Welcome Titles
                          Text(
                            'أهلاً بك مجدداً 👋',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 24,
                              fontWeight: FontWeight.w900,
                              color: isDark ? Colors.white : AppColors.textDark,
                              letterSpacing: -0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'سجّل الدخول للمتابعة مع مستر عمر مكاوي',
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontSize: 13.5,
                              fontWeight: FontWeight.w500,
                              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                            ),
                          ),
                          const SizedBox(height: 32),

                          // Main Form Container Card
                          Container(
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
                                  blurRadius: 20,
                                  offset: const Offset(0, 6),
                                ),
                              ],
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                // Mobile Field Header
                                Row(
                                  children: [
                                    Icon(
                                      Icons.phone_android_rounded,
                                      size: 16,
                                      color: AppColors.primary,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'رقم الموبايل المسجل',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? Colors.white70 : AppColors.textDark,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                // Mobile Input
                                TextFormField(
                                  controller: _mobileController,
                                  keyboardType: TextInputType.phone,
                                  textDirection: TextDirection.ltr,
                                  textAlign: TextAlign.left,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.5,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: '01012345678',
                                    hintStyle: TextStyle(
                                      color: isDark ? Colors.white30 : Colors.black26,
                                      fontWeight: FontWeight.normal,
                                    ),
                                    prefixIcon: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 12),
                                      margin: const EdgeInsets.only(right: 8),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          const Text(
                                            '🇪🇬 +20',
                                            style: TextStyle(
                                              fontSize: 13,
                                              fontWeight: FontWeight.w800,
                                              color: AppColors.primary,
                                            ),
                                          ),
                                          const SizedBox(width: 8),
                                          Container(
                                            height: 20,
                                            width: 1,
                                            color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.trim().isEmpty) {
                                      return 'يرجى إدخال رقم الموبايل';
                                    }
                                    final trimmed = value.trim();
                                    final regex = RegExp(r'^01[0125][0-9]{8}$');
                                    if (!regex.hasMatch(trimmed)) {
                                      return 'رقم الموبايل يجب أن يتكون من 11 رقماً ويبدأ بـ 010 أو 011 أو 012 أو 015';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 18),

                                // Password Field Header
                                Row(
                                  children: [
                                    Icon(
                                      Icons.lock_outline_rounded,
                                      size: 16,
                                      color: AppColors.primary,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      'كلمة المرور',
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: isDark ? Colors.white70 : AppColors.textDark,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),

                                // Password Input
                                TextFormField(
                                  controller: _passwordController,
                                  obscureText: _obscurePassword,
                                  style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.w600,
                                  ),
                                  decoration: InputDecoration(
                                    hintText: '••••••••',
                                    prefixIcon: const Icon(
                                      Icons.shield_outlined,
                                      color: AppColors.primary,
                                      size: 20,
                                    ),
                                    suffixIcon: IconButton(
                                      icon: Icon(
                                        _obscurePassword
                                            ? Icons.visibility_off_rounded
                                            : Icons.visibility_rounded,
                                        color: isDark ? Colors.white54 : Colors.black45,
                                        size: 20,
                                      ),
                                      onPressed: () {
                                        setState(() {
                                          _obscurePassword = !_obscurePassword;
                                        });
                                      },
                                    ),
                                  ),
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'يرجى إدخال كلمة المرور';
                                    }
                                    if (value.length < 6) {
                                      return 'كلمة المرور يجب ألا تقل عن 6 أحرف';
                                    }
                                    return null;
                                  },
                                ),
                                const SizedBox(height: 14),

                                // Remember Me & Device Notice
                                Row(
                                  children: [
                                    SizedBox(
                                      height: 24,
                                      width: 24,
                                      child: Checkbox(
                                        value: _rememberMe,
                                        activeColor: AppColors.primary,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        onChanged: (val) {
                                          setState(() {
                                            _rememberMe = val ?? true;
                                          });
                                        },
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Text(
                                      'تذكر هذا الجهاز',
                                      style: TextStyle(
                                        fontSize: 12.5,
                                        fontWeight: FontWeight.w600,
                                        color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                      ),
                                    ),
                                    const Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withOpacity(isDark ? 0.15 : 0.1),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Row(
                                        children: [
                                          Icon(Icons.devices_rounded, size: 12, color: AppColors.primary),
                                          SizedBox(width: 4),
                                          Text(
                                            'حماية جهازين',
                                            style: TextStyle(
                                              fontSize: 11,
                                              fontWeight: FontWeight.bold,
                                              color: AppColors.primary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 24),

                                // Login Button
                                SizedBox(
                                  height: 54,
                                  child: DecoratedBox(
                                    decoration: BoxDecoration(
                                      gradient: AppColors.primaryGradient,
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: [
                                        BoxShadow(
                                          color: AppColors.primary.withOpacity(0.38),
                                          blurRadius: 16,
                                          offset: const Offset(0, 5),
                                        ),
                                      ],
                                    ),
                                    child: ElevatedButton(
                                      onPressed: authProvider.isLoading ? null : _handleLogin,
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.transparent,
                                        shadowColor: Colors.transparent,
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                      ),
                                      child: authProvider.isLoading
                                          ? const SizedBox(
                                              width: 24,
                                              height: 24,
                                              child: CircularProgressIndicator(
                                                color: Colors.white,
                                                strokeWidth: 2.5,
                                              ),
                                            )
                                          : const Row(
                                              mainAxisAlignment: MainAxisAlignment.center,
                                              children: [
                                                Text(
                                                  'تسجيل الدخول للمنصة',
                                                  style: TextStyle(
                                                    fontSize: 16,
                                                    fontWeight: FontWeight.w900,
                                                    color: Colors.white,
                                                  ),
                                                ),
                                                SizedBox(width: 8),
                                                Icon(Icons.login_rounded, color: Colors.white, size: 20),
                                              ],
                                            ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 20),

                          // Security / Encrypted Badge
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.lock_rounded,
                                size: 13,
                                color: isDark ? Colors.white38 : Colors.black38,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                'اتصال مشفر وآمن بالكامل مع خوادم المنصة',
                                style: TextStyle(
                                  fontSize: 11.5,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? Colors.white38 : Colors.black38,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          // Legal Links
                          Wrap(
                            alignment: WrapAlignment.center,
                            spacing: 8,
                            children: [
                              TextButton(
                                onPressed: LegalLinks.openPrivacyPolicy,
                                child: Text(
                                  'سياسة الخصوصية',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                  ),
                                ),
                              ),
                              Text(
                                '•',
                                style: TextStyle(
                                  color: isDark ? Colors.white24 : Colors.black26,
                                ),
                              ),
                              TextButton(
                                onPressed: LegalLinks.openDeleteAccount,
                                child: Text(
                                  'طلب حذف الحساب',
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
