import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../config/theme';
import { useAuth } from '../context/AuthContext';
import { mobileApiClient } from '../services/api';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ coursesCount: 0, notificationsCount: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [coursesRes, notifsRes] = await Promise.all([
        mobileApiClient.get('/courses?limit=5').catch(() => null),
        mobileApiClient.get('/notifications?limit=5').catch(() => null),
      ]);

      const courses = Array.isArray(coursesRes?.items) ? coursesRes.items : Array.isArray(coursesRes) ? coursesRes : [];
      const notifs = Array.isArray(notifsRes?.items) ? notifsRes.items : Array.isArray(notifsRes) ? notifsRes : [];

      setRecentCourses(courses);
      setStats({
        coursesCount: courses.length,
        notificationsCount: notifs.length,
      });
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
      >
        {/* Top Student Banner */}
        <View style={styles.topCard}>
          <View style={styles.greetingRow}>
            <View>
              <Text style={styles.welcomeTitle}>أهلاً بك، {user?.full_name || 'طالبنا العزيز'} 👋</Text>
              <Text style={styles.academicYearBadge}>
                {user?.academic_year_name_ar || 'منصة مستر عمر مكاوي التعليمية'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => navigation?.navigate?.('Notifications')}
            >
              <Text style={styles.notifIcon}>🔔</Text>
              {stats.notificationsCount > 0 && <View style={styles.badgeDot} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <Text style={styles.sectionHeader}>الخدمات السريعة</Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation?.navigate?.('Courses')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.gridIcon}>📚</Text>
            </View>
            <Text style={styles.gridTitle}>الكورسات</Text>
            <Text style={styles.gridSub}>تصفح المناهج والدروس</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation?.navigate?.('Packages')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={styles.gridIcon}>📦</Text>
            </View>
            <Text style={styles.gridTitle}>الباقات</Text>
            <Text style={styles.gridSub}>اشتراكات الشهر والشامل</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation?.navigate?.('Books')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.gridIcon}>📖</Text>
            </View>
            <Text style={styles.gridTitle}>المذكرات والكتب</Text>
            <Text style={styles.gridSub}>متجر الكتب والملازم</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={() => navigation?.navigate?.('Wallet')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Text style={styles.gridIcon}>💳</Text>
            </View>
            <Text style={styles.gridTitle}>شحن المحفظة</Text>
            <Text style={styles.gridSub}>أكواد وتعبئة الرصيد</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Educational Courses */}
        <View style={styles.sectionTitleRow}>
          <TouchableOpacity onPress={() => navigation?.navigate?.('Courses')}>
            <Text style={styles.viewAllText}>عرض الكل</Text>
          </TouchableOpacity>
          <Text style={styles.sectionHeader}>أحدث الكورسات المتاحة</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: SPACING.lg }} />
        ) : recentCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>لا توجد كورسات متاحة حالياً لصفك الدراسي</Text>
          </View>
        ) : (
          recentCourses.map((course: any) => (
            <TouchableOpacity
              key={course.id}
              style={styles.courseItemCard}
              onPress={() => navigation?.navigate?.('CourseDetail', { id: course.id })}
            >
              <View style={styles.courseBadge}>
                <Text style={styles.courseBadgeText}>{course.price ? `${course.price} ج.م` : 'مجاني'}</Text>
              </View>
              <View style={styles.courseInfo}>
                <Text style={styles.courseTitle}>{course.title_ar || course.title}</Text>
                <Text style={styles.courseSub}>
                  {course.academic_year_name_ar || 'الصف الدراسي'} • {course.lectures_count || 0} محاضرة
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  topCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
  },
  greetingRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  academicYearBadge: {
    color: COLORS.primary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'right',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifIcon: {
    fontSize: 20,
  },
  badgeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    position: 'absolute',
    top: 8,
    right: 8,
  },
  sectionHeader: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 13,
  },
  gridContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  gridIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  gridIcon: {
    fontSize: 22,
  },
  gridTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  gridSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  courseItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.sm,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  courseTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  courseSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  courseBadge: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginLeft: SPACING.md,
  },
  courseBadgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
});
