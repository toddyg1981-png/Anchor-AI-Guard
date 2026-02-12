/**
 * TITAN Report API Routes
 * 
 * Provides endpoints to:
 * - GET  /api/titan-report/preview   — Download/preview the report HTML
 * - POST /api/titan-report/send      — Trigger immediate report delivery
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware, Roles } from '../lib/auth';
import { sendTitanDailyReport, generateTitanReport } from '../services/titan-report';

export async function titanReportRoutes(app: FastifyInstance) {

  /**
   * GET /titan-report/preview
   * Returns the full HTML report for browser viewing / print-to-PDF.
   * Requires admin authentication.
   */
  app.get('/titan-report/preview', {
    preHandler: [authMiddleware(Roles.ADMIN)],
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const { html } = generateTitanReport();
    reply.type('text/html').send(html);
  });

  /**
   * POST /titan-report/send
   * Triggers an immediate report delivery via email.
   * Requires admin authentication.
   */
  app.post('/titan-report/send', {
    preHandler: [authMiddleware(Roles.ADMIN)],
  }, async (_request: FastifyRequest, _reply: FastifyReply) => {
    const result = await sendTitanDailyReport();
    return {
      success: result.success,
      recipient: result.recipient,
      summary: {
        totalThreats: result.metrics.threats.total,
        newThreats24h: result.metrics.threats.newInPeriod,
        totalRules: result.metrics.rules.total,
        newRules24h: result.metrics.rules.newInPeriod,
        engineStatus: result.metrics.engine.isRunning ? 'online' : 'offline',
        competitiveScore: result.metrics.intelligence.competitiveScore,
      },
    };
  });

  /**
   * GET /titan-report/metrics
   * Returns raw metrics JSON (for dashboards / integrations).
   * Requires admin authentication.
   */
  app.get('/titan-report/metrics', {
    preHandler: [authMiddleware(Roles.ADMIN)],
  }, async (_request: FastifyRequest, _reply: FastifyReply) => {
    const { metrics } = generateTitanReport();
    return metrics;
  });
}
