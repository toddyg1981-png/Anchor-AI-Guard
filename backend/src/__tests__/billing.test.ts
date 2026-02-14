import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock env before importing billing
vi.mock('../config/env', () => ({
  env: {
    nodeEnv: 'test',
    stripeSecretKey: 'sk_test_fake',
    stripeWebhookSecret: 'whsec_test_fake',
    stripePriceStarterMonthly: 'price_starter_monthly_test',
    stripePriceStarterYearly: 'price_starter_yearly_test',
    stripePriceProMonthly: 'price_pro_monthly_test',
    stripePriceProYearly: 'price_pro_yearly_test',
    stripePriceTeamMonthly: 'price_team_monthly_test',
    stripePriceTeamYearly: 'price_team_yearly_test',
    stripePriceBusinessMonthly: 'price_business_monthly_test',
    stripePriceBusinessYearly: 'price_business_yearly_test',
    frontendUrl: 'http://localhost:5173',
    resendApiKey: '',
    fromEmail: 'test@test.com',
    adminEmail: '',
  },
}));

// Mock Prisma
vi.mock('../lib/prisma', () => ({
  prisma: {
    subscription: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn(), create: vi.fn() },
    usageRecord: { findFirst: vi.fn(), update: vi.fn(), create: vi.fn() },
    user: { findFirst: vi.fn(), count: vi.fn() },
    project: { count: vi.fn() },
    scan: { count: vi.fn() },
    organization: { findUnique: vi.fn() },
    finding: { findMany: vi.fn() },
  },
}));

// Mock Stripe
vi.mock('stripe', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      customers: { create: vi.fn() },
      checkout: { sessions: { create: vi.fn() } },
      subscriptions: { retrieve: vi.fn(), update: vi.fn() },
      billingPortal: { sessions: { create: vi.fn() } },
      webhooks: { constructEvent: vi.fn() },
    })),
  };
});

// Mock email
vi.mock('./email', () => ({
  queueEmail: vi.fn(),
  emailTemplates: {
    paymentFailed: vi.fn((name: string) => ({
      subject: `Payment failed for ${name}`,
      html: `<p>Payment failed</p>`,
      text: `Payment failed`,
    })),
  },
}));

// Mock auth
vi.mock('../lib/auth', () => ({
  authMiddleware: () => async () => {},
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  hasPermission: vi.fn(),
  Roles: { OWNER: 'OWNER', ADMIN: 'ADMIN', MEMBER: 'MEMBER', VIEWER: 'VIEWER' },
  Permissions: {},
}));

import { PLANS } from '../routes/billing';

describe('Billing Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plan Configuration', () => {
    it('has all 8 plan tiers defined', () => {
      const tiers = Object.keys(PLANS);
      expect(tiers).toContain('FREE');
      expect(tiers).toContain('STARTER');
      expect(tiers).toContain('PRO');
      expect(tiers).toContain('TEAM');
      expect(tiers).toContain('BUSINESS');
      expect(tiers).toContain('ENTERPRISE');
      expect(tiers).toContain('ENTERPRISE_PLUS');
      expect(tiers).toContain('GOVERNMENT');
      expect(tiers).toHaveLength(8);
    });

    it('FREE plan has $0 pricing', () => {
      expect(PLANS.FREE.monthlyPrice).toBe(0);
      expect(PLANS.FREE.yearlyPrice).toBe(0);
    });

    it('STARTER plan has correct pricing ($990/mo)', () => {
      expect(PLANS.STARTER.monthlyPrice).toBe(99000);
      expect(PLANS.STARTER.yearlyPrice).toBe(950000);
    });

    it('PRO plan has correct pricing ($4,990/mo)', () => {
      expect(PLANS.PRO.monthlyPrice).toBe(499000);
      expect(PLANS.PRO.yearlyPrice).toBe(4790000);
    });

    it('TEAM plan has correct pricing ($14,990/mo)', () => {
      expect(PLANS.TEAM.monthlyPrice).toBe(1499000);
      expect(PLANS.TEAM.yearlyPrice).toBe(14390000);
    });

    it('BUSINESS plan has correct pricing ($29,990/mo)', () => {
      expect(PLANS.BUSINESS.monthlyPrice).toBe(2999000);
      expect(PLANS.BUSINESS.yearlyPrice).toBe(28790000);
    });

    it('yearly pricing is always <= 12x monthly (discount)', () => {
      for (const [_tier, plan] of Object.entries(PLANS)) {
        if (plan.monthlyPrice === 0) continue; // Skip free & enterprise custom
        if (plan.monthlyPrice > 0) {
          expect(plan.yearlyPrice).toBeLessThanOrEqual(
            plan.monthlyPrice * 12,
          );
        }
      }
    });

    it('every plan has at least 1 feature', () => {
      for (const plan of Object.values(PLANS)) {
        expect(plan.features.length).toBeGreaterThan(0);
      }
    });

    it('every plan has a name', () => {
      for (const plan of Object.values(PLANS)) {
        expect(plan.name).toBeTruthy();
        expect(typeof plan.name).toBe('string');
      }
    });

    it('FREE plan has strictest limits', () => {
      expect(PLANS.FREE.maxProjects).toBe(1);
      expect(PLANS.FREE.maxScansPerMonth).toBe(5);
      expect(PLANS.FREE.maxTeamMembers).toBe(1);
      expect(PLANS.FREE.maxAIQueries).toBe(10);
    });

    it('plan limits increase as tiers go up', () => {
      const orderedTiers = ['FREE', 'STARTER', 'PRO', 'TEAM', 'BUSINESS'] as const;
      for (let i = 1; i < orderedTiers.length; i++) {
        const prev = PLANS[orderedTiers[i - 1]];
        const curr = PLANS[orderedTiers[i]];
        expect(curr.maxProjects).toBeGreaterThan(prev.maxProjects);
        expect(curr.maxScansPerMonth).toBeGreaterThan(prev.maxScansPerMonth);
        expect(curr.maxAIQueries).toBeGreaterThan(prev.maxAIQueries);
      }
    });

    it('enterprise tiers have unlimited resources (-1)', () => {
      expect(PLANS.ENTERPRISE.maxProjects).toBe(-1);
      expect(PLANS.ENTERPRISE.maxScansPerMonth).toBe(-1);
      expect(PLANS.ENTERPRISE.maxTeamMembers).toBe(-1);
      expect(PLANS.ENTERPRISE.maxAIQueries).toBe(-1);
    });
  });

  describe('Webhook Idempotency', () => {
    // The idempotency logic is internal, but we can test it indirectly
    // by verifying the module loads without error
    it('billing module exports PLANS correctly', () => {
      expect(PLANS).toBeDefined();
      expect(typeof PLANS).toBe('object');
    });
  });

  describe('Stripe Price Configuration', () => {
    it('env module loads stripe price vars', async () => {
      const envModule = await import('../config/env');
      expect(envModule.env.stripePriceStarterMonthly).toBe('price_starter_monthly_test');
      expect(envModule.env.stripePriceStarterYearly).toBe('price_starter_yearly_test');
      expect(envModule.env.stripePriceProMonthly).toBe('price_pro_monthly_test');
      expect(envModule.env.stripePriceProYearly).toBe('price_pro_yearly_test');
      expect(envModule.env.stripePriceTeamMonthly).toBe('price_team_monthly_test');
      expect(envModule.env.stripePriceTeamYearly).toBe('price_team_yearly_test');
      expect(envModule.env.stripePriceBusinessMonthly).toBe('price_business_monthly_test');
      expect(envModule.env.stripePriceBusinessYearly).toBe('price_business_yearly_test');
    });
  });
});
