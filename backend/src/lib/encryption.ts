import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCRYPTED_PATTERN = /^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/;

/**
 * Retrieve and validate the 32-byte hex encryption key from environment.
 */
function getKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
        'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }

  const key = Buffer.from(keyHex, 'hex');
  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 32 bytes (64 hex characters). Got ${key.length} bytes.`
    );
  }

  return key;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a string in the format: base64(iv):base64(authTag):base64(ciphertext)
 */
export function encrypt(text: string): string {
  if (text == null || text === '') {
    return text;
  }

  // Avoid double-encryption
  if (isEncrypted(text)) {
    return text;
  }

  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  const ivBase64 = iv.toString('base64');
  const authTagBase64 = authTag.toString('base64');
  const ciphertextBase64 = encrypted.toString('base64');

  return `${ivBase64}:${authTagBase64}:${ciphertextBase64}`;
}

/**
 * Decrypt a previously encrypted string.
 * Expects format: base64(iv):base64(authTag):base64(ciphertext)
 * Returns the original plaintext. Handles null/undefined gracefully.
 */
export function decrypt(ciphertext: string): string {
  if (ciphertext == null || ciphertext === '') {
    return ciphertext;
  }

  // If it doesn't look encrypted, return as-is
  if (!isEncrypted(ciphertext)) {
    return ciphertext;
  }

  const key = getKey();
  const parts = ciphertext.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted value format. Expected base64(iv):base64(authTag):base64(ciphertext)');
  }

  const iv = Buffer.from(parts[0], 'base64');
  const authTag = Buffer.from(parts[1], 'base64');
  const encrypted = Buffer.from(parts[2], 'base64');

  if (iv.length !== IV_LENGTH) {
    throw new Error(`Invalid IV length: expected ${IV_LENGTH}, got ${iv.length}`);
  }

  if (authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error(`Invalid auth tag length: expected ${AUTH_TAG_LENGTH}, got ${authTag.length}`);
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString('utf8');
}

/**
 * Check whether a value appears to already be encrypted.
 * Encrypted values follow the pattern: base64:base64:base64
 */
export function isEncrypted(value: string): boolean {
  if (value == null || value === '') {
    return false;
  }

  if (!ENCRYPTED_PATTERN.test(value)) {
    return false;
  }

  const parts = value.split(':');
  if (parts.length !== 3) {
    return false;
  }

  // Validate that the IV part decodes to the expected length
  try {
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    return iv.length === IV_LENGTH && authTag.length === AUTH_TAG_LENGTH;
  } catch {
    return false;
  }
}
