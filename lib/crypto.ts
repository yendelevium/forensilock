import crypto from 'crypto';

const ENCRYPTION_KEY = crypto.scryptSync( process.env.ENCRYPTION_PASSWORD || 'lab-password', process.env.ENCRYPTION_SALT || 'salt', 32);
const IV_LENGTH = 16;

export const encrypt = (text: string) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
};

export const decrypt = (text: string, ivHex: string) => {
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(Buffer.from(text, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("Decryption failed:", error);
    return "DECRYPTION_FAILURE: Data corrupted or key mismatch.";
  }
};

export const generateHash = (data: string) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};