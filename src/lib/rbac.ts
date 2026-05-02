import { auth } from './auth';
import { prisma } from './prisma';
import { headers } from 'next/headers';


export async function getCurrentUserWithPermissions() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      role: true,
      department: true,
    },
  });

  if (!user) return null;

  return {
    ...user,
    permissions: user.role?.permissions || [],
  };
}


export async function hasPermission(permission: string) {
  const user = await getCurrentUserWithPermissions();
  if (!user) return false;


  if (user.role?.name === 'ADMIN' || user.role?.name === 'super-admin')
    return true;

  return user.permissions.includes(permission);
}
