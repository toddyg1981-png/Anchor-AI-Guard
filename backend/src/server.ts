import Fastify from 'fastify';
import cors from '@fastify/cors';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import * as Sentry from '@sentry/node';
import { env } from './config/env';
import { healthRoutes } from './routes/health';
import { projectRoutes } from './routes/projects';
import { findingRoutes } from './routes/findings';
import { scanRoutes } from './routes/scans';
import { authRoutes } from './routes/auth';
import { teamRoutes } from './routes/team';
import { integrationRoutes } from './routes/integrations';
import { autofixRoutes } from './routes/autofix';
import { sbomRoutes } from './routes/sbom';
import { billingRoutes } from './routes/billing';
import { oauthRoutes } from './routes/oauth';
import { emailRoutes } from './routes/email';
import { analyticsRoutes } from './routes/analytics';
import { aiRoutes } from './routes/ai';
import { threatIntelRoutes } from './routes/threat-intel';
import { complianceRoutes } from './routes/compliance';
import { socRoutes } from './routes/soc';
import { attackSurfaceRoutes } from './routes/attack-surface';
import { aiGuardrailsRoutes } from './routes/ai-guardrails';
import { vulnerabilityIntelRoutes } from './routes/vuln-intel';
import { digitalTwinRoutes } from './routes/digital-twin';
import { quantumCryptoRoutes } from './routes/quantum-crypto';
import { supplyChainRoutes } from './routes/supply-chain';
import { breachSimRoutes } from './routes/breach-sim';
import { selfProtectionRoutes } from './routes/self-protection';
import { deceptionRoutes, regulatoryIntelRoutes, nationalSecurityRoutes } from './routes/deception-national';
import { securityModulesRoutes } from './routes/security-modules';
import { badgeRoutes } from './routes/badges';
import { aiEvolutionRoutes, startEvolutionEngine, stopEvolutionEngine } from './routes/ai-evolution';
import endpointProtectionRoutes from './routes/endpoint-protection';
import anchorIntelligenceRoutes from './routes/anchor-intelligence';
import { profileRoutes } from './routes/profile';
import { verificationRoutes } from './routes/verification';
import { adminRoutes } from './routes/admin';
import { mfaRoutes } from './routes/mfa';
import { ssoRoutes } from './routes/sso';
import { aiChatRoutes } from './routes/ai-chat';
import { ipBlockingMiddleware, securityHeaders, logAuditEvent } from './lib/security';
import { wsManager } from './lib/websocket';
import { registerMonitoring } from './lib/monitoring';
import { startTitanReportScheduler, stopTitanReportScheduler } from './services/titan-report';
import { titanReportRoutes } from './routes/titan-report';

