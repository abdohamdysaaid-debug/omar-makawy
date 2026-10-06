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
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { mobileApiClient } from '../services/api';

const FlatListAny = FlatList as any;

export default function NotificationsScreen() {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await mobileApiClient.get('/notifications?limit=50').catch(() => null);
      const items = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.surfaceBorder }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>مركز التنبيهات والإشعارات 🔔</Text>
        <Text style={[styles.headerSub, { color: theme.textSecondary }]}>
          كل ما يخص محاضراتك، مواعيد الامتحانات، وتحديثات مستر عمر مكاوي
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={theme.primary} size="large" style={{ marginTop: SPACING.xl }} />
      ) : (
        <FlatListAny
          data={notifications}
          keyExtractor={(item: any) => String(item.id || Math.random())}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
          }
          ListEmptyComponent={
            <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={[styles.emptyText, { color: theme.textPrimary }]}>لا توجد إشعارات جديدة حالياً</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                ستصلك التنبيهات فور نزول حصص أو مراجعات جديدة
              </Text>
            </View>
          }
          renderItem={({ item }: { item: any }) => {
            const isUnread = !item.is_read;
            return (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isUnread ? theme.surfaceLight : theme.surface,
                    borderColor: isUnread ? theme.primary : theme.surfaceBorder,
                  },
                ]}
              >
                <View style={[styles.iconBox, { backgroundColor: theme.badgeBg }]}>
                  <Text style={styles.iconText}>📢</Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>
                    {item.title_ar || item.title || 'إشعار من المنصة'}
                  </Text>
                  <Text style={[styles.body, { color: theme.textSecondary }]}>
                    {item.body_ar || item.body || item.message || ''}
                  </Text>
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString('ar-EG') : 'اليوم'}
                  </Text>
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
  },
  listContent: {
    padding: SPACING.md,
  },
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.sm,
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  iconText: {
    fontSize: 20,
  },
  cardInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 4,
  },
  body: {
    fontSize: 13,
    textAlign: 'right',
    lineHeight: 18,
  },
  dateText: {
    fontSize: 11,
    marginTop: 6,
    textAlign: 'right',
  },
  emptyBox: {
    borderRadius: 16,
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
