import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { runScan, failScan } from '../lib/scanEngine';

const createScanSchema = z.object({
  projectId: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
});

const runScanSchema = z.object({
  projectId: z.string().min(1),
  targetPath: z.string().min(1),
});

export async function scanRoutes(app: FastifyInstance): Promise<void> {
  app.get('/scans', async (request) => {
    const projectId = (request.query as { projectId?: string }).projectId;
    const where = projectId ? { projectId } : undefined;
    const scans = await prisma.scan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { project: true },
    });
    return { scans };
  });

  app.post('/scans', async (request, reply) => {
    const parsed = createScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const scan = await prisma.scan.create({
      data: {
        projectId: parsed.data.projectId,
        status: 'QUEUED',
        progress: parsed.data.progress ?? 0,
      },
    });

    return reply.status(201).send({ scan });
  });

  app.post('/scans/run', async (request, reply) => {
    const parsed = runScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { projectId, targetPath } = parsed.data;

    const scan = await prisma.scan.create({
      data: {
        projectId,
        status: 'QUEUED',
        progress: 0,
      },
    });

    setTimeout(async () => {
      try {
        await runScan({ projectId, targetPath });
      } catch (error) {
        await failScan(scan.id, projectId, error instanceof Error ? error.message : 'Unknown error');
      }
    }, 100);

    return reply.status(202).send({ scanId: scan.id, status: 'QUEUED' });
  });
}
