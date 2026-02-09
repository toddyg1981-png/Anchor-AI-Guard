import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { encrypt, decrypt } from '../lib/encryption';

// TOTP implementation using crypto (no external dependency)
function generateTOTPSecret(): string {
  return crypto.randomBytes(20).toString('hex');
}

function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (const byte of buffer) bits += byte.toString(2).padStart(8, '0');
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5).padEnd(5, '0');
    result += alphabet[parseInt(chunk, 2)];
  }
  return result;
}

function _generateTOTP(secret: string, timeStep: number = 30, digits: number = 6): string {
  const time = Math.floor(Date.now() / 1000 / timeStep);
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(time));
  const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
  hmac.update(timeBuffer);
  const hash = hmac.digest();
  const offset = hash[hash.length - 1] & 0xf;
  const code = ((hash[offset] & 0x7f) << 24 | hash[offset + 1] << 16 | hash[offset + 2] << 8 | hash[offset + 3]) % Math.pow(10, digits);
  return code.toString().padStart(digits, '0');
}

function verifyTOTP(secret: string, code: string, window: number = 1): boolean {
  const timeStep = 30;
  for (let i = -window; i <= window; i++) {
    const time = Math.floor(Date.now() / 1000 / timeStep) + i;
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(time));
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'hex'));
    hmac.update(timeBuffer);
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 0xf;
    const generated = ((hash[offset] & 0x7f) << 24 | hash[offset + 1] << 16 | hash[offset + 2] << 8 | hash[offset + 3]) % 1000000;
    if (generated.toString().padStart(6, '0') === code) return true;
  }
  return false;
}

export async function mfaRoutes(app: FastifyInstance): Promise<void> {
  // GET /mfa/status - Check if MFA is enabled for current user
  app.get('/mfa/status', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as unknown as Record<string, unknown>).user as { userId: string };
    const totp = await prisma.totpSecret.findUnique({ where: { userId } });
    return reply.send({ enabled: !!totp?.verified, configured: !!totp });
  });

  // POST /mfa/setup - Generate TOTP secret and return QR code URI
  app.post('/mfa/setup', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId, email } = (request as Record<string, unknown>).user as { userId: string; email: string };

    // Delete any existing unverified setup
    await prisma.totpSecret.deleteMany({ where: { userId, verified: false } });

    const secret = generateTOTPSecret();
    const base32Secret = base32Encode(Buffer.from(secret, 'hex'));

    // Store encrypted secret
    await prisma.totpSecret.create({
      data: { userId, secret: encrypt(secret) },
    });

    const otpauthUrl = `otpauth://totp/Anchor:${email}?secret=${base32Secret}&issuer=Anchor%20Security&algorithm=SHA1&digits=6&period=30`;

    return reply.send({ secret: base32Secret, otpauthUrl, qrData: otpauthUrl });
  });

  // POST /mfa/verify - Verify TOTP code to complete setup
  app.post('/mfa/verify', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as unknown as Record<string, unknown>).user as { userId: string };
    const { code } = request.body as { code: string };

    if (!code || code.length !== 6) {
      return reply.status(400).send({ error: 'Invalid code format' });
    }

    const totp = await prisma.totpSecret.findUnique({ where: { userId } });
    if (!totp) {
      return reply.status(404).send({ error: 'MFA not set up. Call POST /mfa/setup first.' });
    }

    const decryptedSecret = decrypt(totp.secret);
    if (!verifyTOTP(decryptedSecret, code)) {
      return reply.status(401).send({ error: 'Invalid verification code' });
    }

    await prisma.totpSecret.update({ where: { userId }, data: { verified: true } });

    return reply.send({ success: true, message: 'MFA enabled successfully' });
  });

  // POST /mfa/validate - Validate TOTP code during login flow
  app.post('/mfa/validate', async (request, reply) => {
    const { userId, code } = request.body as { userId: string; code: string };

    if (!userId || !code || code.length !== 6) {
      return reply.status(400).send({ error: 'userId and 6-digit code required' });
    }

    const totp = await prisma.totpSecret.findUnique({ where: { userId } });
    if (!totp || !totp.verified) {
      return reply.status(404).send({ error: 'MFA not enabled for this user' });
    }

    const decryptedSecret = decrypt(totp.secret);
    if (!verifyTOTP(decryptedSecret, code)) {
      return reply.status(401).send({ error: 'Invalid code' });
    }

    // Issue full JWT token after MFA validation
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(404).send({ error: 'User not found' });

    const token = app.jwt.sign(
      { userId: user.id, email: user.email, orgId: user.orgId, role: user.role },
      { expiresIn: '7d' }
    );

    return reply.send({ token, mfaVerified: true });
  });

  // DELETE /mfa/disable - Disable MFA for current user
  app.delete('/mfa/disable', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as unknown as Record<string, unknown>).user as { userId: string };
    const { code } = request.body as { code: string };

    // Require valid TOTP code to disable
    const totp = await prisma.totpSecret.findUnique({ where: { userId } });
    if (!totp || !totp.verified) {
      return reply.status(404).send({ error: 'MFA is not enabled' });
    }

    const decryptedSecret = decrypt(totp.secret);
    if (!verifyTOTP(decryptedSecret, code)) {
      return reply.status(401).send({ error: 'Invalid code' });
    }

    await prisma.totpSecret.delete({ where: { userId } });

    return reply.send({ success: true, message: 'MFA disabled' });
  });
}
