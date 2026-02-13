import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles } from '../lib/auth';
import { logAuditEvent } from '../lib/security';

const businessDetailsSchema = z.object({
  companyLegalName: z.string().min(1).max(300),
  companyTradingName: z.string().max(300).optional().nullable(),
  companyRegistrationNo: z.string().max(100).optional().nullable(),
  companyType: z.string().max(100).optional().nullable(),
  industry: z.string().max(200).optional().nullable(),
  companyWebsite: z.string().url().max(500).optional().nullable(),
  companyEmail: z.string().email().max(200).optional().nullable(),
  companyPhone: z.string().max(30).optional().nullable(),
  regAddress: z.string().max(500).optional().nullable(),
  regCity: z.string().max(100).optional().nullable(),
  regState: z.string().max(100).optional().nullable(),
  regPostalCode: z.string().max(20).optional().nullable(),
  regCountry: z.string().max(100).optional().nullable(),
});

const reviewSchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  rejectionReason: z.string().max(1000).optional(),
});

export async function verificationRoutes(app: FastifyInstance): Promise<void> {

  // ─── GET current org's verification status ───
  app.get('/verification', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId } = (request as any).user;

    const verification = await prisma.businessVerification.findUnique({
      where: { orgId },
    });

    return reply.send({ verification: verification || { status: 'UNVERIFIED' } });
  });

  // ─── SAVE business details as draft (without submitting for verification) ───
  app.put('/verification/save', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { userId, orgId } = (request as any).user;

    // Use a relaxed schema for drafts — companyLegalName not strictly required to save
    const draftSchema = z.object({
      companyLegalName: z.string().max(300).optional().nullable(),
      companyTradingName: z.string().max(300).optional().nullable(),
      companyRegistrationNo: z.string().max(100).optional().nullable(),
      companyType: z.string().max(100).optional().nullable(),
      industry: z.string().max(200).optional().nullable(),
      companyWebsite: z.string().max(500).optional().nullable(),
      companyEmail: z.string().max(200).optional().nullable(),
      companyPhone: z.string().max(30).optional().nullable(),
      regAddress: z.string().max(500).optional().nullable(),
      regCity: z.string().max(100).optional().nullable(),
      regState: z.string().max(100).optional().nullable(),
      regPostalCode: z.string().max(20).optional().nullable(),
      regCountry: z.string().max(100).optional().nullable(),
    });

    const parsed = draftSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const data = parsed.data;

    // Find existing verification to preserve its status
    const existing = await prisma.businessVerification.findUnique({ where: { orgId } });
    const currentStatus = existing?.status || 'UNVERIFIED';

    // Only allow saving drafts if not already PENDING/UNDER_REVIEW/VERIFIED
    // (don't overwrite data that is currently being reviewed)
    const protectedStatuses = ['PENDING', 'UNDER_REVIEW'];
    if (protectedStatuses.includes(currentStatus)) {
      return reply.status(400).send({
        error: 'Cannot modify business details while verification is under review. Please wait for the review to complete.',
      });
    }

    const verification = await prisma.businessVerification.upsert({
      where: { orgId },
      create: {
        orgId,
        status: 'UNVERIFIED',
        ...data,
      },
      update: {
        ...data,
        // Keep existing status (UNVERIFIED, REJECTED, or VERIFIED) — don't change it
      },
    });

    logAuditEvent({
      userId,
      orgId,
      action: 'BUSINESS_DETAILS_SAVED',
      resource: 'verification',
      resourceId: verification.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
      details: { companyName: data.companyLegalName },
    });

    return reply.send({
      verification,
      message: 'Business details saved successfully.',
    });
  });

  // ─── SUBMIT business details for verification ───
  app.post('/verification/submit', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { userId, orgId } = (request as any).user;

    const parsed = businessDetailsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const data = parsed.data;

    const verification = await prisma.businessVerification.upsert({
      where: { orgId },
      create: {
        orgId,
        status: 'PENDING',
        submittedAt: new Date(),
        ...data,
      },
      update: {
        status: 'PENDING',
        submittedAt: new Date(),
        reviewedAt: null,
        reviewedBy: null,
        rejectionReason: null,
        ...data,
      },
    });

    logAuditEvent({
      userId,
      orgId,
      action: 'BUSINESS_VERIFICATION_SUBMITTED',
      resource: 'verification',
      resourceId: verification.id,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
      details: { companyName: data.companyLegalName },
    });

    return reply.send({
      verification: {
        id: verification.id,
        status: verification.status,
        companyLegalName: verification.companyLegalName,
        submittedAt: verification.submittedAt,
      },
      message: 'Business verification submitted. We will review your details and get back to you.',
    });
  });

  // ─── ADMIN: List all pending verifications ───
  app.get('/verification/admin/pending', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    // In a multi-tenant SaaS, this would be a super-admin route.
    // For now, show all pending verifications to admin users.
    const verifications = await prisma.businessVerification.findMany({
      where: {
        status: { in: ['PENDING', 'UNDER_REVIEW'] },
      },
      include: {
        org: {
          select: { id: true, name: true, subscription: { select: { planTier: true, status: true } } },
        },
      },
      orderBy: { submittedAt: 'asc' },
    });

    return reply.send({ verifications });
  });

  // ─── ADMIN: Review a verification ───
  app.post('/verification/admin/:verificationId/review', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { userId, orgId } = (request as any).user;
    const { verificationId } = request.params as { verificationId: string };

    const parsed = reviewSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { status, rejectionReason } = parsed.data;

    const verification = await prisma.businessVerification.findUnique({
      where: { id: verificationId },
      include: { org: { include: { subscription: true } } },
    });

    if (!verification) {
      return reply.status(404).send({ error: 'Verification not found' });
    }

    const updateData: any = {
      status,
      reviewedAt: new Date(),
      reviewedBy: userId,
    };

    if (status === 'VERIFIED') {
      updateData.verifiedAt = new Date();
      updateData.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    } else if (status === 'REJECTED') {
      updateData.rejectionReason = rejectionReason || 'Details could not be verified';
    }

    const updated = await prisma.businessVerification.update({
      where: { id: verificationId },
      data: updateData,
    });

    // If VERIFIED and on Pro+ plan, auto-issue a customer badge
    if (status === 'VERIFIED' && verification.org.subscription) {
      const proPlans = ['PRO', 'TEAM', 'BUSINESS', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT'];
      if (proPlans.includes(verification.org.subscription.planTier)) {
        // Check if org already has an active badge
        const existingBadge = await prisma.customerBadge.findFirst({
          where: { orgId: verification.orgId, status: 'ACTIVE' },
        });

        if (!existingBadge) {
          const crypto = await import('crypto');
          const timestamp = Date.now().toString(36);
          const random = crypto.randomBytes(8).toString('hex');
          const badgeCode = `ANCHOR-${timestamp}-${random}`.toUpperCase();
          const secretKey = crypto.randomBytes(32).toString('hex');

          const backendUrl = process.env.BACKEND_URL || 'https://api.anchoraiguard.com';

          const badgeType = verification.org.subscription.planTier === 'ENTERPRISE' || verification.org.subscription.planTier === 'ENTERPRISE_PLUS'
            ? 'ENTERPRISE'
            : verification.org.subscription.planTier === 'GOVERNMENT'
              ? 'GOVERNMENT'
              : 'PROTECTED';

          await prisma.customerBadge.create({
            data: {
              badgeCode,
              orgId: verification.orgId,
              type: badgeType as any,
              status: 'ACTIVE',
              secretKey,
              planTier: verification.org.subscription.planTier,
              verificationUrl: `${backendUrl}/api/badges/verify/${badgeCode}`,
              imageUrl: `${backendUrl}/api/badges/${badgeCode}/image`,
              embedCode: `<!-- Anchor Security Badge -->\n<a href="${backendUrl}/api/badges/verify/${badgeCode}" target="_blank" rel="noopener noreferrer">\n  <img src="${backendUrl}/api/badges/${badgeCode}/image" alt="Protected by Anchor Security" style="height: 50px;">\n</a>`,
              expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }

    logAuditEvent({
      userId,
      orgId,
      action: status === 'VERIFIED' ? 'BUSINESS_VERIFIED' : 'BUSINESS_REJECTED',
      resource: 'verification',
      resourceId: verificationId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
      details: { status, rejectionReason },
    });

    return reply.send({
      verification: updated,
      message: status === 'VERIFIED'
        ? 'Business verified successfully. Badge issued if eligible.'
        : `Verification rejected: ${rejectionReason || 'Details could not be verified'}`,
    });
  });

  // ─── GET org's customer badges ───
  app.get('/verification/badges', { preHandler: authMiddleware() }, async (request, reply) => {
    const { orgId } = (request as any).user;

    const badges = await prisma.customerBadge.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });

    return reply.send({ badges });
  });

  // ─── PUBLIC: Verify a badge (no auth required) ───
  app.get('/badges/verify/:badgeCode', async (request, reply) => {
    const { badgeCode } = request.params as { badgeCode: string };

    const badge = await prisma.customerBadge.findUnique({
      where: { badgeCode },
      include: {
        org: {
          select: { name: true },
        },
      },
    });

    if (!badge) {
      return reply.status(404).send({
        verified: false,
        error: 'Badge not found',
        message: 'This protection badge could not be verified. It may be invalid or revoked.',
      });
    }

    // Check expiry
    if (badge.expiresAt < new Date() && badge.status === 'ACTIVE') {
      await prisma.customerBadge.update({
        where: { id: badge.id },
        data: { status: 'EXPIRED' },
      });
      badge.status = 'EXPIRED';
    }

    // Increment verification count
    await prisma.customerBadge.update({
      where: { id: badge.id },
      data: {
        verificationCount: { increment: 1 },
        lastVerifiedAt: new Date(),
      },
    });

    const crypto = await import('crypto');
    const signature = crypto.createHmac('sha256', badge.secretKey)
      .update(badge.badgeCode)
      .digest('hex')
      .substring(0, 16);

    return reply.send({
      verified: badge.status === 'ACTIVE',
      badge: {
        id: badge.badgeCode,
        type: badge.type,
        status: badge.status,
        organization: badge.org.name,
        protectedSince: badge.issuedAt,
        validUntil: badge.expiresAt,
        verificationSignature: signature,
        securityFeatures: {
          plan: badge.planTier,
          securityScore: badge.securityScore,
          complianceFrameworks: badge.complianceFrameworks,
        },
      },
      verifiedAt: new Date(),
      verificationCount: badge.verificationCount + 1,
      message: badge.status === 'ACTIVE'
        ? 'This organization is actively protected by Anchor Security Platform.'
        : `This protection badge is currently ${badge.status}.`,
    });
  });

  // ─── PUBLIC: Badge SVG image ───
  app.get('/badges/:badgeCode/image', async (request, reply) => {
    const { badgeCode } = request.params as { badgeCode: string };
    const { size = 'medium' } = request.query as { size?: string };

    const badge = await prisma.customerBadge.findUnique({
      where: { badgeCode },
      include: { org: { select: { name: true } } },
    });

    if (!badge) {
      const notFoundSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="50" viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="50" rx="6" fill="#1a1a2e" stroke="#ef4444" stroke-width="1.5"/>
  <text x="90" y="30" font-family="system-ui, sans-serif" font-size="12" fill="#ef4444" text-anchor="middle">Badge Not Verified</text>
</svg>`;
      reply.header('Content-Type', 'image/svg+xml');
      reply.header('Cache-Control', 'public, max-age=60');
      return reply.send(notFoundSvg);
    }

    const sizes: Record<string, { width: number; height: number; fontSize: number }> = {
      small: { width: 120, height: 40, fontSize: 10 },
      medium: { width: 200, height: 56, fontSize: 12 },
      large: { width: 260, height: 70, fontSize: 14 },
    };
    const { width, height, fontSize } = sizes[size] || sizes.medium;

    const colors: Record<string, { accent: string }> = {
      PROTECTED: { accent: '#8b5cf6' },
      CERTIFIED: { accent: '#10b981' },
      ENTERPRISE: { accent: '#f59e0b' },
      GOVERNMENT: { accent: '#ef4444' },
      REALTIME: { accent: '#06b6d4' },
    };
    const accent = colors[badge.type]?.accent || '#8b5cf6';
    const statusText = badge.status === 'ACTIVE' ? 'VERIFIED' : badge.status;

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0f0f1a"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${width}" height="${height}" rx="8" fill="url(#bg)" stroke="${accent}" stroke-width="1.5"/>
  <g transform="translate(12, ${height / 2 - 12})">
    <path d="M12 0L24 6V14C24 20.627 18.627 24 12 26C5.373 24 0 20.627 0 14V6L12 0Z" fill="${accent}" filter="url(#glow)"/>
    <path d="M10 13L8 11L7 12L10 15L17 8L16 7L10 13Z" fill="white"/>
  </g>
  <text x="44" y="${height / 2 - 5}" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">Protected by Anchor</text>
  <text x="44" y="${height / 2 + 10}" font-family="system-ui,-apple-system,sans-serif" font-size="${fontSize - 2}" fill="${accent}">${badge.type} • ${statusText}</text>
  ${badge.status === 'ACTIVE' ? `<circle cx="${width - 16}" cy="16" r="5" fill="#10b981"><animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></circle>` : ''}
</svg>`;

    reply.header('Content-Type', 'image/svg+xml');
    reply.header('Cache-Control', 'public, max-age=300');
    return reply.send(svg);
  });
}
