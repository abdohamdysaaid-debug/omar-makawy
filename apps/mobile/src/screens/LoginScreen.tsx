import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { SPACING } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { login, loginAsDemo, isLoading } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    if (!phone.trim() || !password.trim()) {
      setError('من فضلك أدخل رقم الهاتف وكلمة السر');
      return;
    }

    try {
      await login(phone.trim(), password);
    } catch (err: any) {
      setError(err.message || 'خطأ في بيانات الدخول، تأكد من صحة الحساب');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Top Bar with Theme Switcher */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: theme.surface, borderColor: theme.surfaceBorder }]}
              onPress={toggleTheme}
            >
              <Text style={styles.themeBtnIcon}>{isDark ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي'}</Text>
            </TouchableOpacity>
          </View>

          {/* Header Branding */}
          <View style={styles.brandHeader}>
            <View
              style={[
                styles.logoBadge,
                {
                  backgroundColor: theme.badgeBg,
                  borderColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.logoBadgeText, { color: theme.primary }]}>OM</Text>
            </View>
            <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>منصة مستر عمر مكاوي</Text>
            <Text style={[styles.brandSubtitle, { color: theme.textSecondary }]}>
              تطبيق الطلاب والمذاكرة الرسمي لجميع المراحل الثانوية
            </Text>
          </View>

          {/* Form Card */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.surface,
                borderColor: theme.surfaceBorder,
              },
            ]}
          >
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>تسجيل الدخول</Text>

            {error && (
              <View style={[styles.errorBox, { borderColor: theme.error }]}>
                <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>رقم الهاتف</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="010XXXXXXXX"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                textAlign="right"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>كلمة المرور</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, { backgroundColor: theme.primary }, isLoading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.loginBtnText}>دخول الحساب</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    justifyContent: 'center',
    flexGrow: 1,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: SPACING.md,
  },
  themeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeBtnIcon: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 22,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  logoBadgeText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  brandSubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  card: {
    borderRadius: 18,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.lg,
    textAlign: 'right',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontSize: 13,
    textAlign: 'right',
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderWidth: 1,
    fontSize: 15,
  },
  loginBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});
