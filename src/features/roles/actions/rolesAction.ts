'use server';

import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/rbac';
import { rolesService } from '../services/roles.service';

export async function getAllRoleAction() {
  try {
    const roles = await rolesService.getAllRoles();
    return roles;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data role.');
  }
}
export async function getRoleByIdAction(id: string) {
  try {
    const roles = await rolesService.getById(id);
    return roles;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data role.');
  }
}

export async function createRoleAction(data: {
  name: string;
  permissions: string[];
}) {
  try {

    if (!(await hasPermission('role:all'))) {
      throw new Error('Anda tidak memiliki izin untuk mengelola role.');
    }

    const newRole = await rolesService.createRole(data);
    return newRole;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal membuat role baru.');
  }
}

export async function deleteRoleAction(id: string) {
  try {
    if (!(await hasPermission('role:all'))) {
      throw new Error('Anda tidak memiliki izin untuk menghapus role.');
    }

    const role = await rolesService.deleteRole(id);
    return role;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal menghapus role.');
  }
}

export async function updateRoleAction(
  id: string,
  data: { name: string; permissions: string[] },
) {
  try {
    if (!(await hasPermission('role:all'))) {
      throw new Error('Anda tidak memiliki izin untuk memperbarui role.');
    }

    const role = await rolesService.updateRole(id, data);
    return role;
  } catch (error: any) {
    throw new Error(error.message || 'Gagal update role.');
  }
}
