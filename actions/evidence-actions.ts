'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto'; 

export async function submitEvidence(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'officer') return { error: 'Unauthorized' };

  const description = formData.get('description') as string;
  
  // FIX: The encrypt function returns 'content', so we map it to 'encrypted'
  const { content: encrypted, iv } = encrypt(description);
  
  // Create the Immutable Hash
  const hash = crypto.createHash('sha256').update(encrypted).digest('hex');

  db.prepare(
    'INSERT INTO evidence (description_enc, iv, hash, submitted_by) VALUES (?, ?, ?, ?)'
  ).run(encrypted, iv, hash, session.username);

  return { success: true };
}

export async function getEvidence() {
  const session = await getSession();
  if (!session || session.role !== 'detective') return [];

  const rows = db.prepare('SELECT * FROM evidence ORDER BY id DESC').all() as any[];

  return rows.map(row => ({
    ...row,
    description: decrypt(row.description_enc, row.iv)
  }));
}

export async function getAuditLog() {
  const session = await getSession();
  if (!session || session.role !== 'ia') return [];

  const rows = db.prepare('SELECT * FROM evidence ORDER BY id DESC').all() as any[];

  return rows.map(row => {
    // 1. RE-CALCULATE the hash of the current data
    const currentHash = crypto
      .createHash('sha256')
      .update(row.description_enc)
      .digest('hex');

    // 2. Compare
    const isTampered = currentHash !== row.hash;

    return {
      id: row.id,
      storedHash: row.hash,     // What the database SAYS it should be
      calculatedHash: currentHash, // What the math PROVES it is
      status: isTampered ? 'TAMPERED' : 'SECURE',
    };
  });
}