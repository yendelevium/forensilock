import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode('super-secret-lab-key');

export async function middleware(req: NextRequest) {
  const session = req.cookies.get('session')?.value;
  const { pathname } = req.nextUrl;

  let isValid = false;
  
  // 1. Verify Session if it exists
  if (session) {
    try {
      await jwtVerify(session, secret);
      isValid = true;
    } catch (e) {
      // Token expired or invalid
      isValid = false;
    }
  }

  // 2. SCENARIO A: User IS logged in
  if (isValid) {
    // If they try to go to Login or Register, kick them to Dashboard
    if (pathname === '/' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // 3. SCENARIO B: User is NOT logged in
  if (!isValid) {
    // If they try to go to Dashboard, kick them to Login
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
}

// Apply this middleware to these routes
export const config = {
  matcher: ['/', '/register', '/dashboard/:path*'],
};