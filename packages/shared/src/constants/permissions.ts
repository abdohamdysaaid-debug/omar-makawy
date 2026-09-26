import { PermissionDefinition } from '../types/permissions';

export const SystemPermissions = {
  // Students
  STUDENTS_READ: 'students.read',
  STUDENTS_MANAGE: 'students.manage',

  // Courses & Lectures
  COURSES_READ: 'courses.read',
  COURSES_CREATE: 'courses.create',
  COURSES_UPDATE: 'courses.update',
  COURSES_DELETE: 'courses.delete',
  COURSES_MANAGE: 'courses.manage',
  LECTURES_READ: 'lectures.read',
  LECTURES_CREATE: 'lectures.create',
  LECTURES_UPDATE: 'lectures.update',
  LECTURES_DELETE: 'lectures.delete',
  LECTURES_MANAGE: 'lectures.manage',

  // Media & Attachments
  VIDEOS_READ: 'videos.read',
  VIDEOS_MANAGE: 'videos.manage',
  ATTACHMENTS_READ: 'attachments.read',
  ATTACHMENTS_MANAGE: 'attachments.manage',

  // Packages & Subscriptions
  PACKAGES_READ: 'packages.read',
  PACKAGES_MANAGE: 'packages.manage',
  SUBSCRIPTIONS_READ: 'subscriptions.read',
  SUBSCRIPTIONS_MANAGE: 'subscriptions.manage',

  // Financial & Wallet
  WALLET_READ: 'wallet.read',
  WALLET_MANAGE: 'wallet.manage',

  // Bookstore & Inventory
  BOOKS_READ: 'books.read',
  BOOKS_MANAGE: 'books.manage',
  INVENTORY_READ: 'inventory.read',
  INVENTORY_MANAGE: 'inventory.manage',
  ORDERS_READ: 'orders.read',
  ORDERS_MANAGE: 'orders.manage',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_CREATE: 'notifications.create',
  NOTIFICATIONS_SEND: 'notifications.send',

  // Devices & Sessions
  DEVICES_READ: 'devices.read',
  DEVICES_MANAGE: 'devices.manage',

  // Analytics, Auditing & Settings
  ANALYTICS_READ: 'analytics.read',
  AUDIT_LOGS_READ: 'audit_logs.read',
  SECURITY_EVENTS_READ: 'security_events.read',
  SECURITY_WRITE: 'security_events.manage',
  SETTINGS_READ: 'settings.read',
  SETTINGS_MANAGE: 'settings.manage',

  // Tenancy Global Authority (Teacher level only)
  TENANCY_GLOBAL_OVERRIDE: 'tenancy.global_override',
} as const;

export type SystemPermissionCode = typeof SystemPermissions[keyof typeof SystemPermissions];

