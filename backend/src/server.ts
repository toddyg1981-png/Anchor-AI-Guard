import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
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
import { wsManager } from './lib/websocket';

async function main() {
  const app = Fastify({
    logger: true,
    // 10MB to support file-upload scanning
    bodyLimit: 10485760,
  });

  await app.register(cors, {
    origin: env.corsOrigin,
    credentials: true,
  });

  await app.register(jwt, { secret: env.jwtSecret });

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

  await app.register(swaggerUI, { routePrefix: '/docs' });

  // Register routes
  app.register(healthRoutes, { prefix: '/api' });
  app.register(authRoutes, { prefix: '/api' });
  app.register(oauthRoutes, { prefix: '/api' });
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

    reply.status(error.statusCode || 500).send({ error: error.statusCode ? error.message : 'Internal Server Error' });
  });

  await app.listen({ port: env.port, host: '0.0.0.0' });
  
  // Initialize WebSocket server
  wsManager.initialize(app.server);
  app.log.info(`Anchor backend running on http://localhost:${env.port}`);
  app.log.info(`WebSocket server available at ws://localhost:${env.port}/ws`);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
