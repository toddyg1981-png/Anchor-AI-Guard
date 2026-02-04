import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { scanForVulnerabilities, runSBOMScan } from '../lib/sbom';

const scanSBOMSchema = z.object({
  projectId: z.string(),
  targetPath: z.string(),
});

export async function sbomRoutes(app: FastifyInstance): Promise<void> {
  // Get SBOM for a project
  app.get('/sbom/:projectId', { preHandler: authMiddleware() }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { orgId } = (request as any).user;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const sbom = await prisma.sBOM.findUnique({
      where: { projectId },
    });

    if (!sbom) {
      return reply.status(404).send({ error: 'SBOM not found. Run a scan first.' });
    }

    return reply.send({
      sbom: {
        id: sbom.id,
        projectId: sbom.projectId,
        components: sbom.components,
        totalDependencies: sbom.totalDependencies,
        directDependencies: sbom.directDependencies,
        transitiveDependencies: sbom.transitiveDependencies,
        generatedAt: sbom.generatedAt,
      },
    });
  });

  // Generate/refresh SBOM and scan for vulnerabilities
  app.post('/sbom/scan', { preHandler: authMiddleware() }, async (request, reply) => {
    const parsed = scanSBOMSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { projectId, targetPath } = parsed.data;
    const { orgId } = (request as any).user;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    try {
      const result = await runSBOMScan(projectId, targetPath);

      return reply.status(201).send({
        message: 'SBOM scan completed',
        sbom: {
          totalDependencies: result.sbom.totalDependencies,
          directDependencies: result.sbom.directDependencies,
          transitiveDependencies: result.sbom.transitiveDependencies,
        },
        vulnerabilities: {
          total: result.vulnerabilities.reduce((acc, r) => acc + r.vulnerabilities.length, 0),
          critical: result.vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'CRITICAL').length,
            0
          ),
          high: result.vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'HIGH').length,
            0
          ),
          medium: result.vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'MEDIUM').length,
            0
          ),
          low: result.vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'LOW').length,
            0
          ),
        },
        findingsCreated: result.findingsCreated,
      });
    } catch (error) {
      return reply.status(500).send({
        error: error instanceof Error ? error.message : 'SBOM scan failed',
      });
    }
  });

  // Get vulnerability report for a project
  app.get('/sbom/:projectId/vulnerabilities', { preHandler: authMiddleware() }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { orgId } = (request as any).user;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    // Get SBOM
    const sbom = await prisma.sBOM.findUnique({
      where: { projectId },
    });

    if (!sbom) {
      return reply.status(404).send({ error: 'SBOM not found. Run a scan first.' });
    }

    // Scan components for vulnerabilities
    const components = (sbom.components as any[]).map((c) => ({
      name: c.name,
      version: c.version,
      type: c.type,
      purl: c.purl,
      licenses: c.licenses || [],
      direct: c.direct,
    }));

    const vulnerabilities = await scanForVulnerabilities({
      components,
      totalDependencies: sbom.totalDependencies,
      directDependencies: sbom.directDependencies,
      transitiveDependencies: sbom.transitiveDependencies,
      generatedAt: sbom.generatedAt.toISOString(),
    });

    return reply.send({
      projectId,
      scanDate: sbom.generatedAt,
      summary: {
        totalComponents: sbom.totalDependencies,
        vulnerableComponents: vulnerabilities.length,
        totalVulnerabilities: vulnerabilities.reduce((acc, r) => acc + r.vulnerabilities.length, 0),
        bySeverity: {
          critical: vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'CRITICAL').length,
            0
          ),
          high: vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'HIGH').length,
            0
          ),
          medium: vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'MEDIUM').length,
            0
          ),
          low: vulnerabilities.reduce(
            (acc, r) => acc + r.vulnerabilities.filter((v) => v.severity === 'LOW').length,
            0
          ),
        },
      },
      vulnerabilities,
    });
  });

  // Export SBOM in CycloneDX format
  app.get('/sbom/:projectId/export', { preHandler: authMiddleware() }, async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const { format = 'json' } = request.query as { format?: string };
    const { orgId } = (request as any).user;

    // Verify project belongs to org
    const project = await prisma.project.findFirst({
      where: { id: projectId, orgId },
    });

    if (!project) {
      return reply.status(404).send({ error: 'Project not found' });
    }

    const sbom = await prisma.sBOM.findUnique({
      where: { projectId },
    });

    if (!sbom) {
      return reply.status(404).send({ error: 'SBOM not found. Run a scan first.' });
    }

    const components = sbom.components as any[];

    // Generate CycloneDX format
    const cyclonedx = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:${sbom.id}`,
      version: 1,
      metadata: {
        timestamp: sbom.generatedAt.toISOString(),
        tools: [
          {
            vendor: 'Anchor Security',
            name: 'Anchor SBOM Generator',
            version: '1.0.0',
          },
        ],
        component: {
          type: 'application',
          name: project.name,
          version: '1.0.0',
        },
      },
      components: components.map((c) => ({
        type: 'library',
        name: c.name,
        version: c.version,
        purl: c.purl,
        licenses: c.licenses?.map((l: string) => ({ license: { id: l } })) || [],
      })),
    };

    if (format === 'xml') {
      reply.header('Content-Type', 'application/xml');
      reply.header('Content-Disposition', `attachment; filename="${project.name}-sbom.xml"`);
      // In production, use a proper XML serializer
      return reply.send(`<?xml version="1.0" encoding="UTF-8"?>
<bom xmlns="http://cyclonedx.org/schema/bom/1.5" version="1">
  <metadata>
    <timestamp>${sbom.generatedAt.toISOString()}</timestamp>
  </metadata>
  <components>
    ${components.map((c) => `<component type="library"><name>${c.name}</name><version>${c.version}</version><purl>${c.purl}</purl></component>`).join('\n    ')}
  </components>
</bom>`);
    }

    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', `attachment; filename="${project.name}-sbom.json"`);
    return reply.send(cyclonedx);
  });
}
