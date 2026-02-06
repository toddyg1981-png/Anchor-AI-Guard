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
      host: `localhost:${env.port}`,
      schemes: ['http'],
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
    reply.status(500).send({ error: 'Internal Server Error' });
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
