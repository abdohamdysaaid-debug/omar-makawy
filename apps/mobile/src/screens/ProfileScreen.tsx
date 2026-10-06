import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من رغبتك في تسجيل الخروج من تطبيق المنصة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatarBox,
              {
                backgroundColor: theme.badgeBg,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={[styles.avatarText, { color: theme.primary }]}>
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'OM'}
            </Text>
          </View>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.full_name || 'طالب المنصة'}</Text>
          <Text style={[styles.userPhone, { color: theme.textSecondary }]}>{user?.phone || ''}</Text>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: theme.badgeBg, borderColor: theme.primary }]}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                {user?.academic_year_name_ar || 'الصف الدراسي'}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Preference Card */}
        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>مظهر التطبيق والمود</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <TouchableOpacity style={styles.themeToggleRow} onPress={toggleTheme}>
            <View style={styles.themeLeft}>
              <View style={[styles.themePill, { backgroundColor: theme.surfaceLight, borderColor: theme.border }]}>
                <Text style={[styles.themePillText, { color: theme.textPrimary }]}>
                  {isDark ? 'الوضع الليلي (أخضر وأسود)' : 'الوضع النهاري (أخضر وأبيض)'}
                </Text>
              </View>
              <Text style={styles.themeIcon}>{isDark ? '🌙' : '☀️'}</Text>
            </View>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>تبديل المود</Text>
          </TouchableOpacity>
        </View>

        {/* Account Details Section */}
        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>بيانات الحساب</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{user?.phone || 'غير محدد'}</Text>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>رقم الهاتف</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
              {user?.academic_year_name_ar || 'الصف الدراسي'}
            </Text>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>المرحلة الدراسية</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoValue, { color: theme.success }]}>
              {user?.status === 'ACTIVE' ? 'نشط ومفعل ✓' : 'حساب تجريبي'}
            </Text>
            <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>حالة الاشتراك</Text>
          </View>
        </View>

        {/* Quick Links */}
        <Text style={[styles.sectionHeader, { color: theme.textPrimary }]}>روابط سريعة</Text>
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}>
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation?.navigate?.('packages')}
          >
            <Text style={[styles.menuArrow, { color: theme.textMuted }]}>‹</Text>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>باقات واشتراكات مستر عمر مكاوي</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.surfaceBorder }]} />
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation?.navigate?.('courses')}
          >
            <Text style={[styles.menuArrow, { color: theme.textMuted }]}>‹</Text>
            <Text style={[styles.menuText, { color: theme.textPrimary }]}>الكورسات والمحاضرات المسجلة</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: theme.error }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: theme.error }]}>تسجيل الخروج من الحساب</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    marginBottom: SPACING.lg,
  },
  themeToggleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  themeLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  themeIcon: {
    fontSize: 20,
  },
  themePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  themePillText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: SPACING.xs,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 18,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});
