import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';
import { PlanTier } from '@prisma/client';
import { queueEmail, emailTemplates } from './email';

// Webhook idempotency — track processed event IDs to prevent duplicate processing
const processedWebhookEvents = new Set<string>();
const MAX_PROCESSED_EVENTS = 10000;

function markEventProcessed(eventId: string): boolean {
  if (processedWebhookEvents.has(eventId)) return false; // already processed
  if (processedWebhookEvents.size >= MAX_PROCESSED_EVENTS) {
    // Evict oldest entries (Sets iterate in insertion order)
    const iterator = processedWebhookEvents.values();
    for (let i = 0; i < 2000; i++) iterator.next();
    // Rebuild without the oldest 2000
    const remaining = [...processedWebhookEvents].slice(2000);
    processedWebhookEvents.clear();
    remaining.forEach(id => processedWebhookEvents.add(id));
  }
  processedWebhookEvents.add(eventId);
  return true; // first time seeing this event
}

// Initialize Stripe — warn on missing keys but don't crash in dev
if (!env.stripeSecretKey && env.nodeEnv === 'production') {
  throw new Error('STRIPE_SECRET_KEY is required in production — payments will not work without it');
}
if (!env.stripeWebhookSecret && env.nodeEnv === 'production') {
  throw new Error('STRIPE_WEBHOOK_SECRET is required in production — webhook verification will fail');
}

const stripe = new Stripe(env.stripeSecretKey || 'sk_test_placeholder', {
  apiVersion: '2023-10-16',
});

// Plan type definition
type PlanConfig = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  maxProjects: number;
  maxScansPerMonth: number;
  maxTeamMembers: number;
  maxAIQueries: number;
  features: string[];
};

// Define plan tier keys explicitly to avoid Prisma type cache issues
type PlanTierKey = 'FREE' | 'STARTER' | 'PRO' | 'TEAM' | 'BUSINESS' | 'ENTERPRISE' | 'ENTERPRISE_PLUS' | 'GOVERNMENT';

// Plan configuration - 95+ modules, 25 world-first features
export const PLANS: Record<PlanTierKey, PlanConfig> = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxProjects: 1,
    maxScansPerMonth: 5,
    maxTeamMembers: 1,
    maxAIQueries: 10,
    features: [
      '1 project',
      '5 scans/month',
      '10 AI queries/month',
      'Basic vulnerability scanning',
      'GitHub integration',
      'Community support',
    ],
  },
  STARTER: {
    name: 'Starter',
    monthlyPrice: 99000, // $990
    yearlyPrice: 950000, // $9,500 (20% off)
    maxProjects: 3,
    maxScansPerMonth: 50,
    maxTeamMembers: 1,
    maxAIQueries: 100,
    features: [
      '3 projects',
      '50 scans/month',
      '100 AI queries/month',
      'All vulnerability scanners',
      'AI Security Chat',
      'Email support',
      'Export reports (PDF)',
      'Security score badge',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 499000, // $4,990
    yearlyPrice: 4790000, // $47,900 (20% off)
    maxProjects: 10,
    maxScansPerMonth: 250,
    maxTeamMembers: 3,
    maxAIQueries: 1000,
    features: [
      '10 projects',
      '250 scans/month',
      '1,000 AI queries/month',
      '3 team members',
      'Predictive CVE Intelligence (WORLD FIRST)',
      'AI Auto-Fix with 1-click PRs',
      'Attack Path Visualization',
      'Threat Hunting Module',
      'API access',
      'Priority email support',
      'Slack integration',
    ],
  },
  TEAM: {
    name: 'Team',
    monthlyPrice: 1499000, // $14,990
    yearlyPrice: 14390000, // $143,900 (20% off)
    maxProjects: 50,
    maxScansPerMonth: 1500,
    maxTeamMembers: 15,
    maxAIQueries: 7500,
    features: [
      '50 projects',
      '1,500 scans/month',
      '7,500 AI queries/month',
      '15 team members',
      'Real-time Collaboration (WORLD FIRST)',
      'Digital Twin Security (WORLD FIRST)',
      'Autonomous SOC Access',
      'All Pro features included',
      'Team dashboard & analytics',
      'Role-based access control',
      'Full audit logs',
      'Jira & GitHub integration',
      'Priority support',
    ],
  },
  BUSINESS: {
    name: 'Business',
    monthlyPrice: 4999000, // $49,990
    yearlyPrice: 47990000, // $479,900 (20% off)
    maxProjects: 200,
    maxScansPerMonth: 10000,
    maxTeamMembers: 75,
    maxAIQueries: 50000,
    features: [
      '200 projects',
      '10,000 scans/month',
      '50,000 AI queries/month',
      '75 team members',
      'All 95+ Security Modules',
      'SSO/SAML authentication',
      'Cyber Insurance Integration (WORLD FIRST)',
      'Supply Chain Attestation (WORLD FIRST)',
      'Custom security rules',
      'Advanced threat analytics',
      'Dedicated CSM',
      'Phone & Slack support',
      '99.9% SLA',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 0, // Custom - $5M-$10M/year
    yearlyPrice: 500000000, // $5,000,000 starting
    maxProjects: -1, // unlimited
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$5,000,000 - $10,000,000/year',
      'For 100-500 developers',
      'Unlimited everything',
      'On-premise deployment option',
      'Custom AI model training',
      'Dedicated security engineer',
      '24/7/365 phone & Slack support',
      '99.95% SLA guarantee',
      'SOC 2 Type II compliance',
      'Quarterly business reviews',
      'Custom integrations',
    ],
  },
  ENTERPRISE_PLUS: {
    name: 'Enterprise+',
    monthlyPrice: 0, // Custom - $10M-$25M/year
    yearlyPrice: 1000000000, // $10,000,000 starting
    maxProjects: -1,
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$10,000,000 - $25,000,000/year',
      'For 500-2000+ developers',
      'Everything in Enterprise',
      'Multi-region deployment',
      'Custom AI model fine-tuning',
      'White-label licensing available',
      'Dedicated CSM + security team',
      'Custom API development',
      '99.99% SLA guarantee',
      'Priority feature roadmap input',
      'Executive business reviews',
      'On-site training & workshops',
    ],
  },
  GOVERNMENT: {
    name: 'Government & Defense',
    monthlyPrice: 0, // Custom - $25M-$75M+/year
    yearlyPrice: 2500000000, // $25,000,000 starting
    maxProjects: -1,
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$25,000,000 - $75,000,000+/year',
      'Federal, State & Defense',
      'National Security Module (WORLD FIRST)',
      'Critical Infrastructure Protection (WORLD FIRST)',
      'FedRAMP High Ready',
      'NIST 800-53 / CMMC Compliant',
      'ITAR/EAR Compliant',
      'Air-gapped deployment',
      'Classified environment support (TS/SCI)',
      'Security-cleared support staff',
      'Custom threat intelligence feeds',
      'Nation-state threat detection',
      'Dedicated government account team',
    ],
  },
};

