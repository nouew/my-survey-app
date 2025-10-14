
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const uid = request.cookies.get('uid')?.value;
  const isLoggedIn = !!uid;

  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.includes(pathname);

  // Allow Next.js internal requests, API routes, and static assets to pass through
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || /\.(.*)$/.test(pathname)) {
    return NextResponse.next();
  }

  // If user is logged in and tries to access a public page like /login, redirect to home
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access a protected page, redirect to login
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // This matcher ensures the middleware runs on all pages except for
    // specific asset types and Next.js internals.
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)',
  ],
};
