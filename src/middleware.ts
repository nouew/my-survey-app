
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateAdminSession } from './app/actions';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const uid = request.cookies.get('uid')?.value;
  const username = request.cookies.get('username')?.value;
  const isLoggedIn = !!uid;

  const publicPaths = ['/login'];
  const adminPath = '/admin';

  // Redirect logged-in users from public pages (like /login) to the home page
  if (isLoggedIn && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Redirect non-logged-in users from protected pages to the login page
  if (!isLoggedIn && !publicPaths.includes(pathname)) {
    // Allow Next.js internal requests to pass through
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Handle admin route protection
  if (pathname.startsWith(adminPath)) {
    if (!isLoggedIn || username?.toLowerCase() !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url)); // Redirect non-admins away
    }
    // We can't use the full validateAdminSession() here as middleware runs in Edge runtime.
    // The client-side check in AdminPage is the primary guard.
    // This is a basic layer of protection.
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)',
  ],
};
