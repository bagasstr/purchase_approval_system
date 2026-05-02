'use server';

import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/rbac';
import { UserService } from '@/features/users/services/user.service';

export async function getAllUsersAction() {
  try {
    if (!(await hasPermission('user:all'))) {
      throw new Error('Anda tidak memiliki izin untuk melihat seluruh user.');
    }

    const users = await UserService.getAllUsers();
    return users.map((user: any) => ({
      ...user,
      approvalLimit: user.approvalLimit ? Number(user.approvalLimit) : 0,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data user.');
  }
}

export async function updateRoleUserAction(id: string, roleName: string) {
  try {
    // Cek izin kelola user
    if (!(await hasPermission('user:all'))) {
      throw new Error('Kamu tidak memiliki izin kelola role');
    }

    // Cari roleId berdasarkan nama role di tabel Role
    const targetRole = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!targetRole) {
      throw new Error('Role tidak ditemukan di database.');
    }

    // Update role user secara manual di DB via roleId
    const updatedRoleUser: any = await prisma.user.update({
      where: { id },
      data: {
        roleId: targetRole.id,
      },
    });

    // Sanitasi data sebelum dikirim ke Client
    const result = {
      ...updatedRoleUser,
      approvalLimit: updatedRoleUser.approvalLimit
        ? Number(updatedRoleUser.approvalLimit)
        : 0,
      createdAt: updatedRoleUser.createdAt
        ? updatedRoleUser.createdAt.toISOString()
        : null,
      updatedAt: updatedRoleUser.updatedAt
        ? updatedRoleUser.updatedAt.toISOString()
        : null,
    };

    return { success: true, data: result };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal update role user.',
    };
  }
}

export async function deleteUserAction(id: string) {
  try {
    if (!(await hasPermission('user:all'))) {
      throw new Error('Anda tidak memiliki izin untuk menghapus user.');
    }

    return await prisma.user.delete({
      where: { id },
    });
  } catch (error: any) {
    throw new Error(error.message || 'Gagal menghapus user.');
  }
}

export async function getTeamMembersAction(departmentId?: string) {
  try {
    const isAdmin = await hasPermission('user:all');
    
    const users = await prisma.user.findMany({
      where: isAdmin ? {} : { departmentId },
      include: {
        role: true,
        department: true,
      },
      orderBy: { 
        department: { name: 'asc' },
      },
    });

    return users.map((user: any) => ({
      ...user,
      approvalLimit: user.approvalLimit ? Number(user.approvalLimit) : 0,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    }));
  } catch (error: any) {
    throw new Error(error.message || 'Gagal mengambil data tim.');
  }
}
