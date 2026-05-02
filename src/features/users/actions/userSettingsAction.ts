'use server';

import { prisma } from '@/lib/prisma';
import { hasPermission } from '@/lib/rbac';
import { revalidatePath } from 'next/cache';

export async function updateUserAction(
  id: string,
  data: {
    roleId?: string;
    departmentId?: string;
    approvalLimit?: number;
    isActive?: boolean;
    banned?: boolean;
  },
) {
  try {
    if (!(await hasPermission('user:all'))) {
      throw new Error('Anda tidak memiliki izin untuk mengedit user');
    }

    const updateData: any = {};
    if (data.roleId !== undefined) {
      if (data.roleId) {
        const roleExists = await prisma.role.findUnique({ where: { id: data.roleId } });
        if (!roleExists) throw new Error(`Role ID ${data.roleId} tidak ditemukan di database!`);
      }
      updateData.roleId = data.roleId;
    }
    
    if (data.departmentId !== undefined) {
      if (data.departmentId) {
        const deptExists = await prisma.department.findUnique({ where: { id: data.departmentId } });
        if (!deptExists) throw new Error(`Department ID ${data.departmentId} tidak ditemukan!`);
      }
      updateData.departmentId = data.departmentId;
    }

    if (data.approvalLimit !== undefined) updateData.approvalLimit = data.approvalLimit;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.banned !== undefined) updateData.banned = data.banned;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
        department: true,
      },
    });

    return {
      success: true,
      data: {
        ...updatedUser,
        approvalLimit: updatedUser.approvalLimit
          ? Number(updatedUser.approvalLimit)
          : 0,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Gagal update data user' };
  }
}

export async function toggleUserStatusAction(
  id: string,
  currentStatus: boolean,
) {
  try {
    if (!(await hasPermission('user:all'))) {
      throw new Error('Anda tidak memiliki izin');
    }

    await prisma.user.update({
      where: { id },
      data: { banned: !currentStatus },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
