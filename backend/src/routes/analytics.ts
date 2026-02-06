import { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma';

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  // Get video view count
  app.get('/analytics/video-views', async () => {
    let stats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      stats = await prisma.siteStats.create({
        data: { id: 'global', videoViews: 0, pageViews: 0 },
      });
    }

    return { views: stats.videoViews };
  });

  // Increment video view count (stricter rate limit to prevent abuse)
  app.post('/analytics/video-view', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
  }, async () => {
    const stats = await prisma.siteStats.upsert({
      where: { id: 'global' },
      update: { videoViews: { increment: 1 } },
      create: { id: 'global', videoViews: 1, pageViews: 0 },
    });

    return { views: stats.videoViews };
  });

  // Get page view count
  app.get('/analytics/page-views', async () => {
    let stats = await prisma.siteStats.findUnique({
      where: { id: 'global' },
    });

    if (!stats) {
      stats = await prisma.siteStats.create({
        data: { id: 'global', videoViews: 0, pageViews: 0 },
      });
    }

    return { views: stats.pageViews };
  });

  // Increment page view count (stricter rate limit to prevent abuse)
  app.post('/analytics/page-view', {
    config: {
      rateLimit: {
        max: 10,
        timeWindow: '1 minute',
      },
    },
  }, async () => {
    const stats = await prisma.siteStats.upsert({
      where: { id: 'global' },
      update: { pageViews: { increment: 1 } },
      create: { id: 'global', videoViews: 0, pageViews: 1 },
    });

    return { views: stats.pageViews };
  });
}
