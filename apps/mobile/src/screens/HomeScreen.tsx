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
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { mobileApiClient } from '../services/api';

interface AcademicYearItem {
  id: string;
  title: string;
}

const DEFAULT_YEARS: AcademicYearItem[] = [
  { id: 'all', title: 'جميع المراحل' },
  { id: 'a0000000-0000-0000-0000-000000000001', title: 'الصف الثالث الإعدادي' },
  { id: 'a0000000-0000-0000-0000-000000000002', title: 'الصف الأول الثانوي' },
  { id: 'a0000000-0000-0000-0000-000000000003', title: 'الصف الثاني الثانوي' },
  { id: 'a0000000-0000-0000-0000-000000000004', title: 'الصف الثالث الثانوي' },
];

export default function HomeScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [years, setYears] = useState<AcademicYearItem[]>(DEFAULT_YEARS);
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [courses, setCourses] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState(0);

  const fetchData = async () => {
    try {
      const [yearsRes, coursesRes, packagesRes, notifsRes] = await Promise.all([
        mobileApiClient.get('/auth/academic-years').catch(() => null),
        mobileApiClient.get('/courses?limit=10').catch(() => null),
        mobileApiClient.get('/packages?limit=10').catch(() => mobileApiClient.get('/packages/public?limit=10').catch(() => null)),
        mobileApiClient.get('/notifications?limit=5').catch(() => null),
      ]);

      if (Array.isArray(yearsRes) && yearsRes.length > 0) {
        setYears([
          { id: 'all', title: 'جميع المراحل' },
          ...yearsRes.map((y: any) => ({
            id: String(y.id),
            title: y.name_ar || y.title || y.name_en || 'صف دراسي',
          })),
        ]);
      }

      const coursesList = Array.isArray(coursesRes?.items)
        ? coursesRes.items
        : Array.isArray(coursesRes?.data)
        ? coursesRes.data
        : Array.isArray(coursesRes)
        ? coursesRes
        : [];
      setCourses(coursesList);

      const packagesList = Array.isArray(packagesRes?.items)
        ? packagesRes.items
        : Array.isArray(packagesRes?.data)
        ? packagesRes.data
        : Array.isArray(packagesRes)
        ? packagesRes
        : [];
      setPackages(packagesList);

      const notifs = Array.isArray(notifsRes?.items)
        ? notifsRes.items
        : Array.isArray(notifsRes?.data)
        ? notifsRes.data
        : Array.isArray(notifsRes)
        ? notifsRes
        : [];
      setNotifCount(notifs.filter((n: any) => !n.is_read).length || notifs.length);
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

  // Filter courses & packages by academic year
  const filteredCourses = courses.filter(
    (c) =>
      selectedYearId === 'all' ||
      String(c.academic_year_id) === selectedYearId ||
      String(c.academicYearId) === selectedYearId
  );

  const filteredPackages = packages.filter(
    (p) =>
      selectedYearId === 'all' ||
      String(p.academic_year_id) === selectedYearId ||
      String(p.academicYearId) === selectedYearId
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Hero Welcome Banner */}
        <View style={[styles.heroCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
              <Text style={[styles.heroBadgeText, { color: theme.primary }]}>
                {user?.academic_year_name_ar || 'منصة مستر عمر مكاوي'}
              </Text>
            </View>
            <Text style={[styles.heroTitle, { color: theme.textPrimary }]}>
              أهلاً بك، {user?.full_name?.split(' ')[0] || 'طالبنا المتميز'} ✨
            </Text>
            <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
              تابع أقوى شرح لمنهج اللغة الإنجليزية مع حل بنوك الأسئلة والامتحانات التفاعلية.
            </Text>
          </View>
        </View>

        {/* Academic Year Filter Bar */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>اختر مرحلتك الدراسية</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearScroll}
        >
          {years.map((y) => {
            const isSelected = selectedYearId === y.id;
            return (
              <TouchableOpacity
                key={y.id}
                onPress={() => setSelectedYearId(y.id)}
                style={[
                  styles.yearChip,
                  {
                    backgroundColor: isSelected ? theme.primary : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.surfaceBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.yearChipText,
                    {
                      color: isSelected ? '#FFFFFF' : theme.textSecondary,
                      fontWeight: isSelected ? 'bold' : 'normal',
                    },
                  ]}
                >
                  {y.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Quick Services Grid */}
        <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginTop: SPACING.md }]}>
          الخدمات السريعة
        </Text>
        <View style={styles.gridContainer}>
          <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => navigation?.navigate?.('courses')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Text style={styles.gridIcon}>📚</Text>
            </View>
            <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>الكورسات</Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>الشرح والمحاضرات</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => navigation?.navigate?.('packages')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Text style={styles.gridIcon}>📦</Text>
            </View>
            <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>الباقات</Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>اشتراكات الشهر</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => navigation?.navigate?.('notifications')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Text style={styles.gridIcon}>🔔</Text>
            </View>
            <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>الإشعارات</Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>تنبيهات المنصة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.gridCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
            onPress={() => navigation?.navigate?.('profile')}
          >
            <View style={[styles.gridIconBox, { backgroundColor: 'rgba(168, 85, 247, 0.15)' }]}>
              <Text style={styles.gridIcon}>👤</Text>
            </View>
            <Text style={[styles.gridTitle, { color: theme.textPrimary }]}>حسابي</Text>
            <Text style={[styles.gridSub, { color: theme.textSecondary }]}>الملف والاشتراكات</Text>
          </TouchableOpacity>
        </View>

        {/* Featured Packages Section */}
        {filteredPackages.length > 0 && (
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <TouchableOpacity onPress={() => navigation?.navigate?.('packages')}>
                <Text style={[styles.viewAllText, { color: theme.primary }]}>عرض الكل ‹</Text>
              </TouchableOpacity>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>باقات واشتراكات مستر عمر مكاوي 🔥</Text>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.packagesScroll}>
              {filteredPackages.slice(0, 5).map((pkg) => {
                const price = Number(pkg.price || pkg.discounted_price || 0);
                return (
                  <TouchableOpacity
                    key={pkg.id}
                    style={[styles.packageCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                    onPress={() => navigation?.navigate?.('packages')}
                  >
                    <View style={[styles.packageBadge, { backgroundColor: theme.badgeBg }]}>
                      <Text style={[styles.packageBadgeText, { color: theme.primary }]}>
                        {pkg.academic_year_name_ar || 'باقة شهرية'}
                      </Text>
                    </View>
                    <Text style={[styles.packageTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                      {pkg.title_ar || pkg.title}
                    </Text>
                    <Text style={[styles.packageDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {pkg.description_ar || pkg.description || 'باقة مميزة تشمل محاضرات المنهج والامتحانات.'}
                    </Text>
                    <View style={styles.packageBottom}>
                      <Text style={[styles.packagePrice, { color: theme.primary }]}>
                        {price > 0 ? `${price} ج.م` : 'مجاناً'}
                      </Text>
                      <Text style={[styles.packageAction, { color: theme.textMuted }]}>تفاصيل الباقة ‹</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Available Courses Section */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <TouchableOpacity onPress={() => navigation?.navigate?.('courses')}>
              <Text style={[styles.viewAllText, { color: theme.primary }]}>عرض الكل ‹</Text>
            </TouchableOpacity>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>أحدث الكورسات والمحاضرات 📚</Text>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginVertical: SPACING.lg }} />
          ) : filteredCourses.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                لا توجد كورسات متاحة حالياً لهذه المرحلة
              </Text>
            </View>
          ) : (
            filteredCourses.slice(0, 6).map((course: any) => {
              const price = Number(course.price || 0);
              return (
                <TouchableOpacity
                  key={course.id}
                  style={[styles.courseItemCard, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
                  onPress={() => navigation?.navigate?.('courses')}
                >
                  <View style={[styles.coursePriceBadge, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
                    <Text style={[styles.coursePriceText, { color: theme.primary }]}>
                      {price > 0 ? `${price} ج.م` : 'مجاني'}
                    </Text>
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={[styles.courseItemTitle, { color: theme.textPrimary }]}>
                      {course.title_ar || course.title}
                    </Text>
                    <Text style={[styles.courseItemSub, { color: theme.textSecondary }]}>
                      {course.academic_year_name_ar || 'الصف الدراسي'} • {course.lectures_count || 0} محاضرة
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
  },
  heroCard: {
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  heroContent: {
    alignItems: 'flex-end',
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: SPACING.sm,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  heroSub: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'right',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  yearScroll: {
    flexDirection: 'row-reverse',
    paddingVertical: 4,
    gap: 8,
    marginBottom: SPACING.md,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  gridCard: {
    width: '48%',
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
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
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  gridSub: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'right',
  },
  sectionBlock: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  packagesScroll: {
    flexDirection: 'row-reverse',
    gap: 12,
    paddingVertical: 4,
  },
  packageCard: {
    width: 220,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    alignItems: 'flex-end',
  },
  packageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  packageBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  packageDesc: {
    fontSize: 12,
    textAlign: 'right',
    lineHeight: 16,
    marginBottom: SPACING.sm,
  },
  packageBottom: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 'auto',
  },
  packagePrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  packageAction: {
    fontSize: 11,
  },
  courseItemCard: {
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  courseItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  courseItemSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  coursePriceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: SPACING.md,
  },
  coursePriceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyBox: {
    borderRadius: 14,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 1,
  },
  emptyText: {
    fontSize: 13,
  },
});
