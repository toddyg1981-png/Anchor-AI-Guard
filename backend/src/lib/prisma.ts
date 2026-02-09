import { PrismaClient } from '@prisma/client';
import { applyEncryptionMiddleware } from './prisma-encryption';

export const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

// Attach field-level encryption/decryption middleware
applyEncryptionMiddleware(prisma);
