import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/subscription_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';
import 'course_detail_screen.dart';
import 'package_detail_screen.dart';

class SubscriptionsScreen extends StatefulWidget {
  const SubscriptionsScreen({super.key});

  @override
  State<SubscriptionsScreen> createState() => _SubscriptionsScreenState();
}

class _SubscriptionsScreenState extends State<SubscriptionsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _errorMessage;
  List<SubscriptionModel> _subscriptions = [];

  @override
  void initState() {
    super.initState();
    _fetchSubscriptions();
  }

  Future<void> _fetchSubscriptions() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/subscriptions');
      List<SubscriptionModel> list = [];
      if (response is List) {
        list = response
            .map((item) => SubscriptionModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      if (mounted) {
        setState(() {
          _subscriptions = list;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    return Scaffold(
      appBar: const AppHeader(
        title: 'اشتراكاتي وتفعيلاتي',
        showBackButton: false,
      ),
      body: RefreshIndicator(
        onRefresh: _fetchSubscriptions,
        color: AppColors.primary,
        child: _buildBody(isDark),
      ),
    );
  }

  Widget _buildBody(bool isDark) {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
          strokeWidth: 2.8,
        ),
      );
    }

    if (_errorMessage != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, size: 52, color: AppColors.error),
              const SizedBox(height: 16),
              Text(
                _errorMessage!,
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              ElevatedButton.icon(
                onPressed: _fetchSubscriptions,
                icon: const Icon(Icons.refresh_rounded, size: 18),
                label: const Text('إعادة المحاولة'),
              ),
            ],
          ),
        ),
      );
    }

    if (_subscriptions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.card_membership_rounded,
                  size: 52,
                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'لا توجد اشتراكات نشطة لديك حالياً',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w900,
                  color: isDark ? Colors.white : AppColors.textDark,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'تصفح الكورسات والباقات الشهرية واشترك الآن لبدء رحلة التفوق',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
      itemCount: _subscriptions.length,
      itemBuilder: (context, index) {
        final sub = _subscriptions[index];
        final bool isActive = sub.status == 'ACTIVE';

        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          decoration: BoxDecoration(
            color: isDark ? AppColors.darkCard : AppColors.lightCard,
            borderRadius: BorderRadius.circular(22),
            border: Border.all(
              color: isActive
                  ? AppColors.primary.withOpacity(isDark ? 0.35 : 0.25)
                  : (isDark ? AppColors.darkBorder : AppColors.lightBorder),
              width: 1.2,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(isDark ? 0.25 : 0.04),
                blurRadius: 14,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(22),
            onTap: () {
              if (sub.courseId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => CourseDetailScreen(courseId: sub.courseId!)),
                ).then((_) => _fetchSubscriptions());
              } else if (sub.packageId != null) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => PackageDetailScreen(packageId: sub.packageId!)),
                ).then((_) => _fetchSubscriptions());
              }
            },
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: (isActive ? AppColors.primary : AppColors.warning).withOpacity(isDark ? 0.16 : 0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              isActive ? Icons.check_circle_rounded : Icons.schedule_rounded,
                              size: 13,
                              color: isActive ? AppColors.primary : AppColors.warning,
                            ),
                            const SizedBox(width: 5),
                            Text(
                              isActive ? 'مفعّل ونشط' : 'غير نشط / منتهي',
                              style: TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                color: isActive ? AppColors.primary : AppColors.warning,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Text(
                        sub.targetType == 'PACKAGE' ? 'باقة شهرية' : 'كورس تعليمي',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    sub.targetName,
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 16,
                      color: isDark ? Colors.white : AppColors.textDark,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Divider(
                    height: 1,
                    color: isDark ? AppColors.darkBorder.withOpacity(0.6) : AppColors.lightBorder,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 14,
                            color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                          ),
                          const SizedBox(width: 6),
                          Text(
                            sub.expiresAt != null
                                ? 'ينتهي: ${DateFormat('yyyy/MM/dd').format(sub.expiresAt!)}'
                                : 'صلاحية مفتوحة',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          Text(
                            'الدخول للمحتوى',
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w800,
                              color: AppColors.primary,
                            ),
                          ),
                          const SizedBox(width: 4),
                          const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.primary),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
