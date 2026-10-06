import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppHeader from './src/components/AppHeader';
import { mobileApiClient } from './src/services/api';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import PackagesScreen from './src/screens/PackagesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

type TabType = 'home' | 'courses' | 'packages' | 'notifications' | 'profile';

function MainAppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await mobileApiClient.get('/notifications?limit=10').catch(() => null);
        const items = Array.isArray(res?.items)
          ? res.items
          : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];
        const unread = items.filter((item: any) => !item.is_read).length;
        setUnreadCount(unread || (items.length > 0 ? 1 : 0));
      } catch {}
    };

    fetchUnread();
  }, [activeTab]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const navigationProp = {
    navigate: (tab: string) => {
      const lower = tab.toLowerCase() as TabType;
      if (['home', 'courses', 'packages', 'notifications', 'profile'].includes(lower)) {
        setActiveTab(lower);
      }
    },
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={theme.headerBg} />

      {/* Top Header Bar with Theme Switcher and Notification Bell */}
      <AppHeader
        unreadCount={unreadCount}
        onOpenNotifications={() => setActiveTab('notifications')}
      />

      {/* Main Screen Body */}
      <View style={styles.body}>
        {activeTab === 'home' && <HomeScreen navigation={navigationProp} />}
        {activeTab === 'courses' && <CoursesScreen navigation={navigationProp} />}
        {activeTab === 'packages' && <PackagesScreen navigation={navigationProp} />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'profile' && <ProfileScreen navigation={navigationProp} />}
      </View>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.tabBarBg,
            borderTopColor: theme.surfaceBorder,
          },
        ]}
      >
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabIcon, activeTab === 'profile' && { color: theme.primary, opacity: 1 }]}>
            👤
          </Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'profile' ? theme.primary : theme.textMuted },
              activeTab === 'profile' && styles.tabActiveLabel,
            ]}
          >
            حسابي
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('notifications')}>
          <View style={{ position: 'relative' }}>
            <Text style={[styles.tabIcon, activeTab === 'notifications' && { color: theme.primary, opacity: 1 }]}>
              🔔
            </Text>
            {unreadCount > 0 && (
              <View
                style={[
                  styles.tabBadgeDot,
                  { backgroundColor: theme.error },
                ]}
              />
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'notifications' ? theme.primary : theme.textMuted },
              activeTab === 'notifications' && styles.tabActiveLabel,
            ]}
          >
            الإشعارات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('packages')}>
          <Text style={[styles.tabIcon, activeTab === 'packages' && { color: theme.primary, opacity: 1 }]}>
            📦
          </Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'packages' ? theme.primary : theme.textMuted },
              activeTab === 'packages' && styles.tabActiveLabel,
            ]}
          >
            الباقات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('courses')}>
          <Text style={[styles.tabIcon, activeTab === 'courses' && { color: theme.primary, opacity: 1 }]}>
            📚
          </Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'courses' ? theme.primary : theme.textMuted },
              activeTab === 'courses' && styles.tabActiveLabel,
            ]}
          >
            الكورسات
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabIcon, activeTab === 'home' && { color: theme.primary, opacity: 1 }]}>
            🏠
          </Text>
          <Text
            style={[
              styles.tabLabel,
              { color: activeTab === 'home' ? theme.primary : theme.textMuted },
              activeTab === 'home' && styles.tabActiveLabel,
            ]}
          >
            الرئيسية
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 4,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.65,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  tabActiveLabel: {
    fontWeight: 'bold',
  },
  tabBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
