'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignUpData } from '@/types/types';
import { hasPermission } from '@/lib/rbac';
import { hashPassword } from 'better-auth/crypto';

export const addUserAction = async (allData: SignUpData) => {
  try {
    // Cek izin manual
    if (!(await hasPermission('user:all'))) {
      throw new Error('Anda tidak memiliki izin untuk menambah user.');
    }

    if (
      !allData.email ||
      !allData.name ||
      !allData.password ||
      !allData.phone
    ) {
      return { success: false, error: 'Missing required information' };
    }

    // 1. Cari roleId & departmentId dulu biar bisa langsung dimasukin pas create
    const targetRole = await prisma.role.findUnique({
      where: { name: allData.role || 'employee' },
    });

    let departmentId: string | undefined;
    if (allData.department) {
      const dep = await prisma.department.upsert({
        where: { name: allData.department },
        update: {},
        create: { name: allData.department },
      });
      departmentId = dep.id;
    }

    // 2. Akses internalAdapter via $context
    const ctx = await auth.$context;

    // 3. Hash password
    const hashedPassword = await hashPassword(allData.password);

    // 4. Buat User via internalAdapter
    const user = await ctx.internalAdapter.createUser({
      name: allData.name,
      email: allData.email,
      emailVerified: false,
      phone: allData.phone,
      isActive: allData.isActive ?? true,
      roleId: targetRole?.id,
      departmentId: departmentId,
    });

    if (!user) {
      throw new Error('Gagal membuat user via Internal Adapter.');
    }

    // 5. Buat Credential Account (untuk login email/password)
    await ctx.internalAdapter.createAccount({
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: hashedPassword,
    });

    return { success: true };
  } catch (error: any) {
    console.error('ADD_USER_ERROR:', error);
    const errorMessage = error.message || 'Gagal menambahkan user.';
    return { success: false, error: errorMessage };
  }
};
