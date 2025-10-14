import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('user_session');
  const { pathname } = request.nextUrl;

  // If the user is trying to access the login page but is already logged in,
  // redirect them to the home page.
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If the user is not logged in and is trying to access any page other than login,
  // redirect them to the login page.
  if (!sessionCookie && pathname !== '/login') {
    // Allow access to public assets like images, course, sites, and api routes.
    if (pathname.startsWith('/_next/') || pathname.startsWith('/api/') || pathname.startsWith('/course') || pathname.startsWith('/sites') || pathname.includes('.')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
