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

      setState(() {
        _notifications = list;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isLoading = false;
      });
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
            TextButton(
              onPressed: _markAllAsRead,
              child: const Text(
                'تحديد الكل كمقروء',
                style: TextStyle(color: AppColors.primary, fontSize: 12),
              ),
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchNotifications,
        color: AppColors.primary,
        child: _isLoading
            ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
            : _errorMessage != null
                ? Center(
                    child: Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.error_outline, size: 56, color: AppColors.error),
                          const SizedBox(height: 16),
                          Text(_errorMessage!, textAlign: TextAlign.center),
                          const SizedBox(height: 20),
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
                            Icon(
                              Icons.notifications_off_outlined,
                              size: 64,
                              color: Colors.grey.withOpacity(0.5),
                            ),
                            const SizedBox(height: 16),
                            const Text(
                              'لا توجد إشعارات جديدة حالياً',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notif = _notifications[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            elevation: 0,
                            color: notif.isRead
                                ? (isDark ? AppColors.darkCard : AppColors.lightCard)
                                : (isDark
                                    ? AppColors.primary.withOpacity(0.08)
                                    : AppColors.primary.withOpacity(0.05)),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                              side: BorderSide(
                                color: notif.isRead
                                    ? (isDark ? AppColors.darkBorder : AppColors.lightBorder)
                                    : AppColors.primary.withOpacity(0.3),
                              ),
                            ),
                            child: ListTile(
                              contentPadding:
                                  const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                              leading: CircleAvatar(
                                backgroundColor: notif.isRead
                                    ? Colors.grey.withOpacity(0.15)
                                    : AppColors.primary.withOpacity(0.15),
                                child: Icon(
                                  Icons.notifications,
                                  color: notif.isRead ? Colors.grey : AppColors.primary,
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                notif.title,
                                style: TextStyle(
                                  fontWeight: notif.isRead ? FontWeight.normal : FontWeight.bold,
                                  fontSize: 15,
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
                                      color: isDark ? Colors.white70 : Colors.black87,
                                    ),
                                  ),
                                  const SizedBox(height: 6),
                                  Text(
                                    dateFormat.format(notif.createdAt),
                                    style: const TextStyle(fontSize: 11, color: Colors.grey),
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
