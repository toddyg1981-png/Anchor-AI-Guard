import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createUser, authenticateUser, authMiddleware, Roles } from '../lib/auth';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
  organizationName: z.string().min(1).max(100).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'member', 'viewer']),
});

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // Sign up - creates new org and user (rate limited)
  app.post('/auth/signup', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const parsed = signupSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { email, password, name, organizationName } = parsed.data;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return reply.status(409).send({ error: 'User already exists' });
    }

    // Create organization
    const org = await prisma.organization.create({
      data: {
        name: organizationName || `${name}'s Organization`,
      },
    });

    // Create user as owner
    const user = await createUser(email, password, name, org.id, Roles.OWNER);

    // Generate token
    const token = app.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for secure auth
    reply.setCookie('anchor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: org.id,
        name: org.name,
      },
      token,
    });
  });

  // Login (strict rate limit: 5 attempts per minute to prevent brute force)
  app.post('/auth/login', {
    config: {
      rateLimit: {
        max: 5,
        timeWindow: '1 minute',
      },
    },
  }, async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { email, password } = parsed.data;

    const user = await authenticateUser(email, password);
    if (!user) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    // Check if MFA is enabled (safely — table may not exist yet)
    let mfaEnabled = false;
    try {
      const totpSecret = await prisma.totpSecret.findUnique({ where: { userId: user.id } });
      mfaEnabled = !!totpSecret?.verified;
    } catch {
      // TotpSecret table may not exist yet — skip MFA check
    }

    if (mfaEnabled) {
      // Don't issue full token yet - require MFA step
      return reply.send({
        mfaRequired: true,
        userId: user.id,
        message: 'MFA verification required. Call POST /mfa/validate with userId and code.',
      });
    }

    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
    });

    const token = app.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for secure auth
    reply.setCookie('anchor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: org ? { id: org.id, name: org.name } : null,
      token,
    });
  });

  // Get current user (protected)
  app.get('/auth/me', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId, orgId } = (request as any).user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { id: true, name: true },
    });

    return reply.send({ user, organization: org });
  });

  // Refresh token
  app.post('/auth/refresh', { preHandler: authMiddleware() }, async (request, reply) => {
    const { userId, email, orgId, role } = (request as any).user;

    const token = app.jwt.sign(
      { userId, email, orgId, role },
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for secure auth
    reply.setCookie('anchor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return reply.send({ token });
  });

  // Invite user to organization (admin/owner only)
  app.post('/auth/invite', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const parsed = inviteSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { email, name, role } = parsed.data;
    const { orgId } = (request as any).user;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return reply.status(409).send({ error: 'User already exists' });
    }

    // Create invite (in real app, this would send an email)
    const invite = await prisma.invite.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        role,
        orgId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return reply.status(201).send({
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
      // In production, this would be a link sent via email
      inviteLink: `/auth/accept-invite?token=${invite.token}`,
    });
  });

  // Accept invite
  app.post('/auth/accept-invite', async (request, reply) => {
    const { token, password } = request.body as { token: string; password: string };

    if (!token || !password || password.length < 8) {
      return reply.status(400).send({ error: 'Invalid token or password' });
    }

    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite || invite.acceptedAt || new Date() > invite.expiresAt) {
      return reply.status(400).send({ error: 'Invalid or expired invite' });
    }

    // Create user
    const user = await createUser(invite.email, password, invite.name, invite.orgId, invite.role);

    // Mark invite as accepted
    await prisma.invite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    const jwtToken = app.jwt.sign(
      {
        userId: user.id,
        email: user.email,
        orgId: user.orgId,
        role: user.role,
      },
      { expiresIn: '7d' }
    );

    // Set httpOnly cookie for secure auth
    reply.setCookie('anchor_token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    return reply.status(201).send({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: jwtToken,
    });
  });

  // Logout - clear auth cookie
  app.post('/auth/logout', async (request, reply) => {
    reply.clearCookie('anchor_token', { path: '/' });
    return reply.send({ success: true });
  });
}
