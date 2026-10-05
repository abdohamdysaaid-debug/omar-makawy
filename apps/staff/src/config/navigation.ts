import {
  LayoutDashboard,
  BookOpen,
  Package,
  Video,
  Users,
  Settings,
  Ticket,
  Wallet,
  Bell,
  Headset,
  Share2,
  GraduationCap,
  ShieldCheck,
  BookMarked,
} from 'lucide-react';
import { SystemPermissions, SystemPermissionCode, UserRole } from '@omar-makawy/shared';

export interface NavItemConfig {
  key: string;
  href: string;
  icon: React.ElementType;
  permission?: SystemPermissionCode | string;
  role?: UserRole;
  isTeacherOnly?: boolean;
}

export interface NavSectionConfig {
  sectionKey?: string;
  items: NavItemConfig[];
}

export const STAFF_NAVIGATION_SECTIONS: NavSectionConfig[] = [
  // 1. Overview
  {
    items: [
      {
        key: 'nav.dashboard',
        href: '/staff',
        icon: LayoutDashboard,
      },
    ],
  },
  // 2. Educational & LMS
  {
    sectionKey: 'nav.section_academic',
    items: [
      {
        key: 'nav.courses',
        href: '/staff/courses',
        icon: BookOpen,
        permission: SystemPermissions.COURSES_READ,
      },
      {
        key: 'nav.packages',
        href: '/staff/packages',
        icon: Package,
        permission: SystemPermissions.PACKAGES_READ,
      },
      {
        key: 'nav.lectures',
        href: '/staff/lectures',
        icon: Video,
        permission: SystemPermissions.LECTURES_READ,
      },
      {
        key: 'nav.exams',
        href: '/staff/exams',
        icon: GraduationCap,
        permission: SystemPermissions.LECTURES_READ,
      },
      {
        key: 'nav.books_and_notes',
        href: '/staff/books',
        icon: BookMarked,
        permission: SystemPermissions.BOOKS_READ,
      },
    ],
  },
  // 3. Operations & Finance
  {
    sectionKey: 'nav.section_operations',
    items: [
      {
        key: 'nav.activation_and_recharge',
        href: '/staff/codes',
        icon: Ticket,
      },
      {
        key: 'nav.platform_wallet',
        href: '/staff/wallet',
        icon: Wallet,
        permission: SystemPermissions.WALLET_READ,
      },
    ],
  },
  // 4. Students & Communications
  {
    sectionKey: 'nav.section_students_comms',
    items: [
      {
        key: 'nav.students',
        href: '/staff/students',
        icon: Users,
        permission: SystemPermissions.STUDENTS_READ,
      },
      {
        key: 'nav.notifications',
        href: '/staff/notifications',
        icon: Bell,
        permission: SystemPermissions.NOTIFICATIONS_READ,
      },
      {
        key: 'nav.support',
        href: '/staff/support',
        icon: Headset,
        permission: SystemPermissions.SUPPORT_READ,
      },
      {
        key: 'nav.contact',
        href: '/staff/contact',
        icon: Share2,
        permission: SystemPermissions.SETTINGS_READ,
      },
    ],
  },
  // 5. Administration & System
  {
    sectionKey: 'nav.section_admin',
    items: [
      {
        key: 'nav.supervisors',
        href: '/staff/supervisors',
        icon: ShieldCheck,
        isTeacherOnly: true,
      },
      {
        key: 'nav.settings',
        href: '/staff/settings',
        icon: Settings,
        permission: SystemPermissions.SETTINGS_READ,
      },
    ],
  },
];

// Backward-compatible flat list
export const STAFF_NAVIGATION_ITEMS: NavItemConfig[] = STAFF_NAVIGATION_SECTIONS.flatMap(
  (s) => s.items
);
