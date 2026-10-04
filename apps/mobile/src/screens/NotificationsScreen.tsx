import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { COLORS, SPACING } from '../config/theme';
import { mobileApiClient } from '../services/api';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await mobileApiClient.get('/notifications').catch(() => null);
      const items = Array.isArray(res?.items) ? res.items : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setNotifications(items);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مركز الإشعارات والتنبيهات</Text>
        <Text style={styles.headerSub}>تنبيهات المنصة والمستر والموافقة على الحساب</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyText}>لا توجد إشعارات جديدة حتى الآن</Text>
              <Text style={styles.emptySub}>ستظهر هنا تنبيهات الكورسات والإعلانات الهامة</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.is_read && styles.unreadCard]}>
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>📢</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.title}>{item.title_ar || item.title || 'إشعار جديد'}</Text>
                <Text style={styles.body}>{item.body_ar || item.body || item.message || ''}</Text>
                <Text style={styles.dateText}>
                  {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : 'الآن'}
                </Text>
              </View>
            </View>
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
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
    textAlign: 'right',
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
    marginBottom: SPACING.sm,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  unreadCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceLight,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  iconText: {
    fontSize: 18,
  },
  cardInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  body: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 18,
  },
  dateText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  emptyBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.xl,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: SPACING.md,
  },
  emptyText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptySub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
});
