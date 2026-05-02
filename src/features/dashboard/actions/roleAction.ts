'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getCurrentUserRoleAction() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { role: true },
    });

    return {
      name: user?.role?.name || '',
      permissions: user?.role?.permissions || [],
    };
  } catch (error) {
    console.error('Error fetching role:', error);
    return null;
  }
}
