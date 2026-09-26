import {
  LayoutDashboard,
  BookOpen,
  PlayCircle,
  Video,
  FileText,
  Package,
  Users,
  Smartphone,
  CreditCard,
  Wallet,
  KeyRound,
  Layers,
  FileSpreadsheet,
  BookMarked,
  ShoppingCart,
  Truck,
  Bell,
  BarChart3,
  UserCog,
  ClipboardList,
  Shield,
  Settings,
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

export interface NavGroupConfig {
  groupKey: string;
  items: NavItemConfig[];
}

export const STAFF_NAVIGATION_GROUPS: NavGroupConfig[] = [
  {
    groupKey: 'nav.academic',
    items: [
      { key: 'nav.courses', href: '/staff/courses', icon: BookOpen, permission: SystemPermissions.COURSES_READ },
      { key: 'nav.lectures', href: '/staff/lectures', icon: PlayCircle, permission: SystemPermissions.LECTURES_READ },
      { key: 'nav.videos', href: '/staff/videos', icon: Video, permission: SystemPermissions.VIDEOS_READ },
      { key: 'nav.attachments', href: '/staff/attachments', icon: FileText, permission: SystemPermissions.ATTACHMENTS_READ },
      { key: 'nav.packages', href: '/staff/packages', icon: Package, permission: SystemPermissions.PACKAGES_READ },
    ],
  },
  {
    groupKey: 'nav.students',
    items: [
      { key: 'nav.students_list', href: '/staff/students', icon: Users, permission: SystemPermissions.STUDENTS_READ },
      { key: 'nav.devices', href: '/staff/devices', icon: Smartphone, permission: SystemPermissions.DEVICES_READ },
      { key: 'nav.subscriptions', href: '/staff/subscriptions', icon: CreditCard, permission: SystemPermissions.SUBSCRIPTIONS_READ },
    ],
  },
  {
    groupKey: 'nav.financial',
    items: [
      { key: 'nav.wallets', href: '/staff/financial/wallets', icon: Wallet, permission: SystemPermissions.WALLET_READ },
      { key: 'nav.recharge_codes', href: '/staff/financial/codes', icon: KeyRound, permission: SystemPermissions.WALLET_MANAGE },
      { key: 'nav.discounts', href: '/staff/financial/discounts', icon: Layers, permission: SystemPermissions.WALLET_MANAGE },
      { key: 'nav.invoices', href: '/staff/financial/invoices', icon: FileSpreadsheet, permission: SystemPermissions.WALLET_READ },
    ],
  },
  {
    groupKey: 'nav.bookstore',
    items: [
      { key: 'nav.books', href: '/staff/books', icon: BookMarked, permission: SystemPermissions.BOOKS_READ },
      { key: 'nav.inventory', href: '/staff/inventory', icon: Layers, permission: SystemPermissions.INVENTORY_READ },
      { key: 'nav.orders', href: '/staff/orders', icon: ShoppingCart, permission: SystemPermissions.ORDERS_READ },
      { key: 'nav.shipping', href: '/staff/shipping', icon: Truck, permission: SystemPermissions.ORDERS_MANAGE },
    ],
  },
  {
    groupKey: 'nav.notifications',
    items: [
      { key: 'nav.notifications', href: '/staff/notifications', icon: Bell, permission: SystemPermissions.NOTIFICATIONS_READ },
    ],
  },
  {
    groupKey: 'nav.analytics',
    items: [
      { key: 'nav.analytics', href: '/staff/analytics', icon: BarChart3, permission: SystemPermissions.ANALYTICS_READ },
    ],
  },
  {
    groupKey: 'nav.administration',
    items: [
      { key: 'nav.supervisors', href: '/staff/supervisors', icon: UserCog, isTeacherOnly: true, role: 'TEACHER' },
      { key: 'nav.audit_logs', href: '/staff/audit-logs', icon: ClipboardList, permission: SystemPermissions.AUDIT_LOGS_READ },
      { key: 'nav.security_events', href: '/staff/security-events', icon: Shield, permission: SystemPermissions.SECURITY_EVENTS_READ },
      { key: 'nav.settings', href: '/staff/settings', icon: Settings, permission: SystemPermissions.SETTINGS_READ },
    ],
  },
];
