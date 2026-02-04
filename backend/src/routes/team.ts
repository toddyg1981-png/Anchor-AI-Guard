import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles, hasPermission } from '../lib/auth';

const updateMemberSchema = z.object({
  role: z.enum(['admin', 'member', 'viewer']),
});

export async function teamRoutes(app: FastifyInstance): Promise<void> {
  // Get all team members
  app.get('/team', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId, role } = (request as any).user;

    if (!hasPermission(role, 'team:view')) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }

    const members = await prisma.user.findMany({
      where: { orgId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const invites = await prisma.invite.findMany({
      where: { orgId, acceptedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return reply.send({ members, invites });
  });

  // Update team member role
  app.patch('/team/:userId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { orgId, role: currentUserRole, userId: currentUserId } = (request as any).user;

    const parsed = updateMemberSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    // Can't change your own role
    if (userId === currentUserId) {
      return reply.status(400).send({ error: 'Cannot change your own role' });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, orgId },
    });

    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Only owner can change admin roles
    if (targetUser.role === Roles.OWNER) {
      return reply.status(403).send({ error: 'Cannot change owner role' });
    }

    if (targetUser.role === Roles.ADMIN && currentUserRole !== Roles.OWNER) {
      return reply.status(403).send({ error: 'Only owner can modify admin roles' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role: parsed.data.role },
      select: { id: true, email: true, name: true, role: true },
    });

    return reply.send({ member: updated });
  });

  // Remove team member
  app.delete('/team/:userId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { orgId, role: currentUserRole, userId: currentUserId } = (request as any).user;

    // Can't remove yourself
    if (userId === currentUserId) {
      return reply.status(400).send({ error: 'Cannot remove yourself from team' });
    }

    const targetUser = await prisma.user.findFirst({
      where: { id: userId, orgId },
    });

    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Can't remove owner
    if (targetUser.role === Roles.OWNER) {
      return reply.status(403).send({ error: 'Cannot remove organization owner' });
    }

    // Only owner can remove admins
    if (targetUser.role === Roles.ADMIN && currentUserRole !== Roles.OWNER) {
      return reply.status(403).send({ error: 'Only owner can remove admins' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return reply.status(204).send();
  });

  // Cancel invite
  app.delete('/team/invite/:inviteId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { inviteId } = request.params as { inviteId: string };
    const { orgId } = (request as any).user;

    const invite = await prisma.invite.findFirst({
      where: { id: inviteId, orgId },
    });

    if (!invite) {
      return reply.status(404).send({ error: 'Invite not found' });
    }

    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return reply.status(204).send();
  });

  // Get organization details
  app.get('/organization', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId } = (request as any).user;

    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }

    return reply.send({
      organization: {
        id: org.id,
        name: org.name,
        createdAt: org.createdAt,
        memberCount: org._count.members,
        projectCount: org._count.projects,
      },
    });
  });

  // Update organization
  app.patch('/organization', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { orgId } = (request as any).user;
    const { name } = request.body as { name?: string };

    if (!name || name.length < 1 || name.length > 100) {
      return reply.status(400).send({ error: 'Invalid organization name' });
    }

    const org = await prisma.organization.update({
      where: { id: orgId },
      data: { name },
    });

    return reply.send({
      organization: {
        id: org.id,
        name: org.name,
      },
    });
  });
}
