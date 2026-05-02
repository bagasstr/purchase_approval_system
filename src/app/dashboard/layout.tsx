import { Sidebar } from '@/features/dashboard/components/Sidebar';
import { Header } from '@/features/dashboard/components/Header';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ServerUser } from '@/types/server-user';

// Single source of truth: fetch session + user + role in ONE query chain
async function getAuthenticatedUser() {
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

  return user;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/signin');
  }

  const roleName = user.role?.name?.toUpperCase() || '';
  const permissions = user.role?.permissions || [];
  const isAdmin = roleName === 'ADMIN' || roleName === 'SUPER-ADMIN';

  return (
    <div className='min-h-screen bg-background text-foreground font-sans flex'>
      {}
      <Sidebar
        serverUser={{
          id: user.id,
          name: user.name,
          email: user.email,
          departmentId: user.departmentId,
          departmentName: user.department?.name || null,
          roleId: user.roleId,
          roleName: user.role?.name || null,
          permissions,
          isAdmin,
          approvalLimit: user.approvalLimit,
        }}
      />

      {}
      <div className='flex-1 ml-64 flex flex-col min-h-screen'>
        {}
        <Header />

        {}
        <main className='flex-1 p-8 transition-all duration-300 ease-in-out'>
          {children}
        </main>
      </div>
    </div>
  );
}
