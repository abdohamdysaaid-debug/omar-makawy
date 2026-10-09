import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/legal_links.dart';
import 'login_screen.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<Map<String, dynamic>> _onboardingPages = [
    {
      'badge': 'المنصة التعليمية الرسمية',
      'title': 'طريقك نحو التفوق والدرجة النهائية',
      'subtitle': 'شرح مبسط، خرائط ذهنية، وتدريبات مكثفة تضمن لك فهم أعمق وأداء أعلى مع مستر عمر مكاوي.',
      'icon': Icons.school_rounded,
      'accent': AppColors.primary,
      'stats': [
        {'label': 'محاضرة تفاعلية', 'val': '+100'},
        {'label': 'امتحان وبنك أسئلة', 'val': '+500'},
        {'label': 'طالب متفوق', 'val': '+5000'},
      ],
    },
    {
      'badge': 'مشاهدة ذكية فائقة الجودة',
      'title': 'محاضرات فيديو تفاعلية بدون تقطيع',
      'subtitle': 'مشغل فيديو مطور بتقنية تتبع المشاهدة، جودات متعددة، ومذكرات PDF مرفقة مع كل درس.',
      'icon': Icons.play_circle_filled_rounded,
      'accent': Color(0xFF06B6D4),
      'stats': [
        {'label': 'جودة HD', 'val': '1080p'},
        {'label': 'مذكرات رقمية', 'val': 'PDF'},
        {'label': 'تتبع ذكي', 'val': '100%'},
      ],
    },
    {
      'badge': 'تقييم فوري وتحليل أداء',
      'title': 'امتحانات دورية ونماذج إجابة مفصلة',
      'subtitle': 'اختبر معلوماتك بعد كل درس، واطلع على نتيجتك فورا مع فيديو حل وشرح تفصيلي لكل فكرة.',
      'icon': Icons.assignment_turned_in_rounded,
      'accent': AppColors.accentGold,
      'stats': [
        {'label': 'تصحيح لحظي', 'val': 'Instant'},
        {'label': 'فيديو حل', 'val': 'فوري'},
        {'label': 'تقارير دورية', 'val': 'مستمرة'},
      ],
    },
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _navigateToLogin() {
    Navigator.of(context).push(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          const begin = Offset(0.0, 0.08);
          const end = Offset.zero;
          const curve = Curves.easeOutCubic;
          var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
          return SlideTransition(
            position: animation.drive(tween),
            child: FadeTransition(opacity: animation, child: child),
          );
        },
        transitionDuration: const Duration(milliseconds: 350),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: isDark ? AppColors.darkBackground : AppColors.lightBackground,
      body: Stack(
        children: [
          // Background ambient gradient orbs
          Positioned(
            top: -100,
            right: -80,
            child: Container(
              width: 320,
              height: 320,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.primary.withOpacity(isDark ? 0.22 : 0.12),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            bottom: size.height * 0.25,
            left: -100,
            child: Container(
              width: 280,
              height: 280,
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
            child: Column(
              children: [
                // Top Bar: Brand Logo & Title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 44,
                            height: 44,
                            decoration: BoxDecoration(
                              gradient: AppColors.primaryGradient,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.35),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.school_rounded,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'مستر عمر مكاوي',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w900,
                                  color: isDark ? Colors.white : AppColors.textDark,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              Text(
                                'المنصة التعليمية للثانوية العامة',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w600,
                                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                      // Skip or Direct Login
                      TextButton.icon(
                        onPressed: _navigateToLogin,
                        icon: const Icon(Icons.arrow_forward_rounded, size: 16),
                        label: const Text('دخول'),
                        style: TextButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          backgroundColor: AppColors.primary.withOpacity(isDark ? 0.12 : 0.08),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Onboarding Swiper Section
                Expanded(
                  child: PageView.builder(
                    controller: _pageController,
                    onPageChanged: (index) {
                      setState(() {
                        _currentPage = index;
                      });
                    },
                    itemCount: _onboardingPages.length,
                    itemBuilder: (context, index) {
                      final page = _onboardingPages[index];
                      final Color pageAccent = page['accent'];

                      return SingleChildScrollView(
                        padding: const EdgeInsets.symmetric(horizontal: 24.0),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(height: 12),
                            // Hero Visual Card
                            Container(
                              width: double.infinity,
                              height: size.height * 0.30,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isDark
                                      ? [
                                          pageAccent.withOpacity(0.18),
                                          AppColors.darkSurfaceLight,
                                        ]
                                      : [
                                          pageAccent.withOpacity(0.12),
                                          Colors.white,
                                        ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                                borderRadius: BorderRadius.circular(28),
                                border: Border.all(
                                  color: pageAccent.withOpacity(isDark ? 0.3 : 0.25),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: pageAccent.withOpacity(0.15),
                                    blurRadius: 24,
                                    offset: const Offset(0, 8),
                                  ),
                                ],
                              ),
                              child: Stack(
                                alignment: Alignment.center,
                                children: [
                                  // Background Decorative Circles
                                  Positioned(
                                    top: 20,
                                    right: 20,
                                    child: Icon(
                                      Icons.star_rounded,
                                      size: 32,
                                      color: pageAccent.withOpacity(0.3),
                                    ),
                                  ),
                                  Positioned(
                                    bottom: 20,
                                    left: 20,
                                    child: Icon(
                                      Icons.auto_awesome_rounded,
                                      size: 28,
                                      color: pageAccent.withOpacity(0.3),
                                    ),
                                  ),

                                  // Central Floating Icon
                                  Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Container(
                                        width: 88,
                                        height: 88,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: pageAccent.withOpacity(0.2),
                                          border: Border.all(
                                            color: pageAccent,
                                            width: 2.5,
                                          ),
                                          boxShadow: [
                                            BoxShadow(
                                              color: pageAccent.withOpacity(0.4),
                                              blurRadius: 20,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                        ),
                                        child: Icon(
                                          page['icon'] as IconData,
                                          size: 46,
                                          color: isDark ? Colors.white : pageAccent,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),

                            // Badge
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                              decoration: BoxDecoration(
                                color: pageAccent.withOpacity(isDark ? 0.15 : 0.1),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: pageAccent.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(Icons.verified_rounded, size: 14, color: pageAccent),
                                  const SizedBox(width: 6),
                                  Text(
                                    page['badge'] as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: pageAccent,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 14),

                            // Title
                            Text(
                              page['title'] as String,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w900,
                                color: isDark ? Colors.white : AppColors.textDark,
                                height: 1.35,
                                letterSpacing: -0.4,
                              ),
                            ),
                            const SizedBox(height: 10),

                            // Subtitle
                            Text(
                              page['subtitle'] as String,
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 13.5,
                                fontWeight: FontWeight.w500,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                height: 1.55,
                              ),
                            ),
                            const SizedBox(height: 20),

                            // Quick Stats Grid
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: (page['stats'] as List<Map<String, String>>).map((stat) {
                                return Container(
                                  margin: const EdgeInsets.symmetric(horizontal: 6),
                                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                                  decoration: BoxDecoration(
                                    color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: isDark ? AppColors.darkBorder : AppColors.lightBorder,
                                    ),
                                  ),
                                  child: Column(
                                    children: [
                                      Text(
                                        stat['val']!,
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w900,
                                          color: pageAccent,
                                        ),
                                      ),
                                      Text(
                                        stat['label']!,
                                        style: TextStyle(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.w600,
                                          color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                        ),
                                      ),
                                    ],
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),

                // Bottom Controls: Page Indicator + Main CTA Buttons
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 20),
                  child: Column(
                    children: [
                      // Smooth Animated Page Indicator
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _onboardingPages.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            height: 6,
                            width: _currentPage == index ? 28 : 8,
                            decoration: BoxDecoration(
                              color: _currentPage == index
                                  ? AppColors.primary
                                  : (isDark ? AppColors.darkSurfaceBorder : AppColors.lightSurfaceBorder),
                              borderRadius: BorderRadius.circular(10),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),

                      // Primary Action: Start / Login Button
                      SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: AppColors.primaryGradient,
                            borderRadius: BorderRadius.circular(18),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primary.withOpacity(0.4),
                                blurRadius: 18,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ElevatedButton(
                            onPressed: _navigateToLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.transparent,
                              shadowColor: Colors.transparent,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(18),
                              ),
                            ),
                            child: const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  'تسجيل الدخول إلى حسابك',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.white,
                                    letterSpacing: -0.2,
                                  ),
                                ),
                                SizedBox(width: 8),
                                Icon(Icons.arrow_back_rounded, color: Colors.white, size: 20),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Privacy & Legal Links
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          TextButton(
                            onPressed: LegalLinks.openPrivacyPolicy,
                            child: Text(
                              'سياسة الخصوصية والاستخدام',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w600,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
