import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import Stripe from 'stripe';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Plan configuration
export const PLANS = {
  STARTER: {
    name: 'Starter',
    monthlyPrice: 7900, // $79
    yearlyPrice: 75800, // $758 (20% off)
    maxProjects: 5,
    maxScansPerMonth: 100,
    maxTeamMembers: 3,
    maxAIQueries: 500,
    features: [
      'Up to 5 projects',
      'Basic CLI scanner',
      'GitHub integration',
      'Email support',
      '100 scans/month',
      '500 AI queries/month',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    monthlyPrice: 24900, // $249
    yearlyPrice: 239000, // $2,390 (20% off)
    maxProjects: 50,
    maxScansPerMonth: 1000,
    maxTeamMembers: 25,
    maxAIQueries: 5000,
    features: [
      'Up to 50 projects',
      'All CLI scanners',
      'Attack Path Visualization',
      'AI Security Chat',
      'Predictive CVE Intelligence (WORLD FIRST)',
      'Real-time collaboration (WORLD FIRST)',
      'Priority support',
      '1,000 scans/month',
      '5,000 AI queries/month',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 0, // Custom - $50K-150K/year
    yearlyPrice: 5000000, // $50,000 starting
    maxProjects: -1, // unlimited
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$50,000 - $150,000/year',
      'For 100-500 developers',
      'Unlimited everything',
      'On-premise deployment',
      'Custom AI model training',
      'Dedicated security engineer',
      '24/7/365 support',
      '99.9% SLA guarantee',
      'SOC 2 Type II compliance',
    ],
  },
  ENTERPRISE_PLUS: {
    name: 'Enterprise+',
    monthlyPrice: 0, // Custom - $150K-500K/year
    yearlyPrice: 15000000, // $150,000 starting
    maxProjects: -1,
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$150,000 - $500,000/year',
      'For 500-2000+ developers',
      'Everything in Enterprise',
      'Multi-region deployment',
      'White-label licensing',
      'Dedicated CSM + security team',
      '99.99% SLA guarantee',
      'Priority feature development',
      'Executive business reviews',
    ],
  },
  GOVERNMENT: {
    name: 'Government & Defense',
    monthlyPrice: 0, // Custom - $500K-2M+/year
    yearlyPrice: 50000000, // $500,000 starting
    maxProjects: -1,
    maxScansPerMonth: -1,
    maxTeamMembers: -1,
    maxAIQueries: -1,
    features: [
      '$500,000 - $2,000,000+/year',
      'Federal, State & Defense',
      'FedRAMP High Ready',
      'NIST 800-53 Compliant',
      'ITAR/EAR Compliant',
      'Air-gapped deployment',
      'Classified environment support',
      'Security-cleared support staff',
      'Nation-state threat detection',
      'Critical infrastructure protection',
    ],
  },
};

const createCheckoutSchema = z.object({
  planTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT']),
  billingPeriod: z.enum(['monthly', 'yearly']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

const updateSubscriptionSchema = z.object({
  planTier: z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT']),
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

    const plan = PLANS[subscription.planTier];
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
    const plan = PLANS[planTier];

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

    // Create checkout session
    const priceInCents = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Anchor Security - ${plan.name}`,
              description: plan.features.slice(0, 3).join(', '),
            },
            unit_amount: priceInCents,
            recurring: {
              interval: billingPeriod === 'yearly' ? 'year' : 'month',
            },
          },
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
      return_url: body.returnUrl,
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
    const plan = PLANS[planTier];

    // Update subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price_data: {
            currency: 'usd',
            product: stripeSubscription.items.data[0].price.product as string,
            unit_amount: plan.monthlyPrice,
            recurring: { interval: 'month' },
          },
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
      data: { planTier },
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
    const rawBody = (request.body as Buffer);

    if (!rawBody) {
      return reply.status(400).send({ error: 'No raw body' });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return reply.status(400).send({ error: 'Invalid signature' });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const orgId = session.metadata?.orgId;
        const planTier = session.metadata?.planTier as 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | 'ENTERPRISE_PLUS' | 'GOVERNMENT';

        if (orgId && planTier) {
          await prisma.subscription.update({
            where: { orgId },
            data: {
              stripeSubscriptionId: session.subscription as string,
              status: 'ACTIVE',
              planTier,
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
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const orgId = subscription.metadata?.orgId;

        if (orgId) {
          await prisma.subscription.update({
            where: { orgId },
            data: { status: 'PAST_DUE' },
          });
          
          // TODO: Send payment failed email
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

    const plan = subscription ? PLANS[subscription.planTier] : PLANS.STARTER;

    // Get current month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [projectCount, scanCount, teamCount] = await Promise.all([
      prisma.project.count({ where: { orgId: user.orgId } }),
      prisma.scan.count({
        where: {
          project: { orgId: user.orgId },
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.user.count({ where: { orgId: user.orgId } }),
    ]);

    return reply.send({
      usage: {
        projects: { used: projectCount, limit: plan.maxProjects },
        scans: { used: scanCount, limit: plan.maxScansPerMonth },
        teamMembers: { used: teamCount, limit: plan.maxTeamMembers },
        aiQueries: { used: 0, limit: plan.maxAIQueries }, // TODO: Track AI queries
      },
      plan: {
        tier: subscription?.planTier || 'STARTER',
        name: plan.name,
      },
    });
  });
}
