import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const createFindingSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(3),
  type: z.string().min(3).optional(),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  description: z.string().min(5),
  guidance: z.string().min(5).optional(),
  reproduction: z.string().min(5).optional(),
  filePath: z.string().optional(),
  lineNumber: z.number().int().optional(),
});

export async function findingRoutes(app: FastifyInstance): Promise<void> {
  app.get('/findings', async (request) => {
    const projectId = (request.query as { projectId?: string }).projectId;
    const where = projectId ? { projectId } : undefined;
    const findings = await prisma.finding.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    });
    return { findings };
  });

  app.post('/findings', async (request, reply) => {
    const parsed = createFindingSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const finding = await prisma.finding.create({
      data: {
        projectId: parsed.data.projectId,
        title: parsed.data.title,
        type: parsed.data.type ?? parsed.data.title,
        severity: parsed.data.severity,
        description: parsed.data.description,
        guidance: parsed.data.guidance ?? 'Follow secure coding best practices and verify inputs are sanitized.',
        reproduction: parsed.data.reproduction ?? 'Reproduction steps not provided.',
        filePath: parsed.data.filePath,
        lineNumber: parsed.data.lineNumber,
      },
      include: { project: true },
    });
    return reply.status(201).send({ finding });
  });
}
