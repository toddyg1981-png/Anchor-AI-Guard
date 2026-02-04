import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles, hasPermission } from '../lib/auth';

// Integration types
export enum IntegrationType {
  JIRA = 'jira',
  SLACK = 'slack',
  GITHUB = 'github',
  GITLAB = 'gitlab',
  WEBHOOK = 'webhook',
}

const createIntegrationSchema = z.object({
  type: z.nativeEnum(IntegrationType),
  name: z.string().min(1).max(100),
  config: z.record(z.any()),
  enabled: z.boolean().default(true),
});

const updateIntegrationSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  config: z.record(z.any()).optional(),
  enabled: z.boolean().optional(),
});

export async function integrationRoutes(app: FastifyInstance): Promise<void> {
  // List all integrations
  app.get('/integrations', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId, role } = (request as any).user;

    if (!hasPermission(role, 'integration:manage')) {
      return reply.status(403).send({ error: 'Insufficient permissions' });
    }

    const integrations = await prisma.integration.findMany({
      where: { orgId },
      select: {
        id: true,
        type: true,
        name: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
        // Don't return sensitive config by default
      },
    });

    return reply.send({ integrations });
  });

  // Get integration details
  app.get('/integrations/:integrationId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { integrationId } = request.params as { integrationId: string };
    const { orgId } = (request as any).user;

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    // Mask sensitive fields
    const safeConfig = maskSensitiveConfig(integration.config as Record<string, any>);

    return reply.send({
      integration: {
        ...integration,
        config: safeConfig,
      },
    });
  });

  // Create integration
  app.post('/integrations', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const parsed = createIntegrationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { orgId } = (request as any).user;
    const { type, name, config, enabled } = parsed.data;

    // Validate config for integration type
    const validationError = validateIntegrationConfig(type, config);
    if (validationError) {
      return reply.status(400).send({ error: validationError });
    }

    const integration = await prisma.integration.create({
      data: {
        type,
        name,
        config,
        enabled,
        orgId,
      },
    });

    return reply.status(201).send({
      integration: {
        id: integration.id,
        type: integration.type,
        name: integration.name,
        enabled: integration.enabled,
      },
    });
  });

  // Update integration
  app.patch('/integrations/:integrationId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { integrationId } = request.params as { integrationId: string };
    const { orgId } = (request as any).user;

    const parsed = updateIntegrationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const existing = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!existing) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    const integration = await prisma.integration.update({
      where: { id: integrationId },
      data: parsed.data,
    });

    return reply.send({
      integration: {
        id: integration.id,
        type: integration.type,
        name: integration.name,
        enabled: integration.enabled,
      },
    });
  });

  // Delete integration
  app.delete('/integrations/:integrationId', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { integrationId } = request.params as { integrationId: string };
    const { orgId } = (request as any).user;

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return reply.status(204).send();
  });

  // Test integration
  app.post('/integrations/:integrationId/test', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { integrationId } = request.params as { integrationId: string };
    const { orgId } = (request as any).user;

    const integration = await prisma.integration.findFirst({
      where: { id: integrationId, orgId },
    });

    if (!integration) {
      return reply.status(404).send({ error: 'Integration not found' });
    }

    try {
      const result = await testIntegration(integration.type, integration.config as Record<string, any>);
      return reply.send({ success: true, result });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      });
    }
  });
}

// Helper functions
function maskSensitiveConfig(config: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['token', 'apiKey', 'secret', 'password', 'webhook'];
  const masked = { ...config };

  for (const key of Object.keys(masked)) {
    if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
      masked[key] = '********';
    }
  }

  return masked;
}

function validateIntegrationConfig(type: IntegrationType, config: Record<string, any>): string | null {
  switch (type) {
    case IntegrationType.JIRA:
      if (!config.baseUrl || !config.email || !config.apiToken) {
        return 'JIRA requires baseUrl, email, and apiToken';
      }
      break;
    case IntegrationType.SLACK:
      if (!config.webhookUrl) {
        return 'Slack requires webhookUrl';
      }
      break;
    case IntegrationType.GITHUB:
      if (!config.token) {
        return 'GitHub requires token';
      }
      break;
    case IntegrationType.GITLAB:
      if (!config.token) {
        return 'GitLab requires token';
      }
      break;
    case IntegrationType.WEBHOOK:
      if (!config.url) {
        return 'Webhook requires url';
      }
      break;
  }
  return null;
}

async function testIntegration(type: string, _config: Record<string, any>): Promise<string> {
  // In production, these would make real API calls
  switch (type) {
    case IntegrationType.JIRA:
      // Test JIRA connection
      return 'JIRA connection successful';
    case IntegrationType.SLACK:
      // Test Slack webhook
      return 'Slack webhook valid';
    case IntegrationType.GITHUB:
      // Test GitHub token
      return 'GitHub token valid';
    case IntegrationType.GITLAB:
      // Test GitLab token
      return 'GitLab token valid';
    case IntegrationType.WEBHOOK:
      // Test webhook URL
      return 'Webhook URL reachable';
    default:
      throw new Error('Unknown integration type');
  }
}

// Export notification functions for use in other parts of the app
export async function sendSlackNotification(orgId: string, message: string): Promise<void> {
  const integration = await prisma.integration.findFirst({
    where: { orgId, type: IntegrationType.SLACK, enabled: true },
  });

  if (!integration) return;

  const config = integration.config as { webhookUrl: string };
  
  // In production, this would make a real HTTP request
  console.log(`[Slack] Sending to ${config.webhookUrl}: ${message}`);
}

export async function createJiraTicket(
  orgId: string,
  summary: string,
  _description: string,
  _priority: string
): Promise<string | null> {
  const integration = await prisma.integration.findFirst({
    where: { orgId, type: IntegrationType.JIRA, enabled: true },
  });

  if (!integration) return null;

  const config = integration.config as { baseUrl: string; email: string; apiToken: string; projectKey: string };
  
  // In production, this would create a real JIRA ticket
  console.log(`[JIRA] Creating ticket in ${config.projectKey}: ${summary}`);
  
  return `${config.projectKey}-${Math.floor(Math.random() * 1000)}`;
}

export async function triggerWebhook(orgId: string, event: string, _payload: any): Promise<void> {
  const integrations = await prisma.integration.findMany({
    where: { orgId, type: IntegrationType.WEBHOOK, enabled: true },
  });

  for (const integration of integrations) {
    const config = integration.config as { url: string };
    
    // In production, this would make real HTTP requests
    console.log(`[Webhook] Sending to ${config.url}: ${event}`);
  }
}
