import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles } from '../lib/auth';

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  // Get organization stats
  app.get('/admin/stats', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { orgId } = (request as any).user;

    const [
      totalProjects,
      totalScans,
      totalFindings,
      criticalFindings,
      fixedFindings,
      teamMembers,
    ] = await Promise.all([
      prisma.project.count({ where: { orgId } }),
      prisma.scan.count({ where: { project: { orgId } } }),
      prisma.finding.count({ where: { project: { orgId } } }),
      prisma.finding.count({ where: { project: { orgId }, severity: 'CRITICAL' } }),
      prisma.finding.count({ where: { project: { orgId }, status: 'FIXED' } }),
      prisma.user.count({ where: { orgId } }),
    ]);

    return reply.send({
      stats: {
        totalProjects,
        totalScans,
        totalFindings,
        criticalFindings,
        fixedFindings,
        teamMembers,
      },
    });
  });

  // Get audit logs
  app.get('/admin/audit-logs', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { orgId } = (request as any).user;
    const { limit = '50', offset = '0' } = request.query as { limit?: string; offset?: string };

    const logs = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(parseInt(limit, 10) || 50, 100),
      skip: parseInt(offset, 10) || 0,
    });

    const total = await prisma.auditLog.count({ where: { orgId } });

    return reply.send({ logs, total });
  });
}
