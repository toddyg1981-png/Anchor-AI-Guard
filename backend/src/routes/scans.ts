import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { runScan, runGithubScan, runUploadScan, runSnippetScan, failScan } from '../lib/scanEngine';

const createScanSchema = z.object({
  projectId: z.string().min(1),
  progress: z.number().int().min(0).max(100).optional(),
});

const runScanSchema = z.object({
  projectId: z.string().min(1),
  targetPath: z.string().min(1),
});

const githubScanSchema = z.object({
  projectId: z.string().min(1),
  repoUrl: z.string().url().min(1),
  branch: z.string().min(1).optional().default('main'),
});

const uploadScanSchema = z.object({
  projectId: z.string().min(1),
  files: z.array(z.object({
    name: z.string().min(1),
    content: z.string(),
  })).min(1).max(500),
});

const snippetScanSchema = z.object({
  projectId: z.string().min(1),
  code: z.string().min(1).max(500000),
  filename: z.string().min(1).optional().default('snippet.ts'),
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

  // Original local-path scan
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

  // ------------------------------------------------------------------
  // GitHub repo scan — clone a public repo and scan it
  // ------------------------------------------------------------------
  app.post('/scans/github', async (request, reply) => {
    const parsed = githubScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { projectId, repoUrl, branch } = parsed.data;

    // Verify project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Create a queued scan record so the client gets an immediate response
    const queuedScan = await prisma.scan.create({
      data: { projectId, status: 'QUEUED', progress: 0 },
    });

    // Run the scan asynchronously
    setTimeout(async () => {
      try {
        await runGithubScan(projectId, repoUrl, branch);
        // Clean up the queued placeholder (the engine creates its own scan record)
        await prisma.scan.delete({ where: { id: queuedScan.id } }).catch(() => {});
      } catch (error) {
        await failScan(queuedScan.id, projectId, error instanceof Error ? error.message : 'Unknown error');
      }
    }, 100);

    return reply.status(202).send({ scanId: queuedScan.id, status: 'QUEUED', mode: 'github' });
  });

  // ------------------------------------------------------------------
  // Upload scan — accept files as JSON and scan them
  // ------------------------------------------------------------------
  app.post('/scans/upload', async (request, reply) => {
    const parsed = uploadScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { projectId, files } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const queuedScan = await prisma.scan.create({
      data: { projectId, status: 'QUEUED', progress: 0 },
    });

    setTimeout(async () => {
      try {
        await runUploadScan(projectId, files);
        await prisma.scan.delete({ where: { id: queuedScan.id } }).catch(() => {});
      } catch (error) {
        await failScan(queuedScan.id, projectId, error instanceof Error ? error.message : 'Unknown error');
      }
    }, 100);

    return reply.status(202).send({ scanId: queuedScan.id, status: 'QUEUED', mode: 'upload' });
  });

  // ------------------------------------------------------------------
  // Snippet scan — accept raw code text and scan it
  // ------------------------------------------------------------------
  app.post('/scans/snippet', async (request, reply) => {
    const parsed = snippetScanSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { projectId, code, filename } = parsed.data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const queuedScan = await prisma.scan.create({
      data: { projectId, status: 'QUEUED', progress: 0 },
    });

    setTimeout(async () => {
      try {
        await runSnippetScan(projectId, code, filename);
        await prisma.scan.delete({ where: { id: queuedScan.id } }).catch(() => {});
      } catch (error) {
        await failScan(queuedScan.id, projectId, error instanceof Error ? error.message : 'Unknown error');
      }
    }, 100);

    return reply.status(202).send({ scanId: queuedScan.id, status: 'QUEUED', mode: 'snippet' });
  });
}
