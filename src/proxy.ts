import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Optimistic cookie-only check — NO DB queries, NO session validation
  // Real validation happens inside dashboard layout (server component)
  const sessionCookie = request.cookies.get('better-auth.session_token');

  if (isAuthPage || pathname === '/') {
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isDashboardPage) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/signin', '/signup'],
};
