'use server';

import { auth } from '@/lib/auth';
import { SignInData } from '@/types/types';
import { LoginSchema } from '@/types/zod';
import { headers } from 'next/headers';

export const signInAction = async (allData: SignInData) => {
  try {
    if (!allData.email || !allData.password) {
      return { success: false, error: 'Missing required information' };
    }

    const result = LoginSchema.safeParse(allData);
    if (!result.success) {
      return { success: false, error: 'Data tidak valid' };
    }

    const res = await auth.api.signInEmail({
      body: {
        email: allData.email,
        password: allData.password,
      },
      headers: await headers(),
      asResponse: true,
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || 'Login gagal' };
    }

    return { success: true };
  } catch (error: any) {
    const errorMessage =
      error.message || 'Terjadi kesalahan saat proses login';
    return { success: false, error: errorMessage };
  }
};
