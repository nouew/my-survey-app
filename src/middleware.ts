import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('user_session')?.value;
  const { pathname } = request.nextUrl;

  const isPublicAsset = pathname.startsWith('/_next/') || pathname.includes('.');
  const isAuthRoute = pathname === '/login';

  // If trying to access a protected route without a session, redirect to login
  if (!sessionCookie && !isAuthRoute && !isPublicAsset) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login page, redirect to home
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all routes except for API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
