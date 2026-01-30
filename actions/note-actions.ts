'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// 1. SAVE ESCROW KEY (Hybrid Crypto Exchange)
export async function saveEscrowKey(encryptedKeyBlob: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  db.prepare('UPDATE users SET encrypted_notebook_key = ? WHERE username = ?')
    .run(encryptedKeyBlob, session.username);
    
  return { success: true };
}

// 2. SAVE NOTE
export async function savePrivateNote(encryptedContent: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  db.prepare('INSERT INTO private_notes (owner, content_enc) VALUES (?, ?)')
    .run(session.username, encryptedContent);

  revalidatePath('/dashboard');
  return { success: true };
}

// 3. GET NOTES
export async function getPrivateNotes() {
  const session = await getSession();
  if (!session) return [];

  return db.prepare('SELECT * FROM private_notes WHERE owner = ? ORDER BY id DESC')
    .all(session.username) as any[];
}