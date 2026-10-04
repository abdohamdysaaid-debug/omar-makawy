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
} from 'react-native';
import { COLORS, SPACING } from '../config/theme';
import { mobileApiClient } from '../services/api';

export default function CoursesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadCourses = async (query = '') => {
    try {
      const q = query ? `?search=${encodeURIComponent(query)}` : '';
      const res = await mobileApiClient.get(`/courses${q}`).catch(() => null);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setCourses(items);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCourses(search);
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    loadCourses(search);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الكورسات والدروس التعليمية</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن اسم الكورس أو الفصل..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>لم يتم العثور على كورسات تطابق بحثك</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation?.navigate?.('CourseDetail', { id: item.id })}
            >
              <View style={styles.cardInfo}>
                <Text style={styles.title}>{item.title_ar || item.title}</Text>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description_ar || item.description || 'كورس تعليمي شامل لشرح وتغطية جزئيات المنهج.'}
                </Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaBadge}>{item.academic_year_name_ar || 'الصف الدراسي'}</Text>
                  <Text style={styles.priceTag}>{item.price ? `${item.price} ج.م` : 'مجاني'}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  searchInput: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
    fontSize: 14,
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  cardInfo: {
    alignItems: 'flex-end',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    marginBottom: SPACING.sm,
  },
  metaRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  metaBadge: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  priceTag: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
