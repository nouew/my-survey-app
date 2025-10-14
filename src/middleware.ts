
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const uid = request.cookies.get('uid')?.value;
  const isLoggedIn = !!uid;

  const publicPaths = ['/login'];
  
  if (isLoggedIn && publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!isLoggedIn && !publicPaths.includes(pathname)) {
    if (pathname.startsWith('/_next') || pathname.startsWith('/api')) {
        return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif)$).*)',
  ],
};
