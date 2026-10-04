import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/config/theme';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CoursesScreen from './src/screens/CoursesScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

function MainAppNavigator() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'courses' | 'notifications' | 'profile'>('home');

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.background} />

      {/* Main Screen Body */}
      <View style={styles.body}>
        {activeTab === 'home' && <HomeScreen navigation={{ navigate: (tab: any) => setActiveTab(tab.toLowerCase()) }} />}
        {activeTab === 'courses' && <CoursesScreen navigation={{ navigate: (tab: any) => setActiveTab(tab.toLowerCase()) }} />}
        {activeTab === 'notifications' && <NotificationsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('profile')}>
          <Text style={[styles.tabIcon, activeTab === 'profile' && styles.tabActiveIcon]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabActiveLabel]}>حسابي</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('notifications')}>
          <Text style={[styles.tabIcon, activeTab === 'notifications' && styles.tabActiveIcon]}>🔔</Text>
          <Text style={[styles.tabLabel, activeTab === 'notifications' && styles.tabActiveLabel]}>الإشعارات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('courses')}>
          <Text style={[styles.tabIcon, activeTab === 'courses' && styles.tabActiveIcon]}>📚</Text>
          <Text style={[styles.tabLabel, activeTab === 'courses' && styles.tabActiveLabel]}>الكورسات</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.tabActiveIcon]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabActiveLabel]}>الرئيسية</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppNavigator />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  body: {
    flex: 1,
  },
  bottomBar: {
    height: 64,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
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
    opacity: 0.6,
  },
  tabActiveIcon: {
    opacity: 1.0,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabActiveLabel: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