// Stripe Price ID mapping — loaded from env vars (set via STRIPE_PRICE_* in .env)
const STRIPE_PRICES: Record<string, { monthly: string; yearly: string }> = {
  STARTER: {
    monthly: env.stripePriceStarterMonthly,
    yearly: env.stripePriceStarterYearly,
  },
  PRO: {
    monthly: env.stripePriceProMonthly,
    yearly: env.stripePriceProYearly,
  },
  TEAM: {
    monthly: env.stripePriceTeamMonthly,
    yearly: env.stripePriceTeamYearly,
  },
  BUSINESS: {
    monthly: env.stripePriceBusinessMonthly,
    yearly: env.stripePriceBusinessYearly,
  },
};

const createCheckoutSchema = z.object({
  planTier: z.enum(['FREE', 'STARTER', 'PRO', 'TEAM', 'BUSINESS', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const updateSubscriptionSchema = z.object({
  planTier: z.enum(['FREE', 'STARTER', 'PRO', 'TEAM', 'BUSINESS', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT']),
});

export async function billingRoutes(app: FastifyInstance): Promise<void> {
  // Get available plans
  app.get('/billing/plans', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      plans: Object.entries(PLANS).map(([tier, plan]) => ({
        tier,
        ...plan,
        monthlyPriceFormatted: `$${(plan.monthlyPrice / 100).toFixed(0)}`,
        yearlyPriceFormatted: `$${(plan.yearlyPrice / 100).toFixed(0)}`,
        yearlySavings: `$${((plan.monthlyPrice * 12 - plan.yearlyPrice) / 100).toFixed(0)}`,
      })),
    });
  });

  // Get current subscription
  app.get('/billing/subscription', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    
    const subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
      include: {
        usageRecords: {
          where: {
            periodEnd: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subscription) {
      return reply.send({
        subscription: null,
        plan: PLANS.STARTER,
        isTrialing: true,
        trialDaysRemaining: 14,
      });
    }

    const plan = PLANS[subscription.planTier as PlanTierKey];
    const now = new Date();
    const trialDaysRemaining = subscription.trialEndsAt
      ? Math.max(0, Math.ceil((subscription.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return reply.send({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        planTier: subscription.planTier,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      },
      plan,
      isTrialing: subscription.status === 'TRIALING',
      trialDaysRemaining,
      usage: subscription.usageRecords,
    });
  });

  // Create checkout session
  app.post('/billing/checkout', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = createCheckoutSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const user = request.user as { orgId: string; email: string };
    const { planTier, billingPeriod, successUrl, cancelUrl } = parsed.data;
    const _plan = PLANS[planTier];

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
    });

    let customerId: string;

    if (subscription?.stripeCustomerId) {
      customerId = subscription.stripeCustomerId;
    } else {
      const org = await prisma.organization.findUnique({
        where: { id: user.orgId },
      });

      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          orgId: user.orgId,
          orgName: org?.name || '',
        },
      });
      customerId = customer.id;

      // Create or update subscription record
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { stripeCustomerId: customerId },
        });
      } else {
        subscription = await prisma.subscription.create({
          data: {
            orgId: user.orgId,
            stripeCustomerId: customerId,
            status: 'TRIALING',
            planTier: 'STARTER',
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          },
        });
      }
    }

    // Create checkout session using Stripe Price IDs
    const stripePrices = STRIPE_PRICES[planTier];
    if (!stripePrices) {
      return reply.status(400).send({ error: `No Stripe prices configured for ${planTier}. Contact sales for Enterprise plans.` });
    }
    const priceId = billingPeriod === 'yearly' ? stripePrices.yearly : stripePrices.monthly;
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: subscription.status === 'TRIALING' ? 14 : undefined,
        metadata: {
          orgId: user.orgId,
          planTier,
        },
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        orgId: user.orgId,
        planTier,
      },
    });

    return reply.send({ sessionId: session.id, url: session.url });
  });

  // Create customer portal session
  app.post('/billing/portal', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { returnUrl: string };

    const subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
    });

    if (!subscription?.stripeCustomerId) {
      return reply.status(400).send({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: body.returnUrl?.startsWith(env.frontendUrl) ? body.returnUrl : env.frontendUrl,
    });

    return reply.send({ url: session.url });
  });

  // Update subscription (upgrade/downgrade)
  app.patch('/billing/subscription', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = updateSubscriptionSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const user = request.user as { orgId: string };
    const { planTier } = parsed.data;

    const subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
    });

    if (!subscription?.stripeSubscriptionId) {
      return reply.status(400).send({ error: 'No active subscription' });
    }

    // Get current subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);

    // Look up the Stripe Price ID for the new plan
    const stripePrices = STRIPE_PRICES[planTier];
    if (!stripePrices) {
      return reply.status(400).send({ error: `No Stripe prices configured for ${planTier}. Contact sales for Enterprise plans.` });
    }
    const currentInterval = stripeSubscription.items.data[0].price.recurring?.interval || 'month';
    const newPriceId = currentInterval === 'year' ? stripePrices.yearly : stripePrices.monthly;

    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
      metadata: {
        planTier,
      },
    });

    // Update local record
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { planTier: planTier as PlanTier },
    });

    return reply.send({ success: true, planTier });
  });

  // Cancel subscription
  app.delete('/billing/subscription', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
    });

    if (!subscription?.stripeSubscriptionId) {
      return reply.status(400).send({ error: 'No active subscription' });
    }

    // Cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });

    return reply.send({ success: true, cancelAtPeriodEnd: true });
  });

  // Stripe webhook handler
  app.post('/billing/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const sig = request.headers['stripe-signature'] as string;
    const rawBody = (request as FastifyRequest & { rawBody?: string }).rawBody;

    if (!rawBody) {
      return reply.status(400).send({ error: 'No raw body' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        env.stripeWebhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    // Idempotency check — skip already-processed events
    if (!markEventProcessed(event.id)) {
      // eslint-disable-next-line no-console
      console.info(`Webhook event ${event.id} already processed, skipping`);
      return reply.send({ received: true, duplicate: true });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        const planTier = session.metadata?.planTier as PlanTierKey;

        if (orgId && planTier) {
          // Fetch subscription details for period dates
          let periodStart: Date | undefined;
          let periodEnd: Date | undefined;
          let stripePriceId: string | undefined;
          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            periodStart = new Date(sub.current_period_start * 1000);
            periodEnd = new Date(sub.current_period_end * 1000);
            stripePriceId = sub.items.data[0]?.price?.id;
          }

          await prisma.subscription.upsert({
            where: { orgId },
            update: {
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: stripePriceId || null,
              status: 'ACTIVE',
              planTier: planTier as PlanTier,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              trialEndsAt: null,
            },
            create: {
              orgId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              stripePriceId: stripePriceId || null,
              status: 'ACTIVE',
              planTier: planTier as PlanTier,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.orgId;

        if (orgId) {
          let status: 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'UNPAID' = 'ACTIVE';
          
          switch (subscription.status) {
            case 'trialing':
              status = 'TRIALING';
              break;
            case 'active':
              status = 'ACTIVE';
              break;
            case 'past_due':
              status = 'PAST_DUE';
              break;
            case 'canceled':
              status = 'CANCELED';
              break;
            case 'unpaid':
              status = 'UNPAID';
              break;
          }

          await prisma.subscription.update({
            where: { orgId },
            data: {
              status,
              stripePriceId: subscription.items.data[0]?.price?.id || undefined,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const orgId = subscription.metadata?.orgId;

        if (orgId) {
          await prisma.subscription.update({
            where: { orgId },
            data: {
              status: 'CANCELED',
              stripeSubscriptionId: null,
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break; // Skip one-off invoices
        const failedSub = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const orgId = failedSub.metadata?.orgId;

        if (orgId) {
          await prisma.subscription.update({
            where: { orgId },
            data: { status: 'PAST_DUE' },
          });
          
          // Send payment-failed email to the org owner
          try {
            const orgOwner = await prisma.user.findFirst({
              where: { orgId, role: 'OWNER' },
            });
            if (orgOwner?.email) {
              const template = emailTemplates.paymentFailed(orgOwner.name || 'there');
              await queueEmail({
                to: orgOwner.email,
                subject: template.subject,
                html: template.html,
                text: template.text,
              });
              // eslint-disable-next-line no-console
              console.info(`Payment-failed email queued for org ${orgId} (${orgOwner.email})`);
            }
          } catch (emailErr) {
            console.error('Failed to queue payment-failed email:', emailErr);
          }
        }
        break;
      }
    }

    return reply.send({ received: true });
  });

  // Get usage stats
  app.get('/billing/usage', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const subscription = await prisma.subscription.findUnique({
      where: { orgId: user.orgId },
    });

    const plan = subscription ? PLANS[subscription.planTier as PlanTierKey] : PLANS.STARTER;

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [projectCount, scanCount, teamCount, aiQueryCount] = await Promise.all([
      prisma.project.count({ where: { orgId: user.orgId } }),
      prisma.scan.count({
        where: {
          project: { orgId: user.orgId },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count({ where: { orgId: user.orgId } }),
      getAIQueryCount(user.orgId),
    ]);

    return reply.send({
      usage: {
        projects: { used: projectCount, limit: plan.maxProjects },
        scans: { used: scanCount, limit: plan.maxScansPerMonth },
        teamMembers: { used: teamCount, limit: plan.maxTeamMembers },
        aiQueries: { used: aiQueryCount, limit: plan.maxAIQueries },
      },
      plan: {
        tier: subscription?.planTier || 'STARTER',
        name: plan.name,
      },
    });
  });
}

// ─── AI Query Usage Tracking ───────────────────────────────────────────

/**
 * Track an AI query for usage metering.
 * Call this after every successful AI query (chat, vuln-intel, threat-intel, etc.)
 */
export async function trackAIQuery(orgId: string): Promise<void> {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const subscription = await prisma.subscription.findUnique({ where: { orgId } });
    if (!subscription) return;

    // Upsert the current month's ai_queries usage record
    const existing = await prisma.usageRecord.findFirst({
      where: {
        subscriptionId: subscription.id,
        metric: 'ai_queries',
        periodStart: startOfMonth,
      },
    });

    if (existing) {
      await prisma.usageRecord.update({
        where: { id: existing.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      await prisma.usageRecord.create({
        data: {
          subscriptionId: subscription.id,
          metric: 'ai_queries',
          quantity: 1,
          periodStart: startOfMonth,
          periodEnd: endOfMonth,
        },
      });
    }
  } catch (err) {
    console.error('Failed to track AI query:', err);
  }
}

/**
 * Get the AI query count for the current billing month.
 */
async function getAIQueryCount(orgId: string): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const subscription = await prisma.subscription.findUnique({ where: { orgId } });
  if (!subscription) return 0;

  const record = await prisma.usageRecord.findFirst({
    where: {
      subscriptionId: subscription.id,
      metric: 'ai_queries',
      periodStart: startOfMonth,
    },
  });

  return record?.quantity || 0;
}
