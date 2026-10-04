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
import { COLORS, SPACING } from '../config/theme';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت تأكد من تسجيل الخروج من تطبيق المنصة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: () => logout() },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {user?.full_name ? user.full_name.slice(0, 2).toUpperCase() : 'ST'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'طالب المنصة'}</Text>
          <Text style={styles.userPhone}>{user?.phone || ''}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{user?.academic_year_name_ar || 'الصف الدراسي'}</Text>
            </View>
          </View>
        </View>

        {/* Account Details Section */}
        <Text style={styles.sectionHeader}>تفاصيل الحساب</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.phone || 'غير محدد'}</Text>
            <Text style={styles.infoLabel}>رقم الهاتف</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoValue}>{user?.academic_year_name_ar || 'الصف الدراسي'}</Text>
            <Text style={styles.infoLabel}>المرحلة الدراسية</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoValue, { color: COLORS.success }]}>
              {user?.status === 'ACTIVE' ? 'نشط ومفعل' : 'قيد المراجعة'}
            </Text>
            <Text style={styles.infoLabel}>حالة الحساب</Text>
          </View>
        </View>

        {/* App Settings */}
        <Text style={styles.sectionHeader}>إعدادات التطبيق</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuArrow}>‹</Text>
            <Text style={styles.menuText}>تطبيق الهاتف والأجهزة المسجلة</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuArrow}>‹</Text>
            <Text style={styles.menuText}>تغيير كلمة المرور</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuRow}>
            <Text style={styles.menuArrow}>‹</Text>
            <Text style={styles.menuText}>الدعم الفني والخدمة</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>تسجيل الخروج من الحساب</Text>
        </TouchableOpacity>
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
    padding: SPACING.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryGlow,
    borderColor: COLORS.primary,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: 'bold',
  },
  userName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userPhone: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  badge: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  badgeText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    textAlign: 'right',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginVertical: SPACING.xs,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  menuText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  menuArrow: {
    color: COLORS.textMuted,
    fontSize: 18,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.error,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  logoutText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
