import { LayoutDashboard, BookOpen, Package, Users, Settings, Ticket } from 'lucide-react';
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
  {
    items: [
      {
        key: 'nav.dashboard',
        href: '/staff',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    sectionKey: 'nav.academic',
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
    ],
  },
  {
    items: [
      {
        key: 'nav.students',
        href: '/staff/students',
        icon: Users,
        permission: SystemPermissions.STUDENTS_READ,
      },
      {
        key: 'nav.activation_and_recharge',
        href: '/staff/activation-and-recharge',
        icon: Ticket,
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
