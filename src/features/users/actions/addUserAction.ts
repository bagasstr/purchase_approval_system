'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignUpData } from '@/types/types';
import { hasPermission } from '@/lib/rbac';
import { headers } from 'next/headers';

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

    // 1. Buat user via Better-Auth (Tanpa Role)
    const newUser = await auth.api.signUpEmail({
      body: {
        name: allData.name,
        email: allData.email,
        password: allData.password,
        phone: allData.phone,
        isActive: true,
      },
      headers: await headers(),
    });

    if (!newUser) {
      return { success: false, error: 'Gagal membuat user di Auth.' };
    }

    // 2. Cari roleId berdasarkan nama
    const targetRole = await prisma.role.findUnique({
      where: { name: allData.role || 'employee' },
    });

    // 3. Update roleId dan Department via Prisma
    await prisma.user.update({
      where: { email: allData.email },
      data: {
        role: targetRole ? { connect: { id: targetRole.id } } : undefined,
        department: allData.department
          ? {
              connectOrCreate: {
                where: { name: allData.department },
                create: { name: allData.department },
              },
            }
          : undefined,
      },
    });

    return { success: true };
  } catch (error: any) {
    const errorMessage = error.message || 'Gagal menambahkan user.';
    return { success: false, error: errorMessage };
  }
};
