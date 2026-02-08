/**
 * ANCHOR SECURITY PLATFORM - Customer Protection Badge System
 * 
 * This module provides embeddable security badges for customers on Pro+ plans
 * to display that their systems are actively protected by Anchor Security.
 * 
 * Features:
 * - Unique badge IDs tied to organization accounts
 * - Public verification endpoint
 * - Dynamic badge generation (SVG)
 * - Real-time protection status
 * - Tamper-proof badge verification
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { logAuditEvent } from '../lib/security';

// Badge types available
export enum BadgeType {
  PROTECTED = 'protected',           // Basic "Protected by Anchor"
  CERTIFIED = 'certified',           // Security assessment passed
  ENTERPRISE = 'enterprise',         // Enterprise tier protection
  GOVERNMENT = 'government',         // Government/Defense compliance
  REALTIME = 'realtime'              // Real-time monitoring active
}

// Badge status
export enum BadgeStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',           // Account issues
  EXPIRED = 'expired',               // Subscription lapsed
  REVOKED = 'revoked'                // Manual revocation
}

// In-memory badge store (in production, use database)
interface BadgeRecord {
  id: string;
  orgId: string;
  orgName: string;
  type: BadgeType;
  status: BadgeStatus;
  createdAt: Date;
  expiresAt: Date;
  lastVerified: Date;
  verificationCount: number;
  secretKey: string;  // For HMAC verification
  metadata: {
    plan: string;
    securityScore?: number;
    lastScan?: Date;
    complianceFrameworks?: string[];
  };
}

const badges = new Map<string, BadgeRecord>();

// Generate a unique badge ID
function generateBadgeId(): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(8).toString('hex');
  return `ANCHOR-${timestamp}-${random}`.toUpperCase();
}

// Generate badge secret key for verification
function generateBadgeSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Create HMAC signature for badge verification
function createBadgeSignature(badgeId: string, secretKey: string): string {
  return crypto.createHmac('sha256', secretKey)
    .update(badgeId)
    .digest('hex')
    .substring(0, 16);
}

// Generate SVG badge
function generateBadgeSVG(badge: BadgeRecord, size: 'small' | 'medium' | 'large' = 'medium'): string {
  const sizes = {
    small: { width: 120, height: 40, fontSize: 10 },
    medium: { width: 180, height: 50, fontSize: 12 },
    large: { width: 240, height: 60, fontSize: 14 }
  };
  
  const { width, height, fontSize } = sizes[size];
  
  const colors: Record<BadgeType, { bg: string; accent: string }> = {
    [BadgeType.PROTECTED]: { bg: '#1a1a2e', accent: '#8b5cf6' },
    [BadgeType.CERTIFIED]: { bg: '#1a1a2e', accent: '#10b981' },
    [BadgeType.ENTERPRISE]: { bg: '#1a1a2e', accent: '#f59e0b' },
    [BadgeType.GOVERNMENT]: { bg: '#1a1a2e', accent: '#ef4444' },
    [BadgeType.REALTIME]: { bg: '#1a1a2e', accent: '#06b6d4' }
  };
  
  const { bg, accent } = colors[badge.type];
  
  const statusText = badge.status === BadgeStatus.ACTIVE ? 'VERIFIED' : 'INACTIVE';
  const typeText = badge.type.toUpperCase();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0f0f1a;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="${width}" height="${height}" rx="6" fill="url(#bg-gradient)" stroke="${accent}" stroke-width="1.5"/>
  
  <!-- Shield Icon -->
  <g transform="translate(10, ${height/2 - 12})">
    <path d="M12 0L24 6V14C24 20.627 18.627 24 12 26C5.373 24 0 20.627 0 14V6L12 0Z" fill="${accent}" filter="url(#glow)"/>
    <path d="M10 13L8 11L7 12L10 15L17 8L16 7L10 13Z" fill="white"/>
  </g>
  
  <!-- Text -->
  <text x="40" y="${height/2 - 4}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="600" fill="#ffffff">
    Protected by Anchor
  </text>
  <text x="40" y="${height/2 + 10}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize - 2}" fill="${accent}">
    ${typeText} • ${statusText}
  </text>
  
  <!-- Verification indicator -->
  ${badge.status === BadgeStatus.ACTIVE ? `
  <circle cx="${width - 15}" cy="15" r="5" fill="#10b981">
    <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
  </circle>
  ` : ''}
</svg>`;
}

// Generate HTML embed code
function generateEmbedCode(badgeId: string, backendUrl: string): string {
  return `<!-- Anchor Security Badge -->
<a href="${backendUrl}/api/badges/verify/${badgeId}" target="_blank" rel="noopener noreferrer">
  <img src="${backendUrl}/api/badges/${badgeId}/image" alt="Protected by Anchor Security" style="height: 50px;">
</a>
<!-- End Anchor Security Badge -->`;
}

export async function badgeRoutes(app: FastifyInstance) {
  
  /**
   * POST /badges - Create a new badge for organization
   * Requires: Pro plan or above
   */
  app.post('/badges', { preHandler: authMiddleware() }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { type = BadgeType.PROTECTED } = request.body as { type?: BadgeType };
    
    // Verify organization has Pro+ plan
    const org = await prisma.organization.findUnique({
      where: { id: user.orgId },
      include: { subscription: true }
    });
    
    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }
    
    const planTier = org.subscription?.planTier ?? 'FREE';
    const allowedPlans = ['PRO', 'TEAM', 'BUSINESS', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT'];
    if (!allowedPlans.includes(planTier)) {
      return reply.status(403).send({ 
        error: 'Badge verification requires Pro plan or above',
        currentPlan: planTier,
        upgradeUrl: '/pricing'
      });
    }
    
    // Check if org already has a badge of this type
    const existingBadge = Array.from(badges.values()).find(
      b => b.orgId === user.orgId && b.type === type && b.status === BadgeStatus.ACTIVE
    );
    
    if (existingBadge) {
      return reply.status(409).send({ 
        error: 'Organization already has an active badge of this type',
        badgeId: existingBadge.id
      });
    }
    
    // Create new badge
    const badgeId = generateBadgeId();
    const secretKey = generateBadgeSecret();
    
    const badge: BadgeRecord = {
      id: badgeId,
      orgId: user.orgId,
      orgName: org.name,
      type: type as BadgeType,
      status: BadgeStatus.ACTIVE,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      lastVerified: new Date(),
      verificationCount: 0,
      secretKey,
      metadata: {
        plan: planTier,
        complianceFrameworks: []
      }
    };
    
    badges.set(badgeId, badge);
    
    logAuditEvent({
      userId: user.id,
      orgId: user.orgId,
      action: 'BADGE_CREATED',
      resource: 'badge',
      resourceId: badgeId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
      details: { type }
    });
    
    const backendUrl = process.env.BACKEND_URL || 'https://api.anchoraiguard.com';
    
    return {
      success: true,
      badge: {
        id: badgeId,
        type: badge.type,
        status: badge.status,
        createdAt: badge.createdAt,
        expiresAt: badge.expiresAt,
        verificationUrl: `${backendUrl}/api/badges/verify/${badgeId}`,
        imageUrl: `${backendUrl}/api/badges/${badgeId}/image`,
        embedCode: generateEmbedCode(badgeId, backendUrl)
      }
    };
  });
  
  /**
   * GET /badges - List organization's badges
   */
  app.get('/badges', { preHandler: authMiddleware() }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    const orgBadges = Array.from(badges.values())
      .filter(b => b.orgId === user.orgId)
      .map(b => ({
        id: b.id,
        type: b.type,
        status: b.status,
        createdAt: b.createdAt,
        expiresAt: b.expiresAt,
        verificationCount: b.verificationCount,
        lastVerified: b.lastVerified
      }));
    
    return { badges: orgBadges };
  });
  
  /**
   * GET /badges/verify/:badgeId - PUBLIC verification endpoint
   * Returns verification status (for embedding/display)
   */
  app.get('/badges/verify/:badgeId', async (request: FastifyRequest<{ Params: { badgeId: string } }>, reply: FastifyReply) => {
    const { badgeId } = request.params;
    const badge = badges.get(badgeId);
    
    if (!badge) {
      return reply.status(404).send({ 
        verified: false, 
        error: 'Badge not found',
        message: 'This protection badge could not be verified. It may be invalid or revoked.'
      });
    }
    
    // Check if badge is still valid
    if (badge.expiresAt < new Date()) {
      badge.status = BadgeStatus.EXPIRED;
    }
    
    // Increment verification count
    badge.verificationCount++;
    badge.lastVerified = new Date();
    
    const signature = createBadgeSignature(badgeId, badge.secretKey);
    
    // Log verification attempt
    logAuditEvent({
      orgId: badge.orgId,
      action: 'BADGE_VERIFIED',
      resource: 'badge',
      resourceId: badgeId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: badge.status === BadgeStatus.ACTIVE,
      details: { verificationCount: badge.verificationCount }
    });
    
    return {
      verified: badge.status === BadgeStatus.ACTIVE,
      badge: {
        id: badge.id,
        type: badge.type,
        status: badge.status,
        organization: badge.orgName,
        protectedSince: badge.createdAt,
        validUntil: badge.expiresAt,
        verificationSignature: signature,
        securityFeatures: {
          plan: badge.metadata.plan,
          securityScore: badge.metadata.securityScore,
          lastSecurityScan: badge.metadata.lastScan,
          complianceFrameworks: badge.metadata.complianceFrameworks
        }
      },
      verifiedAt: new Date(),
      verificationCount: badge.verificationCount,
      message: badge.status === BadgeStatus.ACTIVE 
        ? `This organization is actively protected by Anchor Security Platform.`
        : `This protection badge is currently ${badge.status}.`
    };
  });
  
  /**
   * GET /badges/:badgeId/image - Return SVG badge image
   */
  app.get('/badges/:badgeId/image', async (request: FastifyRequest<{ 
    Params: { badgeId: string },
    Querystring: { size?: 'small' | 'medium' | 'large' }
  }>, reply: FastifyReply) => {
    const { badgeId } = request.params;
    const { size = 'medium' } = request.query;
    
    const badge = badges.get(badgeId);
    
    if (!badge) {
      // Return a "not verified" badge
      const notFoundSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="180" height="50" viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="50" rx="6" fill="#1a1a2e" stroke="#ef4444" stroke-width="1.5"/>
  <text x="90" y="30" font-family="system-ui, sans-serif" font-size="12" fill="#ef4444" text-anchor="middle">
    Badge Not Verified
  </text>
</svg>`;
      
      reply.header('Content-Type', 'image/svg+xml');
      reply.header('Cache-Control', 'public, max-age=60');
      return reply.send(notFoundSvg);
    }
    
    const svg = generateBadgeSVG(badge, size);
    
    reply.header('Content-Type', 'image/svg+xml');
    reply.header('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    return reply.send(svg);
  });
  
  /**
   * PATCH /badges/:badgeId - Update badge (admin or owner only)
   */
  app.patch('/badges/:badgeId', { preHandler: authMiddleware() }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { badgeId } = request.params as { badgeId: string };
    const updates = request.body as { status?: BadgeStatus; securityScore?: number; complianceFrameworks?: string[] };
    
    const badge = badges.get(badgeId);
    
    if (!badge) {
      return reply.status(404).send({ error: 'Badge not found' });
    }
    
    if (badge.orgId !== user.orgId) {
      return reply.status(403).send({ error: 'Not authorized to modify this badge' });
    }
    
    // Apply updates
    if (updates.status) badge.status = updates.status;
    if (updates.securityScore !== undefined) badge.metadata.securityScore = updates.securityScore;
    if (updates.complianceFrameworks) badge.metadata.complianceFrameworks = updates.complianceFrameworks;
    
    logAuditEvent({
      userId: user.id,
      orgId: user.orgId,
      action: 'BADGE_UPDATED',
      resource: 'badge',
      resourceId: badgeId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true,
      details: updates
    });
    
    return { success: true, badge: { id: badge.id, status: badge.status } };
  });
  
  /**
   * DELETE /badges/:badgeId - Revoke a badge
   */
  app.delete('/badges/:badgeId', { preHandler: authMiddleware() }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    const { badgeId } = request.params as { badgeId: string };
    
    const badge = badges.get(badgeId);
    
    if (!badge) {
      return reply.status(404).send({ error: 'Badge not found' });
    }
    
    if (badge.orgId !== user.orgId) {
      return reply.status(403).send({ error: 'Not authorized to revoke this badge' });
    }
    
    badge.status = BadgeStatus.REVOKED;
    
    logAuditEvent({
      userId: user.id,
      orgId: user.orgId,
      action: 'BADGE_REVOKED',
      resource: 'badge',
      resourceId: badgeId,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      success: true
    });
    
    return { success: true, message: 'Badge revoked successfully' };
  });
  
  /**
   * GET /badges/stats - Get badge statistics (admin only)
   */
  app.get('/badges/stats', { preHandler: authMiddleware() }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = (request as any).user;
    
    // Get org badges only
    const orgBadges = Array.from(badges.values()).filter(b => b.orgId === user.orgId);
    
    const stats = {
      total: orgBadges.length,
      active: orgBadges.filter(b => b.status === BadgeStatus.ACTIVE).length,
      suspended: orgBadges.filter(b => b.status === BadgeStatus.SUSPENDED).length,
      expired: orgBadges.filter(b => b.status === BadgeStatus.EXPIRED).length,
      revoked: orgBadges.filter(b => b.status === BadgeStatus.REVOKED).length,
      totalVerifications: orgBadges.reduce((sum, b) => sum + b.verificationCount, 0),
      byType: {
        protected: orgBadges.filter(b => b.type === BadgeType.PROTECTED).length,
        certified: orgBadges.filter(b => b.type === BadgeType.CERTIFIED).length,
        enterprise: orgBadges.filter(b => b.type === BadgeType.ENTERPRISE).length,
        government: orgBadges.filter(b => b.type === BadgeType.GOVERNMENT).length,
        realtime: orgBadges.filter(b => b.type === BadgeType.REALTIME).length
      }
    };
    
    return { stats };
  });
}
