import 'dotenv/config';

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  corsOrigin: required('CORS_ORIGIN', process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173'),
  frontendUrl: required('FRONTEND_URL', process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5173'),
  backendUrl: required('BACKEND_URL', process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:3001'),
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  githubClientId: process.env.GITHUB_CLIENT_ID ?? '',
  githubClientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  stripeEnabled: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
  resendApiKey: process.env.RESEND_API_KEY ?? '',
  fromEmail: process.env.FROM_EMAIL ?? 'noreply@anchoraiguard.com',
  adminEmail: process.env.ADMIN_EMAIL ?? '',
  nvdApiKey: process.env.NVD_API_KEY ?? '',
  sentryDsn: process.env.SENTRY_DSN ?? '',
  redisUrl: process.env.REDIS_URL ?? '',
};
