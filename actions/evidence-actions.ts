'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto'; 
import { revalidatePath } from 'next/cache';

// 1. OFFICER SUBMIT (Unchanged)
export async function submitEvidence(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'officer') return { error: 'Unauthorized' };

  const description = formData.get('description') as string;
  const category = formData.get('category') as string || 'general';
  
  const { content: encrypted, iv } = encrypt(description);
  
  // Hash covers description + category
  const hash = crypto.createHash('sha256').update(encrypted + category).digest('hex');

  db.prepare(
    'INSERT INTO evidence (description_enc, iv, hash, submitted_by, category) VALUES (?, ?, ?, ?, ?)'
  ).run(encrypted, iv, hash, session.username, category);

  return { success: true };
}

// 2. DETECTIVE: SUBMIT NOTES (New)
export async function submitAnalysis(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'detective') return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const analysisText = formData.get('analysis') as string;

  // Encrypt the notes! Even notes are secret.
  const { content: enc, iv } = encrypt(analysisText);

  db.prepare(
    'UPDATE evidence SET analysis_enc = ?, analysis_iv = ?, analyzed_by = ? WHERE id = ?'
  ).run(enc, iv, session.username, id);
  
  // Log this specific action
  db.prepare('INSERT INTO access_logs (user, action) VALUES (?, ?)')
    .run(session.username, `ADDED_NOTE_CASE_${id}`);

  revalidatePath('/dashboard');
  return { success: true };
}

// 3. GET EVIDENCE (With Automatic Access Logging)
export async function getEvidence() {
  const session = await getSession();
  if (!session || session.role !== 'detective') return [];

  // --- THE "WATCHER" LOGIC ---
  // Every time a Detective calls this function, we record it.
  db.prepare('INSERT INTO access_logs (user, action) VALUES (?, ?)')
    .run(session.username, 'ACCESSED_EVIDENCE_VAULT');
  // ---------------------------

  const rows = db.prepare('SELECT * FROM evidence ORDER BY id DESC').all() as any[];

  return rows.map(row => ({
    ...row,
    description: decrypt(row.description_enc, row.iv),
    // Decrypt the note if it exists
    analysis: row.analysis_enc ? decrypt(row.analysis_enc, row.analysis_iv) : null
  }));
}

// 4. IA: GET ACCESS LOGS (New)
export async function getAccessLogs() {
  const session = await getSession();
  if (!session || session.role !== 'ia') return [];
  
  // Return last 50 logs
  return db.prepare('SELECT * FROM access_logs ORDER BY id DESC LIMIT 50').all();
}

// 5. IA: AUDIT (Standard)
export async function getAuditLog() {
  const session = await getSession();
  if (!session || session.role !== 'ia') return [];

  const rows = db.prepare('SELECT * FROM evidence ORDER BY id DESC').all() as any[];

  return rows.map(row => {
    // If the note exists, it's part of the record, but we only hash the EVIDENCE for integrity here.
    // (You could extend this to hash notes too, but let's keep it simple for the viva)
    const currentHash = crypto
      .createHash('sha256')
      .update(row.description_enc + (row.category || 'general'))
      .digest('hex');

    const isTampered = currentHash !== row.hash;

    return {
      id: row.id,
      storedHash: row.hash,
      calculatedHash: currentHash,
      status: isTampered ? 'TAMPERED' : 'SECURE',
    };
  });
}