async function main() {
  // Initialize Sentry for error tracking
  if (env.sentryDsn) {
    Sentry.init({
      dsn: env.sentryDsn,
      environment: env.nodeEnv,
      tracesSampleRate: env.nodeEnv === 'production' ? 0.1 : 1.0,
    });
  }

  const app = Fastify({
    logger: true,
    // 10MB to support file-upload scanning
    bodyLimit: 10485760,
  });

  // Register monitoring middleware (request timing, error rates, alerting)
  registerMonitoring(app);

  // Add rawBody for Stripe webhook signature verification
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      (req as any).rawBody = body;
      done(null, json);
    } catch (err) {
      done(err as Error, undefined);
    }
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", env.frontendUrl],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
  });

  // IP blocking hook for blocked IPs
  app.addHook('onRequest', ipBlockingMiddleware());
  
  // Security headers hook
  app.addHook('onSend', securityHeaders());

  // Global rate limiting - 100 requests per minute per IP
  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
  });

  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  });

  // Cookie support for httpOnly JWT
  await app.register(cookie, {
    secret: env.jwtSecret, // signs the cookie
  });

  await app.register(jwt, {
    secret: env.jwtSecret,
    cookie: {
      cookieName: 'anchor_token',
      signed: false,
    },
  });

  await app.register(swagger, {
    swagger: {
      info: {
        title: 'Anchor Security API',
        description: 'Backend API for Anchor Security Dashboard',
        version: '1.0.0',
      },
      host: env.nodeEnv === 'production' ? env.backendUrl.replace(/^https?:\/\//, '') : `localhost:${env.port}`,
      schemes: env.nodeEnv === 'production' ? ['https'] : ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        Bearer: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  // Only expose Swagger UI in non-production environments
  if (env.nodeEnv !== 'production') {
    await app.register(swaggerUI, { routePrefix: '/docs' });
  }

  // Register routes
  app.register(healthRoutes, { prefix: '/api' });
  app.register(authRoutes, { prefix: '/api' });
  app.register(mfaRoutes, { prefix: '/api' });
  app.register(oauthRoutes, { prefix: '/api' });
  app.register(ssoRoutes, { prefix: '/api' });
  app.register(emailRoutes, { prefix: '/api' });
  app.register(billingRoutes, { prefix: '/api' });
  app.register(projectRoutes, { prefix: '/api' });
  app.register(findingRoutes, { prefix: '/api' });
  app.register(scanRoutes, { prefix: '/api' });
  app.register(teamRoutes, { prefix: '/api' });
  app.register(integrationRoutes, { prefix: '/api' });
  app.register(autofixRoutes, { prefix: '/api' });
  app.register(sbomRoutes, { prefix: '/api' });
  app.register(analyticsRoutes, { prefix: '/api' });
  app.register(aiRoutes, { prefix: '/api' });

  // AI Chat & Help Desk
  app.register(aiChatRoutes, { prefix: '/api' });
  
  // World-first feature routes
  app.register(threatIntelRoutes, { prefix: '/api' });
  app.register(complianceRoutes, { prefix: '/api' });
  app.register(socRoutes, { prefix: '/api' });
  app.register(attackSurfaceRoutes, { prefix: '/api' });
  app.register(aiGuardrailsRoutes, { prefix: '/api' });
  app.register(vulnerabilityIntelRoutes, { prefix: '/api' });
  app.register(digitalTwinRoutes, { prefix: '/api' });
  app.register(quantumCryptoRoutes, { prefix: '/api' });
  app.register(supplyChainRoutes, { prefix: '/api' });
  app.register(breachSimRoutes, { prefix: '/api' });
  app.register(selfProtectionRoutes, { prefix: '/api' });
  app.register(deceptionRoutes, { prefix: '/api' });
  app.register(regulatoryIntelRoutes, { prefix: '/api' });
  app.register(nationalSecurityRoutes, { prefix: '/api' });
  app.register(securityModulesRoutes, { prefix: '/api' });
  
  // Customer protection badge system
  app.register(badgeRoutes, { prefix: '/api' });
  
  // AI Self-Evolution Engine - keeps Anchor ahead of threats
  app.register(aiEvolutionRoutes, { prefix: '/api' });
  
  // Endpoint Detection & Response (EDR) - device protection
  app.register(endpointProtectionRoutes, { prefix: '/api' });

  // Anchor Intelligence — B2B AI-as-a-Service Platform
  app.register(anchorIntelligenceRoutes, { prefix: '/api' });

  // User Profile & Bank Details
  app.register(profileRoutes, { prefix: '/api' });

  // Business Verification & Customer Badges
  app.register(verificationRoutes, { prefix: '/api' });

  // Admin Stats & Audit Logs
  app.register(adminRoutes, { prefix: '/api' });

  // TITAN Daily Report (preview, send, metrics)
  app.register(titanReportRoutes, { prefix: '/api' });

  app.get('/', async () => ({ status: 'ok', service: 'anchor-backend' }));

  // Root health endpoint for Railway healthcheck
  app.get('/health', async () => ({ status: 'ok', service: 'anchor-backend' }));

  app.setErrorHandler((error, request, reply) => {
    request.log.error(error);

    // Zod validation errors
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Validation error', details: error });
    }

    // Prisma known errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as any;
      if (prismaError.code === 'P2002') {
        return reply.status(409).send({ error: 'Resource already exists' });
      }
      if (prismaError.code === 'P2025') {
        return reply.status(404).send({ error: 'Resource not found' });
      }
      return reply.status(400).send({ error: 'Database error' });
    }

    // JWT errors
    if (error.statusCode === 401 || error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    // Rate limit errors
    if (error.statusCode === 429) {
      return reply.status(429).send({ error: 'Too many requests. Please slow down.' });
    }

    // Capture unexpected errors in Sentry
    if (!error.statusCode || error.statusCode >= 500) {
      Sentry.captureException(error);
    }

    reply.status(error.statusCode || 500).send({ error: error.statusCode ? error.message : 'Internal Server Error' });
  });

  await app.listen({ port: env.port, host: '0.0.0.0' });
  
  // Initialize WebSocket server
  wsManager.initialize(app.server);
  
  // Start AI Evolution Engine for continuous security updates
  startEvolutionEngine();
  
  // Start TITAN daily report scheduler (06:00 AEST daily)
  startTitanReportScheduler();
  
  app.log.info(`Anchor backend running on http://localhost:${env.port}`);
  app.log.info(`WebSocket server available at ws://localhost:${env.port}/ws`);
  app.log.info(`AI Evolution Engine active - continuously monitoring threats`);
  app.log.info(`TITAN Daily Report scheduler active — reports sent at 06:00 AEST`);

  // Graceful shutdown on SIGTERM/SIGINT (container restarts, deploys)
  const gracefulShutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      stopEvolutionEngine();
      stopTitanReportScheduler();
      wsManager.shutdown?.();
      await app.close();
      app.log.info('Server closed successfully');
    } catch (err) {
      app.log.error('Error during shutdown:', err);
    }
    process.exit(0);
  };
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
