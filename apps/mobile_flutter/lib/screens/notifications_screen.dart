import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../config/theme.dart';
import '../models/notification_model.dart';
import '../services/api_service.dart';
import '../widgets/app_header.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final ApiService _apiService = ApiService();
  bool _isLoading = true;
  String? _errorMessage;
  List<NotificationModel> _notifications = [];

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await _apiService.get('/notifications');
      List<NotificationModel> list = [];
      if (response is List) {
        list = response.map((item) => NotificationModel.fromJson(item as Map<String, dynamic>)).toList();
      } else if (response is Map<String, dynamic> && response['data'] is List) {
        list = (response['data'] as List)
            .map((item) => NotificationModel.fromJson(item as Map<String, dynamic>))
            .toList();
      }

      if (mounted) {
        setState(() {
          _notifications = list;
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

  Future<void> _markAllAsRead() async {
    try {
      await _apiService.patch('/notifications/read-all');
      _fetchNotifications();
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final dateFormat = DateFormat('yyyy/MM/dd - hh:mm a');

    return Scaffold(
      appBar: AppHeader(
        title: 'الإشعارات والتنبيهات',
        showBackButton: true,
        actions: [
          if (_notifications.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(left: 8.0),
              child: TextButton(
                onPressed: _markAllAsRead,
                child: const Text(
                  'قراءة الكل',
                  style: TextStyle(color: AppColors.primary, fontSize: 12.5, fontWeight: FontWeight.bold),
                ),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        color: AppColors.primary,
        child: _isLoading
            ? const Center(
                child: CircularProgressIndicator(
                  color: AppColors.primary,
                  strokeWidth: 2.8,
                ),
              )
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.error_outline_rounded, size: 48, color: AppColors.error),
                          const SizedBox(height: 14),
                          Text(_errorMessage!, textAlign: TextAlign.center),
                          const SizedBox(height: 18),
                          ElevatedButton(
                            onPressed: _fetchNotifications,
                            child: const Text('إعادة المحاولة'),
                          ),
                        ],
                      ),
                    ),
                  )
                : _notifications.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: isDark ? AppColors.darkSurface : AppColors.lightSurface,
                                shape: BoxShape.circle,
                              ),
                              child: Icon(
                                Icons.notifications_off_outlined,
                                size: 48,
                                color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'لا توجد إشعارات جديدة حالياً',
                              style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : AppColors.textDark,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notif = _notifications[index];
                          return Container(
                            margin: const EdgeInsets.only(bottom: 12),
                            decoration: BoxDecoration(
                              color: notif.isRead
                                  ? (isDark ? AppColors.darkCard : AppColors.lightCard)
                                  : (isDark
                                      ? AppColors.primary.withOpacity(0.10)
                                      : AppColors.primary.withOpacity(0.06)),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(
                                color: notif.isRead
                                    ? (isDark ? AppColors.darkBorder : AppColors.lightBorder)
                                    : AppColors.primary.withOpacity(0.35),
                                width: notif.isRead ? 1.0 : 1.4,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(isDark ? 0.2 : 0.03),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: ListTile(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              leading: Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: notif.isRead
                                      ? (isDark ? AppColors.darkSurfaceLight : AppColors.lightSurfaceLight)
                                      : AppColors.primary.withOpacity(0.18),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  Icons.notifications_rounded,
                                  color: notif.isRead
                                      ? (isDark ? AppColors.textMutedDark : AppColors.textMutedLight)
                                      : AppColors.primary,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                notif.title,
                                style: TextStyle(
                                  fontWeight: notif.isRead ? FontWeight.w700 : FontWeight.w900,
                                  fontSize: 14.5,
                                  color: isDark ? Colors.white : AppColors.textDark,
                                  letterSpacing: -0.2,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 4),
                                  Text(
                                    notif.body,
                                    style: TextStyle(
                                      fontSize: 13,
                                      color: isDark ? AppColors.textMutedDark : AppColors.textMutedLight,
                                      height: 1.4,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    dateFormat.format(notif.createdAt),
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: isDark ? Colors.white30 : Colors.black38,
                                    ),
                                  ),
                                ],
                              ),
                              onTap: () async {
                                if (!notif.isRead) {
                                  try {
                                    await _apiService.patch('/notifications/${notif.id}/read');
                                    _fetchNotifications();
                                  } catch (_) {}
                                }
                              },
                            ),
                          );
                        },
                      ),
      ),
    );
  }
}
