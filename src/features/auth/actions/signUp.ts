'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SignUpData } from '@/types/types';
import { RegisterSchema } from '@/types/zod';
import { headers } from 'next/headers';

export const signUpAction = async (allData: SignUpData) => {
  try {
    if (
      !allData.email ||
      !allData.name ||
      !allData.password ||
      !allData.phone ||
      !allData.confirmPassword
    ) {
      return { success: false, error: 'Missing required information' };
    }

    const result = RegisterSchema.safeParse(allData);
    if (!result.success) {
      return { success: false, error: 'Data tidak valid' };
    }


    const signUpRes = await (auth.api as any).signUpEmail({
      body: {
        name: allData.name,
        email: allData.email,
        password: allData.password,
        isActive: true,
        phone: allData.phone,
      },
      asResponse: true,
    });

    if (!signUpRes) {
      return { success: false, error: 'Gagal mendaftarkan user di Auth' };
    }


    await prisma.user.update({
      where: { email: allData.email },
      data: {
        role: {
          connectOrCreate: {
            where: { name: 'EMPLOYEE' },
            create: { name: 'EMPLOYEE' },
          },
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error.message || 'Terjadi kesalahan saat proses pendaftaran';

    return { success: false, error: errorMessage };
  }
};
