import { describe, it, expect } from 'vitest';

// Set env var before importing
process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 32 bytes in hex

import { encrypt, decrypt, isEncrypted } from '../lib/encryption';

describe('Encryption Module', () => {
  it('encrypts and decrypts a string correctly', () => {
    const plaintext = 'my-secret-bank-account-123';
    const encrypted = encrypt(plaintext);
    expect(encrypted).not.toBe(plaintext);
    expect(isEncrypted(encrypted)).toBe(true);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('handles empty string', () => {
    expect(encrypt('')).toBe('');
    expect(decrypt('')).toBe('');
  });

  it('handles null/undefined gracefully', () => {
    expect(encrypt(null as unknown as string)).toBe(null);
    expect(decrypt(null as unknown as string)).toBe(null);
  });

  it('does not double-encrypt', () => {
    const plaintext = 'sensitive-data';
    const encrypted = encrypt(plaintext);
    const doubleEncrypted = encrypt(encrypted);
    expect(doubleEncrypted).toBe(encrypted);
  });

  it('produces different ciphertexts for same plaintext (random IV)', () => {
    const plaintext = 'same-data';
    const e1 = encrypt(plaintext);
    const e2 = encrypt(plaintext);
    expect(e1).not.toBe(e2);
    expect(decrypt(e1)).toBe(plaintext);
    expect(decrypt(e2)).toBe(plaintext);
  });

  it('isEncrypted returns false for plaintext', () => {
    expect(isEncrypted('hello world')).toBe(false);
    expect(isEncrypted('not:encrypted:format:extra')).toBe(false);
  });
});
