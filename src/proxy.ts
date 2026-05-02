import { NextResponse, type NextRequest } from 'next/server';
import { auth } from './lib/auth';
import { prisma } from './lib/prisma';
import { headers } from 'next/headers';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Auth pages & root: lightweight cookie check only — skip DB queries
  if (isAuthPage || pathname === '/') {
    const sessionCookie = request.cookies.get('better-auth.session_token');
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // No session cookie = let them through to signin/signup
    return NextResponse.next();
  }

  // Dashboard routes: full session validation needed
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  const user = session.user as any;
  let roleData = user?.role_data;
  if (!roleData && user?.roleId) {
    roleData = await prisma.role.findUnique({
      where: { id: user.roleId },
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
