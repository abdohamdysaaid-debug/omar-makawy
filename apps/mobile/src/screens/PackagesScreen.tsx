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

const FlatListAny = FlatList as any;

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

export default function PackagesScreen({ navigation }: any) {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedYearId, setSelectedYearId] = useState<string>('all');
  const [years, setYears] = useState<AcademicYearItem[]>(DEFAULT_YEARS);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAcademicYears = async () => {
    try {
      const res = await mobileApiClient.get('/auth/academic-years').catch(() => null);
      const list = extractDataList(res);
      if (list.length > 0) {
        const mapped: AcademicYearItem[] = [
          { id: 'all', title: 'جميع المراحل' },
          ...list.map((item: any) => ({
            id: String(item.id),
            title: item.name_ar || item.title || item.name_en || 'صف دراسي',
          })),
        ];
        setYears(mapped);
      }
    } catch {}
  };

  const loadPackages = async () => {
    try {
      let res = await mobileApiClient.get('/packages?limit=100').catch(() => null);
      let items = extractDataList(res);
      if (items.length === 0) {
        res = await mobileApiClient.get('/packages/public?limit=100').catch(() => null);
        items = extractDataList(res);
      }

      setPackages(items);
    } catch {
      setPackages([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAcademicYears();
    loadPackages();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPackages();
  };

  // Filter packages by search and academic year
  const filteredPackages = packages.filter((pkg) => {
    const matchYear =
      selectedYearId === 'all' ||
      String(pkg.academic_year_id) === selectedYearId ||
      String(pkg.academicYearId) === selectedYearId;
    const matchSearch =
      !search.trim() ||
      (pkg.title_ar || pkg.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (pkg.description_ar || pkg.description || '').toLowerCase().includes(search.toLowerCase());
    return matchYear && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Search & Filter Bar */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>باقات واشتراكات المنصة 📦</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          وفّر واشترك في باقات الشهر والمراجعات الشاملة مع مستر عمر مكاوي
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
          placeholder="ابحث عن باقة معينة..."
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

      {/* Packages List */}
      {loading ? (
        <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatListAny
          data={filteredPackages}
          keyExtractor={(item: any) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>لا توجد باقات متاحة حالياً</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                جرّب اختيار مرحلة دراسية أخرى أو مسح كلمة البحث
              </Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const originalPrice = Number(item.original_price || item.price || 0);
            const price = Number(item.price || item.discounted_price || 0);
            const hasDiscount = originalPrice > price;
            const coursesCount = item.courses_count || (Array.isArray(item.courses) ? item.courses.length : 0);

            return (
              <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
                {/* Header Badge */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.badge, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
                    <Text style={[styles.badgeText, { color: theme.primary }]}>
                      {item.academic_year_name_ar || item.academic_year_name || 'باقة شاملة'}
                    </Text>
                  </View>
                  {hasDiscount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountBadgeText}>خصم خاص 🔥</Text>
                    </View>
                  )}
                </View>

                {/* Package Info */}
                <Text style={[styles.title, { color: theme.textPrimary }]}>{item.title_ar || item.title}</Text>
                <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={3}>
                  {item.description_ar || item.description || 'باقة دراسية متكاملة تشمل الكورسات والمحاضرات والامتحانات الدورية.'}
                </Text>

                {/* Features Highlights */}
                <View style={styles.featuresRow}>
                  {coursesCount > 0 && (
                    <View style={styles.featureItem}>
                      <Text style={[styles.featureText, { color: theme.textSecondary }]}>
                        📚 {coursesCount} كورسات ومحاضرات
                      </Text>
                    </View>
                  )}
                  <View style={styles.featureItem}>
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>⚡ وصول فوري وشامل</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Text style={[styles.featureText, { color: theme.textSecondary }]}>📝 امتحانات وتدريبات</Text>
                  </View>
                </View>

                {/* Divider */}
                <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />

                {/* Price and Action Button */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.priceContainer}>
                    {hasDiscount && (
                      <Text style={[styles.oldPrice, { color: theme.textMuted }]}>{originalPrice} ج.م</Text>
                    )}
                    <Text style={[styles.priceTag, { color: theme.primary }]}>
                      {price > 0 ? `${price} ج.م` : 'مجانية'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.subscribeBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      if (navigation?.navigate) {
                        navigation.navigate('Courses');
                      }
                    }}
                  >
                    <Text style={styles.subscribeBtnText}>تصفح محتوى الباقة</Text>
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
  discountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  discountBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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
  featuresRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: SPACING.sm,
  },
  featureItem: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  featureText: {
    fontSize: 11,
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  oldPrice: {
    fontSize: 11,
    textDecorationLine: 'line-through',
  },
  priceTag: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subscribeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  subscribeBtnText: {
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
