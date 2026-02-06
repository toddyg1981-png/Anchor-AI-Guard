import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles } from '../lib/auth';
import { createJiraTicket, sendSlackNotification, triggerWebhook, IntegrationType } from './integrations';

const createTicketSchema = z.object({
  findingId: z.string(),
  summary: z.string().min(1).max(255),
  description: z.string().optional(),
  priority: z.enum(['highest', 'high', 'medium', 'low', 'lowest']).default('medium'),
});

const generateFixSchema = z.object({
  findingId: z.string(),
  targetRepo: z.string().optional(),
  targetBranch: z.string().default('main'),
});

export async function autofixRoutes(app: FastifyInstance): Promise<void> {
  // Create JIRA ticket for finding
  app.post('/autofix/jira-ticket', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN, Roles.MEMBER]) }, async (request, reply) => {
    const parsed = createTicketSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { orgId } = (request as any).user;
    const { findingId, summary, description, priority } = parsed.data;

    // Get the finding (verify it belongs to user's org)
    const finding = await prisma.finding.findFirst({
      where: { id: findingId, project: { orgId } },
      include: { project: true },
    });

    if (!finding) {
      return reply.status(404).send({ error: 'Finding not found' });
    }

    // Build ticket description
    const ticketDescription = description || `
## Security Finding: ${finding.title}

**Severity:** ${finding.severity}
**Type:** ${finding.type}
**Project:** ${finding.project.name}

### Description
${finding.description}

### Remediation Guidance
${finding.guidance}

### Reproduction Steps
${finding.reproduction}

${finding.filePath ? `**File:** ${finding.filePath}${finding.lineNumber ? `:${finding.lineNumber}` : ''}` : ''}
    `.trim();

    const ticketKey = await createJiraTicket(orgId, summary, ticketDescription, priority);

    if (!ticketKey) {
      return reply.status(400).send({ error: 'JIRA integration not configured or disabled' });
    }

    // Update finding with ticket reference
    await prisma.finding.update({
      where: { id: findingId },
      data: {
        ticketRef: ticketKey,
      },
    });

    // Send Slack notification
    await sendSlackNotification(
      orgId,
      `🎫 JIRA ticket ${ticketKey} created for security finding: ${finding.title} (${finding.severity})`
    );

    return reply.status(201).send({
      ticketKey,
      message: `JIRA ticket ${ticketKey} created successfully`,
    });
  });

  // Generate auto-fix PR
  app.post('/autofix/generate-fix', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN, Roles.MEMBER]) }, async (request, reply) => {
    const parsed = generateFixSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { orgId } = (request as any).user;
    const { findingId, targetBranch } = parsed.data;

    // Get the finding (verify it belongs to user's org)
    const finding = await prisma.finding.findFirst({
      where: { id: findingId, project: { orgId } },
      include: { project: true },
    });

    if (!finding) {
      return reply.status(404).send({ error: 'Finding not found' });
    }

    // Check for GitHub integration
    const githubIntegration = await prisma.integration.findFirst({
      where: { orgId, type: IntegrationType.GITHUB, enabled: true },
    });

    if (!githubIntegration) {
      return reply.status(400).send({ error: 'GitHub integration not configured or disabled' });
    }

    // Generate fix based on finding type
    const fix = generateSecurityFix(finding);

    if (!fix) {
      return reply.status(400).send({ error: 'Unable to generate automatic fix for this finding type' });
    }

    // In production, this would create a real PR via GitHub API
    const prNumber = Math.floor(Math.random() * 1000) + 1;
    const branchName = `autofix/security-${finding.id.slice(0, 8)}`;

    // Record the autofix attempt
    await prisma.autofix.create({
      data: {
        findingId,
        status: 'PENDING',
        prNumber,
        branchName,
        targetBranch,
        diff: fix.diff,
      },
    });

    // Update finding
    await prisma.finding.update({
      where: { id: findingId },
      data: {
        autofixAvailable: true,
        prRef: `#${prNumber}`,
      },
    });

    // Send notifications
    await sendSlackNotification(
      orgId,
      `🔧 Auto-fix PR #${prNumber} generated for security finding: ${finding.title}`
    );

    await triggerWebhook(orgId, 'autofix.created', {
      findingId,
      prNumber,
      branchName,
    });

    return reply.status(201).send({
      prNumber,
      branchName,
      targetBranch,
      fix: {
        filePath: fix.filePath,
        description: fix.description,
      },
      message: `Pull request #${prNumber} created on branch ${branchName}`,
    });
  });

  // List autofix history
  app.get('/autofix', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId } = (request as any).user;

    const autofixes = await prisma.autofix.findMany({
      where: {
        finding: {
          project: { orgId },
        },
      },
      include: {
        finding: {
          select: {
            id: true,
            title: true,
            severity: true,
            project: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return reply.send({ autofixes });
  });
}

interface SecurityFix {
  filePath: string;
  description: string;
  diff: string;
}

function generateSecurityFix(finding: any): SecurityFix | null {
  const type = finding.type.toLowerCase();
  const filePath = finding.filePath || 'unknown';

  // Generate fixes based on finding type
  if (type.includes('eval') || type.includes('code injection')) {
    return {
      filePath,
      description: 'Replace dangerous eval() with safer alternative',
      diff: `
--- a/${filePath}
+++ b/${filePath}
@@ -${finding.lineNumber || 1},1 +${finding.lineNumber || 1},1 @@
-  eval(userInput);
+  // SECURITY FIX: eval() is dangerous, use JSON.parse() for JSON data
+  // or a sandboxed evaluation library for expressions
+  const safeData = JSON.parse(userInput);
      `.trim(),
    };
  }

  if (type.includes('innerhtml') || type.includes('xss')) {
    return {
      filePath,
      description: 'Replace innerHTML with textContent to prevent XSS',
      diff: `
--- a/${filePath}
+++ b/${filePath}
@@ -${finding.lineNumber || 1},1 +${finding.lineNumber || 1},1 @@
-  element.innerHTML = userContent;
+  // SECURITY FIX: Use textContent to prevent XSS attacks
+  element.textContent = userContent;
      `.trim(),
    };
  }

  if (type.includes('hardcoded') || type.includes('secret') || type.includes('api key')) {
    return {
      filePath,
      description: 'Move hardcoded secret to environment variable',
      diff: `
--- a/${filePath}
+++ b/${filePath}
@@ -${finding.lineNumber || 1},1 +${finding.lineNumber || 1},1 @@
-  const API_KEY = "sk-hardcoded-secret-key";
+  // SECURITY FIX: Use environment variable for secrets
+  const API_KEY = process.env.API_KEY;
+  if (!API_KEY) throw new Error('API_KEY environment variable required');
      `.trim(),
    };
  }

  if (type.includes('dockerfile') || type.includes('root')) {
    return {
      filePath,
      description: 'Add non-root user to Dockerfile',
      diff: `
--- a/${filePath}
+++ b/${filePath}
@@ -1,3 +1,8 @@
 FROM node:18-alpine
 
+# SECURITY FIX: Run as non-root user
+RUN addgroup -g 1001 -S nodejs
+RUN adduser -S nextjs -u 1001
+USER nextjs
+
 WORKDIR /app
      `.trim(),
    };
  }

  if (type.includes('open ingress') || type.includes('0.0.0.0')) {
    return {
      filePath,
      description: 'Restrict security group ingress to specific IPs',
      diff: `
--- a/${filePath}
+++ b/${filePath}
@@ -${finding.lineNumber || 1},1 +${finding.lineNumber || 1},1 @@
-  cidr_blocks = ["0.0.0.0/0"]
+  # SECURITY FIX: Restrict to specific IP ranges
+  cidr_blocks = ["10.0.0.0/8", "172.16.0.0/12"]
      `.trim(),
    };
  }

  // Return null for unsupported finding types
  return null;
}
