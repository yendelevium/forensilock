'use server';

import { db } from '@/lib/db';
import bcrypt from 'bcrypt';
import QRCode from 'qrcode';
import { createSession } from '@/lib/auth';
import speakeasy from 'speakeasy';
import { redirect } from 'next/navigation';

const COMMON_PASSWORDS = new Set([
  'password', '123456', '12345678', '123456789', 'qwerty', '111111', 
  'admin', 'welcome', 'login', 'forensilock', 'security', 'letmein'
]);

function validateNIST(password: string, username: string): string | null {
  if (password.length < 8) {
    return "Password must be at least 8 characters long.";
  }
  if (password.length > 64) {
    return "Password is too long (Max 64 characters).";
  }

  // Breached/Common Password Check
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return "This password is too common (NIST Blacklist). Please choose a stronger one.";
  }

  if (password.toLowerCase().includes(username.toLowerCase())) {
    return "Password cannot contain your username.";
  }

  return null;
}

export async function registerUser(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = formData.get('role') as string;
  
  if (!username || !password || !role) return { error: 'All fields required' };

  const passwordError = validateNIST(password, username);
  if (passwordError) {
    return { error: passwordError };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Use Base32 for TOTP secrets (Standard)
    const secret = speakeasy.generateSecret({ 
      name: `ForensiLock (${username})` 
    });
    
    const mfaSecret = secret.base32; 

    const stmt = db.prepare('INSERT INTO users (username, password, role, mfa_secret) VALUES (?, ?, ?, ?)');
    stmt.run(username, hashedPassword, role, mfaSecret);

    const otpauth = secret.otpauth_url; 
    if (!otpauth) throw new Error('Failed to generate OTP URL');

    const qr = await QRCode.toDataURL(otpauth);
    
    return { success: true, qr, role };
  } catch (e: any) {
    console.error('Registration Error:', e);
    if (e.message && e.message.includes('UNIQUE constraint failed')) {
       return { error: 'Username already taken' };
    }
    return { error: 'Registration failed' };
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  // NIST: Artificial Delay to prevent high-speed Brute Force (Rate Limiting Simulation)
  await new Promise(resolve => setTimeout(resolve, 500)); 

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

  const verified = speakeasy.totp.verify({
    secret: user.mfa_secret,
    encoding: 'base32',
    token: token,
    window: 1 
  });

  if (!verified) {
    return { error: 'Invalid Code' };
  }

  await createSession({ id: user.id, username: user.username, role: user.role });
  return { success: true };
}

export async function logoutAction() {
  await import('@/lib/auth').then(mod => mod.logout());
  redirect('/');
}