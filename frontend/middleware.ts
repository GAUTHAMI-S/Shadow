import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(req: any) {
  const token = req.cookies.get('gd_token')?.value;
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!token && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|workbox|.*\\..*).*)',
  ],
};
