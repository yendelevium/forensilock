'use server';

import { db } from '@/lib/db';
import { encrypt, decrypt, generateHash } from '@/lib/crypto';
import { getSession } from '@/lib/auth';

export async function submitEvidence(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'officer') throw new Error('Unauthorized');

  const desc = formData.get('description') as string;
  const { iv, content } = encrypt(desc);
  const hash = generateHash(desc + session.username);

  db.prepare('INSERT INTO evidence (description_enc, iv, hash, submitted_by) VALUES (?, ?, ?, ?)').run(content, iv, hash, session.username);
  return { success: true };
}

export async function getEvidence() {
  const session = await getSession();
  if (!session || session.role !== 'detective') throw new Error('Unauthorized');

  const rows = db.prepare('SELECT * FROM evidence').all() as any[];
  return rows.map(row => ({
    ...row,
    description: decrypt(row.description_enc, row.iv) // Decrypting on server before sending
  }));
}

export async function getAuditLog() {
  const session = await getSession();
  if (!session || session.role !== 'ia') throw new Error('Unauthorized');

  const rows = db.prepare('SELECT * FROM evidence').all() as any[];
  return rows.map(row => {
    const decrypted = decrypt(row.description_enc, row.iv);
    const calcHash = generateHash(decrypted + row.submitted_by);
    return {
      id: row.id,
      storedHash: row.hash,
      status: calcHash === row.hash ? 'SECURE' : 'TAMPERED'
    };
  });
}