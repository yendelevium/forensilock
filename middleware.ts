import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-lab-key');

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  let isValid = false;
  
  if (session) {
    try {
      await jwtVerify(session, secret);
      isValid = true;
    } catch (e) {
      isValid = false;
    }
  }

  if (isValid) {
    if (pathname === '/' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  if (!isValid) {
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/register', '/dashboard/:path*'],
};