export const ALL_SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  // Students
  {
    code: SystemPermissions.STUDENTS_READ,
    name_en: 'View Students',
    name_ar: 'عرض بيانات الطلاب',
    module: 'STUDENTS',
    description: 'View student profiles and registration status within assigned grade',
  },
  {
    code: SystemPermissions.STUDENTS_MANAGE,
    name_en: 'Manage Students',
    name_ar: 'إدارة الطلاب',
    module: 'STUDENTS',
    description: 'Update student details, block/unblock, and initiate password resets',
  },

  // Courses
  {
    code: SystemPermissions.COURSES_READ,
    name_en: 'View Courses',
    name_ar: 'عرض الكورسات',
    module: 'COURSES',
    description: 'View courses and course details within assigned grade',
  },
  {
    code: SystemPermissions.COURSES_CREATE,
    name_en: 'Create Course',
    name_ar: 'إنشاء كورس',
    module: 'COURSES',
    description: 'Create new courses in assigned academic year',
  },
  {
    code: SystemPermissions.COURSES_UPDATE,
    name_en: 'Update Course',
    name_ar: 'تعديل كورس',
    module: 'COURSES',
    description: 'Edit course metadata, pricing, and publication status',
  },
  {
    code: SystemPermissions.COURSES_DELETE,
    name_en: 'Delete Course',
    name_ar: 'حذف كورس',
    module: 'COURSES',
    description: 'Delete unpublished courses',
  },
  {
    code: SystemPermissions.COURSES_MANAGE,
    name_en: 'Manage Courses',
    name_ar: 'إدارة الكورسات',
    module: 'COURSES',
    description: 'Full course administration in assigned grade',
  },

  // Lectures
  {
    code: SystemPermissions.LECTURES_READ,
    name_en: 'View Lectures',
    name_ar: 'عرض المحاضرات',
    module: 'LECTURES',
    description: 'View lecture lists and details',
  },
  {
    code: SystemPermissions.LECTURES_CREATE,
    name_en: 'Create Lecture',
    name_ar: 'إنشاء محاضرة',
    module: 'LECTURES',
    description: 'Add new lectures to courses in scope',
  },
  {
    code: SystemPermissions.LECTURES_UPDATE,
    name_en: 'Update Lecture',
    name_ar: 'تعديل محاضرة',
    module: 'LECTURES',
    description: 'Edit lecture titles, order, and preview status',
  },
  {
    code: SystemPermissions.LECTURES_DELETE,
    name_en: 'Delete Lecture',
    name_ar: 'حذف محاضرة',
    module: 'LECTURES',
    description: 'Remove lectures',
  },
  {
    code: SystemPermissions.LECTURES_MANAGE,
    name_en: 'Manage Lectures',
    name_ar: 'إدارة المحاضرات',
    module: 'LECTURES',
    description: 'Full lecture administration in assigned grade',
  },

  // Media & Attachments
  {
    code: SystemPermissions.VIDEOS_READ,
    name_en: 'View Videos',
    name_ar: 'عرض الفيديوهات',
    module: 'VIDEOS',
    description: 'View video assets and playback telemetry',
  },
  {
    code: SystemPermissions.VIDEOS_MANAGE,
    name_en: 'Manage Videos',
    name_ar: 'إدارة الفيديوهات',
    module: 'VIDEOS',
    description: 'Attach, replace, or remove video assets',
  },
  {
    code: SystemPermissions.ATTACHMENTS_READ,
    name_en: 'View Attachments',
    name_ar: 'عرض المرفقات',
    module: 'ATTACHMENTS',
    description: 'View lecture PDF / document attachments',
  },
  {
    code: SystemPermissions.ATTACHMENTS_MANAGE,
    name_en: 'Manage Attachments',
    name_ar: 'إدارة المرفقات',
    module: 'ATTACHMENTS',
    description: 'Upload, replace, or delete Google Drive attachments',
  },

  // Packages & Subscriptions
  {
    code: SystemPermissions.PACKAGES_READ,
    name_en: 'View Packages',
    name_ar: 'عرض الباقات',
    module: 'PACKAGES',
    description: 'View bundle packages and enrolled courses',
  },
  {
    code: SystemPermissions.PACKAGES_MANAGE,
    name_en: 'Manage Packages',
    name_ar: 'إدارة الباقات',
    module: 'PACKAGES',
    description: 'Create, edit, and publish course packages',
  },
  {
    code: SystemPermissions.SUBSCRIPTIONS_READ,
    name_en: 'View Subscriptions',
    name_ar: 'عرض الاشتراكات',
    module: 'SUBSCRIPTIONS',
    description: 'View student course/package enrollments',
  },
  {
    code: SystemPermissions.SUBSCRIPTIONS_MANAGE,
    name_en: 'Manage Subscriptions',
    name_ar: 'إدارة الاشتراكات',
    module: 'SUBSCRIPTIONS',
    description: 'Manually grant, extend, or revoke access',
  },

  // Financial & Wallet
  {
    code: SystemPermissions.WALLET_READ,
    name_en: 'View Wallets',
    name_ar: 'عرض المحافظ',
    module: 'WALLET',
    description: 'View student balances and transactions',
  },
  {
    code: SystemPermissions.WALLET_MANAGE,
    name_en: 'Manage Wallets',
    name_ar: 'إدارة المحافظ',
    module: 'WALLET',
    description: 'Manual credit/debit adjustments',
  },

  // Bookstore & Inventory
  {
    code: SystemPermissions.BOOKS_READ,
    name_en: 'View Books',
    name_ar: 'عرض الكتب',
    module: 'BOOKSTORE',
    description: 'View bookstore catalog and book details',
  },
  {
    code: SystemPermissions.BOOKS_MANAGE,
    name_en: 'Manage Books',
    name_ar: 'إدارة الكتب',
    module: 'BOOKSTORE',
    description: 'Create, update, publish, or price books',
  },
  {
    code: SystemPermissions.INVENTORY_READ,
    name_en: 'View Inventory',
    name_ar: 'عرض المخزون',
    module: 'INVENTORY',
    description: 'View stock levels and inventory movement logs',
  },
  {
    code: SystemPermissions.INVENTORY_MANAGE,
    name_en: 'Manage Inventory',
    name_ar: 'إدارة المخزون',
    module: 'INVENTORY',
    description: 'Restock, adjust in/out, and reconcile inventory',
  },
  {
    code: SystemPermissions.ORDERS_READ,
    name_en: 'View Orders',
    name_ar: 'عرض الطلبات',
    module: 'ORDERS',
    description: 'View student book orders in assigned grade',
  },
  {
    code: SystemPermissions.ORDERS_MANAGE,
    name_en: 'Manage Orders',
    name_ar: 'إدارة الطلبات',
    module: 'ORDERS',
    description: 'Update order statuses, tracking numbers, refunds',
  },

  // Notifications
  {
    code: SystemPermissions.NOTIFICATIONS_READ,
    name_en: 'View Notifications',
    name_ar: 'عرض الإشعارات',
    module: 'NOTIFICATIONS',
    description: 'View notification history and delivery stats',
  },
  {
    code: SystemPermissions.NOTIFICATIONS_CREATE,
    name_en: 'Create Notifications',
    name_ar: 'إنشاء إشعارات',
    module: 'NOTIFICATIONS',
    description: 'Compose and send targeted notifications in scope',
  },
  {
    code: SystemPermissions.NOTIFICATIONS_SEND,
    name_en: 'Dispatch Notifications',
    name_ar: 'إرسال الإشعارات',
    module: 'NOTIFICATIONS',
    description: 'Trigger immediate or scheduled dispatch',
  },

  // Devices & Sessions
  {
    code: SystemPermissions.DEVICES_READ,
    name_en: 'View Devices',
    name_ar: 'عرض الأجهزة',
    module: 'DEVICES',
    description: 'View registered student devices and active sessions',
  },
  {
    code: SystemPermissions.DEVICES_MANAGE,
    name_en: 'Manage Devices',
    name_ar: 'إدارة الأجهزة',
    module: 'DEVICES',
    description: 'Unbind device overrides (subject to supervisor cooling)',
  },

  // Analytics, Auditing & Settings
  {
    code: SystemPermissions.ANALYTICS_READ,
    name_en: 'View Analytics',
    name_ar: 'عرض الإحصائيات',
    module: 'ANALYTICS',
    description: 'Access aggregated dashboard reports in scope',
  },
  {
    code: SystemPermissions.AUDIT_LOGS_READ,
    name_en: 'View Audit Logs',
    name_ar: 'عرض سجل العمليات',
    module: 'AUDIT',
    description: 'View immutable administrative audit trail in scope',
  },
  {
    code: SystemPermissions.SECURITY_EVENTS_READ,
    name_en: 'View Security Events',
    name_ar: 'عرض أحداث الأمان',
    module: 'SECURITY',
    description: 'View security warnings for students in scope',
  },
  {
    code: SystemPermissions.SECURITY_WRITE,
    name_en: 'Manage Security Events',
    name_ar: 'إدارة أحداث الأمان',
    module: 'SECURITY',
    description: 'Manage security events and alerts',
  },
  {
    code: SystemPermissions.SETTINGS_READ,
    name_en: 'View Settings',
    name_ar: 'عرض الإعدادات',
    module: 'SETTINGS',
    description: 'View platform runtime configuration',
  },
  {
    code: SystemPermissions.SETTINGS_MANAGE,
    name_en: 'Manage Settings',
    name_ar: 'إدارة الإعدادات',
    module: 'SETTINGS',
    description: 'Update platform settings and runtime toggles',
  },

  // Tenancy Global Override (Teacher level only)
  {
    code: SystemPermissions.TENANCY_GLOBAL_OVERRIDE,
    name_en: 'Global Tenancy Override',
    name_ar: 'تجاوز العزل الدراسي',
    module: 'TENANCY',
    description: 'Global access across all academic years (Teacher level only)',
  },
];
