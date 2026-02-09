import { PrismaClient, Prisma } from '@prisma/client';
import { encrypt, decrypt, isEncrypted } from './encryption';

/**
 * Field-level encryption middleware for Prisma.
 *
 * Transparently encrypts sensitive fields on write (create/update)
 * and decrypts them on read (findUnique/findFirst/findMany).
 */

// Models and their sensitive fields that require encryption
const ENCRYPTED_FIELDS: Record<string, string[]> = {
  UserProfile: ['bankAccountNumber', 'bankRoutingNumber', 'bankIban', 'taxId'],
  OAuthAccount: ['accessToken', 'refreshToken'],
};

/**
 * Encrypt the specified fields in a data object.
 * Skips null/undefined values and already-encrypted values.
 */
function encryptFields(data: Record<string, any> | undefined, fields: string[]): void {
  if (!data) return;

  for (const field of fields) {
    if (data[field] != null && typeof data[field] === 'string') {
      if (!isEncrypted(data[field])) {
        data[field] = encrypt(data[field]);
      }
    }
  }
}

/**
 * Decrypt the specified fields in a single result object.
 * Skips null/undefined values.
 */
function decryptFields(record: Record<string, any> | null | undefined, fields: string[]): void {
  if (!record) return;

  for (const field of fields) {
    if (record[field] != null && typeof record[field] === 'string') {
      record[field] = decrypt(record[field]);
    }
  }
}

/**
 * Decrypt fields in a result that may be a single object or an array.
 */
function decryptResult(result: any, fields: string[]): void {
  if (result == null) return;

  if (Array.isArray(result)) {
    for (const record of result) {
      decryptFields(record, fields);
    }
  } else if (typeof result === 'object') {
    decryptFields(result, fields);
  }
}

// Actions that write data
const WRITE_ACTIONS: Prisma.PrismaAction[] = ['create', 'update', 'upsert', 'createMany', 'updateMany'];

// Actions that read data
const READ_ACTIONS: Prisma.PrismaAction[] = ['findUnique', 'findFirst', 'findMany'];

/**
 * Apply field-level encryption middleware to a PrismaClient instance.
 *
 * - On create/update: encrypts sensitive fields before they hit the database
 * - On find*: decrypts sensitive fields after reading from the database
 */
export function applyEncryptionMiddleware(prisma: PrismaClient): void {
  prisma.$use(async (params: Prisma.MiddlewareParams, next: (params: Prisma.MiddlewareParams) => Promise<any>) => {
    const model = params.model as string | undefined;
    if (!model || !ENCRYPTED_FIELDS[model]) {
      return next(params);
    }

    const fields = ENCRYPTED_FIELDS[model];

    // --- Encrypt on write ---
    if (WRITE_ACTIONS.includes(params.action)) {
      // Handle top-level data
      if (params.args?.data) {
        encryptFields(params.args.data, fields);
      }

      // Handle upsert's create and update blocks
      if (params.action === 'upsert') {
        if (params.args?.create) {
          encryptFields(params.args.create, fields);
        }
        if (params.args?.update) {
          encryptFields(params.args.update, fields);
        }
      }

      // Handle createMany's data array
      if (params.action === 'createMany' && Array.isArray(params.args?.data)) {
        for (const record of params.args.data) {
          encryptFields(record, fields);
        }
      }
    }

    // Execute the query
    const result = await next(params);

    // --- Decrypt on read ---
    if (READ_ACTIONS.includes(params.action)) {
      decryptResult(result, fields);
    }

    // Also decrypt the result of write operations that return records
    if (['create', 'update', 'upsert'].includes(params.action)) {
      decryptResult(result, fields);
    }

    return result;
  });
}
