import { FastifyRequest, FastifyReply } from 'fastify';

import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  orgId: string;
  role: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  orgId: string;
  role: string;
  iat: number;
  exp: number;
}

// Secure password hashing using bcrypt
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Support legacy SHA-256 hashes (salt:hash format) for migration
  if (stored.includes(':') && !stored.startsWith('$2')) {
    const { createHash } = await import('crypto');
    const [salt, storedHash] = stored.split(':');
    if (!salt || !storedHash) return false;
    const hash = createHash('sha256').update(salt + password).digest('hex');
    return hash === storedHash;
  }
  return bcrypt.compare(password, stored);
}

export async function createUser(
  email: string,
  password: string,
  name: string,
  orgId: string,
  role: string = 'member'
) {
  const { prisma } = await import('./prisma');
  const passwordHash = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      name,
      orgId,
      passwordHash,
      role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId,
    role: user.role,
  };
}

export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  const { prisma } = await import('./prisma');
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.passwordHash) {
    return null;
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return null;
  }

  // Auto-migrate legacy SHA-256 hashes to bcrypt on successful login
  if (user.passwordHash.includes(':') && !user.passwordHash.startsWith('$2')) {
    const { prisma } = await import('./prisma');
    const newHash = await hashPassword(password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId,
    role: user.role,
  };
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const { prisma } = await import('./prisma');
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId,
    role: user.role,
  };
}

// Fastify authentication decorator
export function authMiddleware(requireRole?: string | string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const decoded = await request.jwtVerify<JWTPayload>();
      
      // Attach user to request
      (request as unknown as { user: { userId: string; email: string; orgId: string; role: string } }).user = {
        userId: decoded.userId,
        email: decoded.email,
        orgId: decoded.orgId,
        role: decoded.role,
      };

      // Check role if required
      if (requireRole) {
        const roles = Array.isArray(requireRole) ? requireRole : [requireRole];
        if (!roles.includes(decoded.role)) {
          return reply.status(403).send({ error: 'Insufficient permissions' });
        }
      }
    } catch (err) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
  };
}

// Role definitions
export const Roles = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

// Permission matrix
export const Permissions = {
  // Project permissions
  'project:create': [Roles.OWNER, Roles.ADMIN],
  'project:read': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER, Roles.VIEWER],
  'project:update': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER],
  'project:delete': [Roles.OWNER, Roles.ADMIN],
  
  // Finding permissions
  'finding:read': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER, Roles.VIEWER],
  'finding:update': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER],
  'finding:delete': [Roles.OWNER, Roles.ADMIN],
  
  // Scan permissions
  'scan:run': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER],
  'scan:read': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER, Roles.VIEWER],
  
  // Team permissions
  'team:manage': [Roles.OWNER, Roles.ADMIN],
  'team:view': [Roles.OWNER, Roles.ADMIN, Roles.MEMBER, Roles.VIEWER],
  
  // Integration permissions
  'integration:manage': [Roles.OWNER, Roles.ADMIN],
} as const;

export function hasPermission(role: string, permission: keyof typeof Permissions): boolean {
  const allowedRoles = Permissions[permission];
  return (allowedRoles as readonly string[]).includes(role);
}
