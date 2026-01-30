'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto'; // Node.js Crypto for Server-Side Decryption

export async function saveEscrowKey(encryptedKeyBlob: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  db.prepare('UPDATE users SET encrypted_notebook_key = ? WHERE username = ?')
    .run(encryptedKeyBlob, session.username);
    
  return { success: true };
}

export async function savePrivateNote(encryptedContent: string) {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  db.prepare('INSERT INTO private_notes (owner, content_enc) VALUES (?, ?)')
    .run(session.username, encryptedContent);

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getPrivateNotes() {
  const session = await getSession();
  if (!session) return [];

  return db.prepare('SELECT * FROM private_notes WHERE owner = ? ORDER BY id DESC')
    .all(session.username) as any[];
}

// NEW: RECOVER KEY (Server-Side Decryption using HQ_PRIVATE_KEY)
export async function recoverNotebookKey() {
  const session = await getSession();
  if (!session) return { error: "Unauthorized" };

  // 1. Get the Encrypted Blob from DB
  const user = db.prepare('SELECT encrypted_notebook_key FROM users WHERE username = ?')
    .get(session.username) as any;

  if (!user || !user.encrypted_notebook_key) {
    return { error: "No backup key found." };
  }

  try {
    // 2. Load Server Private Key from Env
    const privateKeyPem = process.env.PRIVATE_KEY;
    if (!privateKeyPem) throw new Error("Server Private Key missing");

    // 3. DECRYPT using RSA-OAEP (Server Side)
    const encryptedBuffer = Buffer.from(user.encrypted_notebook_key, 'base64');

    const decryptedBuffer = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: "sha256",
      },
      encryptedBuffer
    );

    // 4. Return the Raw AES Key (Base64) to the Client
    return { success: true, key: decryptedBuffer.toString('base64') };

  } catch (error) {
    console.error("Recovery Failed:", error);
    return { error: "Decryption failed on server." };
  }
}