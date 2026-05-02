'use server';
import { hasPermission } from '@/lib/rbac';

export const hasPermissions = async (permission: string) => {
  const permissions = await hasPermission(permission);
  return permissions;
};
