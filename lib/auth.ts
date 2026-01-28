import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode('super-secret-lab-key');

export async function createSession(payload: any) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret);
  
  // FIXED: await cookies()
  (await cookies()).set('session', token, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function getSession() {
  // FIXED: await cookies()
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  // FIXED: await cookies()
  (await cookies()).delete('session');
}