'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';
import crypto from 'crypto'; 
import { revalidatePath } from 'next/cache';

export async function submitEvidence(prevState: any, formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'officer') return { error: 'Unauthorized' };

  const description = formData.get('description') as string;
  const category = formData.get('category') as string || 'general';
  
  const { content: encrypted, iv } = encrypt(description);
  const hash = crypto.createHash('sha256').update(encrypted + category).digest('hex');

  db.prepare(
    'INSERT INTO evidence (description_enc, iv, hash, submitted_by, category) VALUES (?, ?, ?, ?, ?)'
  ).run(encrypted, iv, hash, session.username, category);

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getEvidence() {
  const session = await getSession();
  if (!session) return [];

  let query = 'SELECT * FROM evidence ORDER BY id DESC';
  let params: any[] = [];
  
  if (session.role === 'officer') {
     query = 'SELECT * FROM evidence WHERE submitted_by = ? ORDER BY id DESC';
     params = [session.username];
  } else {
     db.prepare('INSERT INTO access_logs (user, action) VALUES (?, ?)')
       .run(session.username, 'ACCESSED_VAULT');
  }

  const rows = db.prepare(query).all(...params) as any[];

  const evidenceWithNotes = rows.map(row => {
     const notes = db.prepare('SELECT * FROM case_notes WHERE evidence_id = ? ORDER BY updated_at ASC').all(row.id) as any[];
     const decryptedNotes = notes.map(n => ({
        id: n.id,
        author: n.author,
        text: decrypt(n.note_enc, n.note_iv),
        updated_at: n.updated_at
     }));
     return {
        ...row,
        description: decrypt(row.description_enc, row.iv),
        notes: decryptedNotes
     };
  });

  return evidenceWithNotes;
}

export async function addNote(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'detective') return { error: 'Unauthorized' };

  const evidenceId = formData.get('evidence_id') as string;
  const text = formData.get('note_text') as string;

  const { content: enc, iv } = encrypt(text);

  db.prepare('INSERT INTO case_notes (evidence_id, author, note_enc, note_iv) VALUES (?, ?, ?, ?)')
    .run(evidenceId, session.username, enc, iv);

  db.prepare('INSERT INTO access_logs (user, action) VALUES (?, ?)')
    .run(session.username, `ADDED_NOTE_CASE_${evidenceId}`);

  revalidatePath('/dashboard');
  return { success: true };
}

export async function editNote(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== 'detective') return { error: 'Unauthorized' };

  const noteId = formData.get('note_id') as string;
  const newText = formData.get('note_text') as string;

  const note = db.prepare('SELECT * FROM case_notes WHERE id = ?').get(noteId) as any;
  if (!note || note.author !== session.username) {
     return { error: 'You can only edit your own notes.' };
  }

  const { content: enc, iv } = encrypt(newText);

  db.prepare('UPDATE case_notes SET note_enc = ?, note_iv = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(enc, iv, noteId);

  db.prepare('INSERT INTO access_logs (user, action) VALUES (?, ?)')
    .run(session.username, `EDITED_NOTE_${noteId}`);

  revalidatePath('/dashboard');
  return { success: true };
}

export async function getAuditLog() {
  const session = await getSession();
  if (!session || session.role !== 'ia') return [];
  const rows = db.prepare('SELECT * FROM evidence ORDER BY id DESC').all() as any[];
  return rows.map(row => {
    const currentHash = crypto.createHash('sha256').update(row.description_enc + (row.category || 'general')).digest('hex');
    return { id: row.id, storedHash: row.hash, status: currentHash !== row.hash ? 'TAMPERED' : 'SECURE' };
  });
}

export async function getAccessLogs() {
  const session = await getSession();
  if (!session || session.role !== 'ia') return [];
  return db.prepare('SELECT * FROM access_logs ORDER BY id DESC LIMIT 50').all();
}