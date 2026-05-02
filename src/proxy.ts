import { NextResponse, type NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthPage =
    pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isDashboardPage = pathname.startsWith('/dashboard');

  // Use better-auth's official helper — handles __Secure- prefix, cookie name, etc.
  const sessionToken = getSessionCookie(request);

  if (isAuthPage || pathname === '/') {
    if (sessionToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (isDashboardPage) {
    if (!sessionToken) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/signin', '/signup'],
};
