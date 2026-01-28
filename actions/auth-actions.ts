'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';
import { createSession } from '@/lib/auth';
// FIX: Switch to speakeasy to avoid import errors
import speakeasy from 'speakeasy';

export async function registerUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  
  if (!username || !password || !role) return { error: 'All fields required' };

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // SPEAKEASY FIX: Generate secret securely
    const secret = speakeasy.generateSecret({ 
      name: `ForensiLock (${username})` 
    });
    
    // Store the 'base32' version of the secret in DB
    const mfaSecret = secret.base32; 

    // Insert into DB
    const stmt = db.prepare('INSERT INTO users (username, password, role, mfa_secret) VALUES (?, ?, ?, ?)');
    stmt.run(username, hashedPassword, role, mfaSecret);

    // Generate QR using the otpauth_url provided by speakeasy
    // Note: secret.otpauth_url might be undefined if name isn't set, but we set it above.
    const otpauth = secret.otpauth_url; 
    
    if (!otpauth) throw new Error('Failed to generate OTP URL');

    const qr = await QRCode.toDataURL(otpauth);
    
    return { success: true, qr, role };
  } catch (e: any) {
    console.error('Registration Error:', e);
    // specific error code for unique constraint violations in sqlite
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
       return { error: 'Username already taken' };
    }
    return { error: 'Registration failed' };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return { error: 'Invalid credentials' };
  }

  return { mfaRequired: true, userId: user.id };
}

export async function verifyMfa(userId: number, token: string) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  
  if (!user) return { error: 'User not found' };

  // SPEAKEASY FIX: Verify the token
  const verified = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token: token,
    window: 1 // Allow 30sec leeway for time drift
  });

  if (!verified) {
    return { error: 'Invalid Code' };
  }

  await createSession({ id: user.id, username: user.username, role: user.role });
  return { success: true };
}

// Add this to the bottom of actions/auth-actions.ts
import { logout } from '@/lib/auth'; // Ensure this import exists
import { redirect } from 'next/navigation';

export async function logoutAction() {
  await logout();
  redirect('/');
}