import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';

const createProjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  owner: z.string().optional(),
  scope: z
    .object({
      domains: z.array(z.string()).optional(),
      apis: z.array(z.string()).optional(),
      mobileBuilds: z.array(z.string()).optional(),
    })
    .optional(),
});

const defaultScope = {
  domains: [],
  apis: [],
  mobileBuilds: [],
};

const mapScanStatus = (status: string) => {
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'FAILED') return 'Failed';
  return 'In Progress';
};

const mapProject = (project: any) => {
  const scans = project.scans ?? [];
  const findings = project.findings ?? [];
  const activeScans = scans.filter((scan: any) => scan.status !== 'COMPLETED' && scan.status !== 'FAILED');

  const runHistory = scans.map((scan: any) => ({
    id: scan.id,
    date: new Date(scan.createdAt).toISOString(),
    result: scan.status === 'COMPLETED' ? `${scan.findingsCount} Findings` : 'In Progress...',
    findings: scan.findingsCount,
    status: mapScanStatus(scan.status),
  }));

  return {
    id: project.id,
    name: project.name,
    owner: project.owner ?? 'Unassigned',
    totalScans: scans.length,
    activeScans: activeScans.length,
    findingsCount: findings.length,
    scope: project.scope ?? defaultScope,
    runHistory,
  };
};

export async function projectRoutes(app: FastifyInstance): Promise<void> {
  app.get('/projects', { preHandler: authMiddleware() }, async (request) => {
    const user = (request as any).user;
    const projects = await prisma.project.findMany({
      where: { orgId: user.orgId },
      orderBy: { createdAt: 'desc' },
      include: { findings: true, scans: true },
    });
    return { projects: projects.map(mapProject) };
  });

  app.post('/projects', { preHandler: authMiddleware() }, async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const project = await prisma.project.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        owner: parsed.data.owner ?? 'Unassigned',
        scope: parsed.data.scope ?? defaultScope,
        orgId: (request as any).user.orgId,
      },
      include: { findings: true, scans: true },
    });

    return reply.status(201).send({ project: mapProject(project) });
  });
}
