import crypto from 'crypto';

// Use a fixed key for the lab (In prod, use env vars)
const ENCRYPTION_KEY = crypto.scryptSync('lab-password', 'salt', 32);
const IV_LENGTH = 16;

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

export const decrypt = (text: string, ivHex: string) => {
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(Buffer.from(text, 'hex'));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const generateHash = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};