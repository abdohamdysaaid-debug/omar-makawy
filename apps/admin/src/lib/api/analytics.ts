import { apiClient } from './client';
import {
  AnalyticsOverview,
  AnalyticsStudents,
  AnalyticsFinancial,
  AnalyticsCourses,
} from './types';

export const analyticsApi = {
  async getOverview(): Promise<AnalyticsOverview> {
    return apiClient.get<AnalyticsOverview>('/admin/analytics/overview');
  },

  async getStudents(): Promise<AnalyticsStudents> {
    return apiClient.get<AnalyticsStudents>('/admin/analytics/students');
  },

  async getFinancial(): Promise<AnalyticsFinancial> {
    return apiClient.get<AnalyticsFinancial>('/admin/analytics/financial');
  },

  async getCourses(): Promise<AnalyticsCourses> {
    return apiClient.get<AnalyticsCourses>('/admin/analytics/courses');
  },

  async getBookstore(): Promise<any> {
    return apiClient.get<any>('/admin/analytics/bookstore');
  },

  async getNotifications(): Promise<any> {
    return apiClient.get<any>('/admin/analytics/notifications');
  },

  async getDevices(): Promise<any> {
    return apiClient.get<any>('/admin/analytics/devices');
  },
};
