import { LayoutDashboard, Settings } from 'lucide-react';
import { SystemPermissions, SystemPermissionCode, UserRole } from '@omar-makawy/shared';

export interface NavItemConfig {
  key: string;
  href: string;
  icon: React.ElementType;
  permission?: SystemPermissionCode | string;
  role?: UserRole;
  isTeacherOnly?: boolean;
}

export const STAFF_NAVIGATION_ITEMS: NavItemConfig[] = [
  {
    key: 'nav.dashboard',
    href: '/staff',
    icon: LayoutDashboard,
  },
  {
    key: 'nav.settings',
    href: '/staff/settings',
    icon: Settings,
    permission: SystemPermissions.SETTINGS_READ,
  },
];
