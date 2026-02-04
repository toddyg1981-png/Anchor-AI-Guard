/**
 * Stripe Test Setup Script
 * Run this to create test products and prices in your Stripe dashboard
 * 
 * Usage: npx ts-node scripts/setup-stripe-test.ts
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

const plans = [
  {
    name: 'Anchor Starter',
    description: 'Perfect for small teams and individual developers',
    monthlyPrice: 4900,
    yearlyPrice: 47000,
  },
  {
    name: 'Anchor Professional',
    description: 'For growing teams with advanced security needs',
    monthlyPrice: 14900,
    yearlyPrice: 143000,
  },
  {
    name: 'Anchor Enterprise',
    description: 'Unlimited everything for large organizations',
    monthlyPrice: 29900,
    yearlyPrice: 287000,
  },
  {
    name: 'Anchor Enterprise+',
    description: 'On-premise deployment and dedicated support',
    monthlyPrice: 44900,
    yearlyPrice: 431000,
  },
];

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe test products...\n');

  for (const plan of plans) {
    try {
      // Create product
      const product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
      });
      console.log(`✅ Created product: ${product.name} (${product.id})`);

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { plan: plan.name.toLowerCase().replace('anchor ', ''), billing: 'monthly' },
      });
      console.log(`   Monthly: $${plan.monthlyPrice / 100}/mo (${monthlyPrice.id})`);

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearlyPrice,
        currency: 'usd',
        recurring: { interval: 'year' },
        metadata: { plan: plan.name.toLowerCase().replace('anchor ', ''), billing: 'yearly' },
      });
      console.log(`   Yearly: $${plan.yearlyPrice / 100}/yr (${yearlyPrice.id})\n`);

    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error);
    }
  }

  console.log('\n📋 Copy these price IDs to your .env file!');
}

// Run if called directly
if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not set in environment');
    console.log('\nSet it first:');
    console.log('  $env:STRIPE_SECRET_KEY="sk_test_..." (PowerShell)');
    console.log('  export STRIPE_SECRET_KEY="sk_test_..." (Bash)');
    process.exit(1);
  }
  setupStripeProducts();
}

export { setupStripeProducts };
