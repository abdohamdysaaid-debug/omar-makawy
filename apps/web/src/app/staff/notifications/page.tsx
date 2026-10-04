import React from 'react';
import StudentLayout from '@/components/layout/StudentLayout';
import StaffNotificationsClient from '@/components/notifications/StaffNotificationsClient';

export const metadata = {
  title: 'الإشعارات — لوحة الإدارة | منصة مستر عمر مكاوي',
  description: 'إدارة وإرسال الإشعارات والتنبيهات المباشرة للطلاب',
};

export default function StaffNotificationsPage() {
  return (
    <StudentLayout>
      <StaffNotificationsClient />
    </StudentLayout>
  );
}
