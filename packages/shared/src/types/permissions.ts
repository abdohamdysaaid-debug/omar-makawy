export interface PermissionDefinition {
  code: string;
  name_en: string;
  name_ar: string;
  module: string;
  description: string;
}

export type PermissionModule =
  | 'STUDENTS'
  | 'COURSES'
  | 'LECTURES'
  | 'VIDEOS'
  | 'ATTACHMENTS'
  | 'PACKAGES'
  | 'SUBSCRIPTIONS'
  | 'WALLET'
  | 'BOOKSTORE'
  | 'INVENTORY'
  | 'ORDERS'
  | 'NOTIFICATIONS'
  | 'DEVICES'
  | 'ANALYTICS'
  | 'AUDIT'
  | 'SECURITY'
  | 'SETTINGS'
  | 'TENANCY';
