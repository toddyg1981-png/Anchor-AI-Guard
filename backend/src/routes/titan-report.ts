/**
 * TITAN Report API Routes
 * 
 * Provides endpoints to:
 * - GET  /api/titan-report/preview   — Download/preview the report HTML
 * - GET  /api/titan-report/metrics   — Raw metrics JSON
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware, Roles } from '../lib/auth';
import { generateTitanReport } from '../services/titan-report';

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
