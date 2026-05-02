import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from './lib/prisma';

export async function proxy(request: NextRequest) {
  const response = await fetch(new URL('/api/auth/get-session', request.url), {
    headers: {
      cookie: request.headers.get('cookie') || '',
    },
  });

  const session = await response.json().catch(() => null);

  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  if (!session) {
    if (isDashboardPage || pathname === '/') {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  if (isAuthPage || pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  let roleData = (session.user as any)?.role_data;
  if (!roleData && session.user?.roleId) {
    roleData = await prisma.role.findUnique({
      where: { id: session?.user?.roleId as string | undefined },
    });
  }

  const userRole = roleData?.name?.toUpperCase();
  const userPerms = roleData?.permissions || [];

  if (userRole === 'ADMIN' || userRole === 'SUPER-ADMIN') {
    return NextResponse.next();
  }

  const routePermissions: Record<string, string | string[]> = {
    '/dashboard/requests': 'purchase-request:create',
    '/dashboard/approvals': [
      'purchase-request:approve-manager',
      'purchase-request:approve-procurement-survey',
      'purchase-request:approve-finance',
      'purchase-request:approve-procurement-purchase',
    ],
    '/dashboard/team': ['purchase-request:approve-manager', 'user:all'],
    '/dashboard/user-management': 'user:all',
    '/dashboard/departments': 'department:all',
    '/dashboard/roles': 'role:all',
    '/dashboard/analytics': ['purchase-request:view-all', 'role:all'],
  };

  const requiredPerms = Object.entries(routePermissions).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (requiredPerms) {
    const hasPermission = Array.isArray(requiredPerms)
      ? requiredPerms.some((p) => userPerms.includes(p))
      : userPerms.includes(requiredPerms);

    if (!hasPermission) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/signin', '/signup'],
};
