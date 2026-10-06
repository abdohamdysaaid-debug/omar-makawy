import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { mobileApiClient, extractDataList } from '../services/api';

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

export default function CoursesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [years, setYears] = useState<AcademicYearItem[]>(DEFAULT_YEARS);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAcademicYears = async () => {
    try {
      const res = await mobileApiClient.get('/auth/academic-years').catch(() => null);
      const list = extractDataList(res);
      if (list.length > 0) {
        setYears([
          { id: 'all', title: 'جميع المراحل' },
          ...list.map((item: any) => ({
            id: String(item.id),
            title: item.name_ar || item.title || item.name_en || 'صف دراسي',
          })),
        ]);
      }
    } catch {}
  };

  const loadCourses = async () => {
    try {
      let res = await mobileApiClient.get('/courses?limit=100').catch(() => null);
      let items = extractDataList(res);
      if (items.length === 0) {
        res = await mobileApiClient.get('/courses/public?limit=100').catch(() => null);
        items = extractDataList(res);
      }
      setCourses(items);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAcademicYears();
    loadCourses();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses();
  };

  // Filter courses by search and academic year
  const filteredCourses = courses.filter((c) => {
    const matchYear =
      selectedYearId === 'all' ||
      String(c.academic_year_id) === selectedYearId ||
      String(c.academicYearId) === selectedYearId;
    const matchSearch =
      !search.trim() ||
      (c.title_ar || c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.description_ar || c.description || '').toLowerCase().includes(search.toLowerCase());
    return matchYear && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Search and Filter */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>الكورسات والمحاضرات 📚</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          تصفح شرح ومراجعات منهج اللغة الإنجليزية لجميع المراحل
        </Text>

        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
              borderColor: theme.border,
            },
          ]}
          placeholder="ابحث عن اسم الكورس أو الدرس..."
          placeholderTextColor={theme.textMuted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />

        {/* Academic Year Horizontal Selector */}
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
                    backgroundColor: isSelected ? theme.primary : theme.surfaceLight,
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
      </View>

      {/* Courses List */}
      {loading ? (
        <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>لم يتم العثور على كورسات</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                جرب تغيير البحث أو اختيار مرحلة دراسية أخرى
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const price = Number(item.price || 0);
            const lecturesCount = item.lectures_count || (Array.isArray(item.lectures) ? item.lectures.length : 0);

            return (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                <View style={styles.cardTopRow}>
                  <View style={[styles.badge, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                      {item.academic_year_name_ar || 'كورس تعليمي'}
                    </Text>
                  </View>
                  <Text style={[styles.lecturesBadge, { color: theme.textSecondary }]}>
                    🎥 {lecturesCount} محاضرات
                  </Text>
                </View>

                <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title_ar || item.title}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
                  {item.description_ar || item.description || 'شرح متكامل وبنك أسئلة وامتحانات متابعة تفاعلية.'}
                </Text>

                <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

                <View style={styles.cardBottomRow}>
                  <Text style={[styles.priceTag, { color: theme.primary }]}>
                    {price > 0 ? `${price} ج.م` : 'مجاني'}
                  </Text>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      // Navigate or open course details
                    }}
                  >
                    <Text style={styles.actionBtnText}>عرض المحاضرات ‹</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 12,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  yearScroll: {
    flexDirection: 'row-reverse',
    paddingVertical: 4,
    gap: 8,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  yearChipText: {
    fontSize: 12,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.md,
  },
  cardTopRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  lecturesBadge: {
    fontSize: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 19,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    marginVertical: SPACING.sm,
  },
  cardBottomRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceTag: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  emptyBox: {
    borderRadius: 14,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
});
