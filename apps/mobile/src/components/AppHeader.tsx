import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface AppHeaderProps {
  onOpenNotifications?: () => void;
  unreadCount?: number;
  title?: string;
  subtitle?: string;
}

export default function AppHeader({
  onOpenNotifications,
  unreadCount = 0,
  title,
  subtitle,
}: AppHeaderProps) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const displayTitle = title || (user ? `أهلاً، ${user.full_name.split(' ')[0]} 👋` : 'منصة مستر عمر مكاوي');
  const displaySubtitle = subtitle || (user?.academic_year_name_ar || 'اللغة الإنجليزية للثانوية العامة');

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.headerBg,
          borderBottomColor: theme.surfaceBorder,
        },
      ]}
    >
      <View style={styles.contentRow}>
        {/* Right Side in Arabic: Branding & Title */}
        <View style={styles.brandBox}>
          <View style={[styles.logoIcon, { backgroundColor: theme.primaryGlow, borderColor: theme.primary }]}>
            <Text style={[styles.logoText, { color: theme.primary }]}>OM</Text>
          </View>
          <View style={styles.titleWrapper}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
              {displayTitle}
            </Text>
            <Text style={[styles.headerSub, { color: theme.primary }]} numberOfLines={1}>
              {displaySubtitle}
            </Text>
          </View>
        </View>

        {/* Left Side: Actions (Theme Toggle & Notification Bell) */}
        <View style={styles.actionsRow}>
          {/* Theme Toggle Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.surfaceBorder,
              },
            ]}
            onPress={toggleTheme}
            accessibilityLabel="تبديل الوضع الليلي والنهاري"
          >
            <Text style={styles.actionIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {/* Notification Bell Button */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: theme.surfaceLight,
                borderColor: theme.surfaceBorder,
              },
            ]}
            onPress={onOpenNotifications}
            accessibilityLabel="الإشعارات والتنبيهات"
          >
            <Text style={styles.actionIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: theme.error }]}>
                {unreadCount > 9 ? (
                  <Text style={styles.badgeNumber}>9+</Text>
                ) : (
                  <Text style={styles.badgeNumber}>{unreadCount}</Text>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    borderBottomWidth: 1,
  },
  contentRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'right',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  actionIcon: {
    fontSize: 17,
  },
  badgeDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeNumber: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
