
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const username = request.cookies.get('username')?.value;
  const activationKey = request.cookies.get('activationKey')?.value;
  const isLoggedIn = !!username && !!activationKey;

  // Define public paths that don't require authentication
  const publicPaths = ['/login'];
  
  // If user is logged in and tries to access a public path, redirect to home
  if (isLoggedIn && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is not logged in and tries to access a protected path, redirect to login
  if (!isLoggedIn && !publicPaths.includes(pathname)) {
    // allow access to static files and api routes
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and image files (png, jpg, jpeg, gif, svg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)',
  ],
};
