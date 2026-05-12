import 'server-only';
import crypto from 'node:crypto';

/**
 * Symmetric encryption helpers for at-rest secrets like the user's BYO
 * OpenAI key. Uses AES-256-GCM with a 12-byte IV and a 16-byte auth tag.
 *
 * ENCRYPTION_KEY must be at least 32 bytes when decoded from base64 or
 * UTF-8. In production, generate with `openssl rand -base64 32`.
 *
 * Storage format: base64(iv || authTag || ciphertext)
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Accept either base64 or utf-8. Derive 32 bytes via SHA-256 for safety.
  const buf = Buffer.from(raw, 'utf-8');
  return crypto.createHash('sha256').update(buf).digest();
}

export function encryptSecret(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptSecret(ciphertext: string): string {
  const key = getKey();
  const buf = Buffer.from(ciphertext, 'base64');
  if (buf.length < IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error('Invalid ciphertext');
  }
  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const data = buf.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString('utf-8');
}
