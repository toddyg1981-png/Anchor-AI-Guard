import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';

const profileUpdateSchema = z.object({
  // Personal info
  firstName: z.string().max(100).optional().nullable(),
  lastName: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  jobTitle: z.string().max(100).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  timezone: z.string().max(100).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  country: z.string().max(100).optional().nullable(),

  // Bank details
  bankName: z.string().max(200).optional().nullable(),
  bankAccountName: z.string().max(200).optional().nullable(),
  bankAccountNumber: z.string().max(50).optional().nullable(),
  bankBsb: z.string().max(20).optional().nullable(),
  bankRoutingNumber: z.string().max(50).optional().nullable(),
  bankSwiftCode: z.string().max(20).optional().nullable(),
  bankIban: z.string().max(50).optional().nullable(),
  bankCurrency: z.string().max(10).optional().nullable(),
  bankCountry: z.string().max(100).optional().nullable(),

  // Tax
  taxId: z.string().max(50).optional().nullable(),
  taxCountry: z.string().max(100).optional().nullable(),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  // Get current user's profile
  app.get('/profile', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        profile: true,
        org: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Mask sensitive fields in the response
    const profile = user.profile ? {
      ...user.profile,
      bankAccountNumber: user.profile.bankAccountNumber
        ? '****' + user.profile.bankAccountNumber.slice(-4)
        : null,
      bankBsb: user.profile.bankBsb
        ? '****' + user.profile.bankBsb.slice(-2)
        : null,
      bankRoutingNumber: user.profile.bankRoutingNumber
        ? '****' + user.profile.bankRoutingNumber.slice(-4)
        : null,
      bankIban: user.profile.bankIban
        ? '****' + user.profile.bankIban.slice(-4)
        : null,
      taxId: user.profile.taxId
        ? '****' + user.profile.taxId.slice(-4)
        : null,
    } : null;

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
        organization: user.org,
      },
      profile,
    });
  });

  // Update user info (name, avatar)
  app.patch('/profile/user', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as any).user;

    const parsed = userUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: parsed.data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });

    return reply.send({ user: updated });
  });

  // Update profile details (personal info, bank, tax)
  app.put('/profile', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as any).user;

    const parsed = profileUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    // Build the data object, handling the sensitive fields
    const data: any = { ...parsed.data };

    // For sensitive fields sent as masked values (starting with ****), skip updating them
    const sensitiveFields = ['bankAccountNumber', 'bankBsb', 'bankRoutingNumber', 'bankIban', 'taxId'];
    for (const field of sensitiveFields) {
      if (data[field] && data[field].startsWith('****')) {
        delete data[field]; // Don't overwrite with masked value
      }
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    // Return masked response
    const maskedProfile = {
      ...profile,
      bankAccountNumber: profile.bankAccountNumber
        ? '****' + profile.bankAccountNumber.slice(-4)
        : null,
      bankBsb: profile.bankBsb
        ? '****' + profile.bankBsb.slice(-2)
        : null,
      bankRoutingNumber: profile.bankRoutingNumber
        ? '****' + profile.bankRoutingNumber.slice(-4)
        : null,
      bankIban: profile.bankIban
        ? '****' + profile.bankIban.slice(-4)
        : null,
      taxId: profile.taxId
        ? '****' + profile.taxId.slice(-4)
        : null,
    };

    return reply.send({ profile: maskedProfile });
  });

  // Delete bank details
  app.delete('/profile/bank', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId } = (request as any).user;

    await prisma.userProfile.update({
      where: { userId },
      data: {
        bankName: null,
        bankAccountName: null,
        bankAccountNumber: null,
        bankBsb: null,
        bankRoutingNumber: null,
        bankSwiftCode: null,
        bankIban: null,
        bankCurrency: null,
        bankCountry: null,
      },
    });

    return reply.send({ message: 'Bank details removed' });
  });
}
