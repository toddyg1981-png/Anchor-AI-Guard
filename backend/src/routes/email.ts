import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, authMiddleware, Roles } from '../lib/auth';
import { env } from '../config/env';
import crypto from 'crypto';

// Email configuration - using Resend
const RESEND_API_KEY = env.resendApiKey;
const FROM_EMAIL = env.fromEmail;
const ADMIN_EMAIL = env.adminEmail;
const APP_URL = env.frontendUrl;
const APP_NAME = 'Anchor Security';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Email queue for retry logic
interface QueuedEmail {
  id: string;
  options: EmailOptions;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  createdAt: number;
}

const emailQueue: QueuedEmail[] = [];
const MAX_QUEUE_SIZE = 1000;

async function queueEmail(options: EmailOptions): Promise<string> {
  const id = crypto.randomUUID();
  if (emailQueue.length >= MAX_QUEUE_SIZE) {
    emailQueue.splice(0, 100); // Remove oldest 100
  }
  emailQueue.push({
    id, options, attempts: 0, maxAttempts: 3,
    nextRetryAt: Date.now(), status: 'pending', createdAt: Date.now()
  });
  processQueue(); // Fire and forget
  return id;
}

async function processQueue(): Promise<void> {
  const pending = emailQueue.filter(e => e.status === 'pending' && e.nextRetryAt <= Date.now());
  for (const email of pending) {
    email.attempts++;
    const success = await sendEmail(email.options);
    if (success) {
      email.status = 'sent';
    } else if (email.attempts >= email.maxAttempts) {
      email.status = 'failed';
      email.error = 'Max retries exceeded';
    } else {
      email.nextRetryAt = Date.now() + Math.pow(2, email.attempts) * 1000;
    }
  }
}

// Process retry queue every 30 seconds
setInterval(() => processQueue(), 30000);

// Send email via Resend API
async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${APP_NAME} <${FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
}

// Retry wrapper with exponential backoff (only retries on 5xx / network errors)
async function sendEmailWithRetry(options: EmailOptions, maxRetries = 3): Promise<boolean> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: `${APP_NAME} <${FROM_EMAIL}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (response.ok) {
        return true;
      }

      const error = await response.json();

      // Don't retry on 4xx client errors
      if (response.status >= 400 && response.status < 500) {
        console.error(`Resend API client error (${response.status}), not retrying:`, error);
        return false;
      }

      // 5xx server error — retry if attempts remain
      console.error(`Resend API server error (${response.status}), attempt ${attempt + 1}/${maxRetries + 1}:`, error);
    } catch (networkError) {
      // Network failure — retry if attempts remain
      console.error(`Email network error, attempt ${attempt + 1}/${maxRetries + 1}:`, networkError);
    }

    if (attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      console.log(`Retrying email to ${options.to} in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  console.error(`All ${maxRetries + 1} email attempts failed for ${options.to}`);
  return false;
}

// Email templates
const emailTemplates = {
  welcome: (name: string) => ({
    subject: `Welcome to ${APP_NAME}! 🎉`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${APP_NAME}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚓ ${APP_NAME}</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">Welcome aboard, ${name}! 🚀</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 20px 0;">
                You've just joined the world's most advanced AI-powered security platform. Here's what makes Anchor special:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px; margin-bottom: 10px;">
                    <p style="color: #06b6d4; margin: 0 0 5px 0; font-weight: bold;">🔮 Predictive CVE Intelligence</p>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">Know about vulnerabilities before they're public</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px;">
                    <p style="color: #06b6d4; margin: 0 0 5px 0; font-weight: bold;">🛡️ Attack Path Visualization</p>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">See how attackers could chain vulnerabilities</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px;">
                    <p style="color: #06b6d4; margin: 0 0 5px 0; font-weight: bold;">💬 AI Security Assistant</p>
                    <p style="color: #94a3b8; margin: 0; font-size: 14px;">Ask questions in plain English</p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                Your 14-day free trial starts now. Let's secure your code!
              </p>
              
              <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
                Go to Dashboard →
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; background-color: #0f172a; text-align: center;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">
                Questions? Reply to this email or visit our <a href="${APP_URL}/docs" style="color: #06b6d4;">documentation</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Welcome to ${APP_NAME}, ${name}!\n\nYou've just joined the world's most advanced AI-powered security platform.\n\nYour 14-day free trial starts now.\n\nGo to your dashboard: ${APP_URL}/dashboard`,
  }),

  teamInvite: (inviterName: string, orgName: string, inviteToken: string) => ({
    subject: `${inviterName} invited you to join ${orgName} on ${APP_NAME}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚓ ${APP_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">You're Invited! 🎉</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                <strong style="color: white;">${inviterName}</strong> has invited you to join <strong style="color: white;">${orgName}</strong> on ${APP_NAME}.
              </p>
              <a href="${APP_URL}/invite/${inviteToken}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
                Accept Invitation →
              </a>
              <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
                This invitation expires in 7 days.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `${inviterName} invited you to join ${orgName} on ${APP_NAME}.\n\nAccept invitation: ${APP_URL}/invite/${inviteToken}\n\nThis invitation expires in 7 days.`,
  }),

  passwordReset: (resetToken: string) => ({
    subject: `Reset your ${APP_NAME} password`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚓ ${APP_NAME}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">Reset Your Password</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                We received a request to reset your password. Click the button below to choose a new password.
              </p>
              <a href="${APP_URL}/reset-password/${resetToken}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
                Reset Password →
              </a>
              <p style="color: #64748b; font-size: 14px; margin: 30px 0 0 0;">
                This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Reset your ${APP_NAME} password.\n\nClick here to reset: ${APP_URL}/reset-password/${resetToken}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
  }),

  securityDigest: (name: string, stats: { critical: number; high: number; newFindings: number; fixedFindings: number }) => ({
    subject: `Your Weekly Security Digest - ${APP_NAME}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #06b6d4, #8b5cf6); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚓ Weekly Security Digest</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">Hi ${name}! 👋</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                Here's your security summary for the past week:
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="50%" style="padding: 15px; background-color: #7f1d1d; border-radius: 8px 0 0 8px;">
                    <p style="color: #fca5a5; margin: 0; font-size: 12px;">CRITICAL</p>
                    <p style="color: white; margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">${stats.critical}</p>
                  </td>
                  <td width="50%" style="padding: 15px; background-color: #92400e; border-radius: 0 8px 8px 0;">
                    <p style="color: #fcd34d; margin: 0; font-size: 12px;">HIGH</p>
                    <p style="color: white; margin: 5px 0 0 0; font-size: 32px; font-weight: bold;">${stats.high}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 10px;">
                <tr>
                  <td width="50%" style="padding: 15px; background-color: #0f172a; border-radius: 8px 0 0 8px;">
                    <p style="color: #94a3b8; margin: 0; font-size: 12px;">NEW FINDINGS</p>
                    <p style="color: white; margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">${stats.newFindings}</p>
                  </td>
                  <td width="50%" style="padding: 15px; background-color: #0f172a; border-radius: 0 8px 8px 0;">
                    <p style="color: #94a3b8; margin: 0; font-size: 12px;">FIXED</p>
                    <p style="color: #4ade80; margin: 5px 0 0 0; font-size: 24px; font-weight: bold;">${stats.fixedFindings}</p>
                  </td>
                </tr>
              </table>
              
              <a href="${APP_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 30px;">
                View Full Report →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Weekly Security Digest\n\nCritical: ${stats.critical}\nHigh: ${stats.high}\nNew Findings: ${stats.newFindings}\nFixed: ${stats.fixedFindings}\n\nView full report: ${APP_URL}/dashboard`,
  }),

  paymentFailed: (name: string) => ({
    subject: `⚠️ Payment failed - Action required`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background-color: #dc2626; padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Payment Failed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">Hi ${name},</h2>
              <p style="color: #94a3b8; font-size: 16px; line-height: 24px; margin: 0 0 30px 0;">
                We couldn't process your latest payment. Please update your payment method to continue using ${APP_NAME}.
              </p>
              <a href="${APP_URL}/settings/billing" style="display: inline-block; background-color: #dc2626; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold;">
                Update Payment Method →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hi ${name},\n\nWe couldn't process your latest payment. Please update your payment method: ${APP_URL}/settings/billing`,
  }),

  adminNewSignup: (userEmail: string, userName: string, signupTime: Date) => ({
    subject: `🎉 New Signup: ${userEmail}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1e293b; border-radius: 16px; overflow: hidden;">
          <tr>
            <td style="background: linear-gradient(135deg, #10b981, #06b6d4); padding: 40px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎉 New User Signup!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px;">
              <h2 style="color: white; margin: 0 0 20px 0;">Someone just joined Anchor!</h2>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px;">
                    <p style="color: #94a3b8; margin: 0 0 5px 0; font-size: 12px;">EMAIL</p>
                    <p style="color: #06b6d4; margin: 0; font-size: 18px; font-weight: bold;">${userEmail}</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px;">
                    <p style="color: #94a3b8; margin: 0 0 5px 0; font-size: 12px;">NAME</p>
                    <p style="color: white; margin: 0; font-size: 18px;">${userName || 'Not provided'}</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #0f172a; border-radius: 8px;">
                    <p style="color: #94a3b8; margin: 0 0 5px 0; font-size: 12px;">SIGNED UP</p>
                    <p style="color: white; margin: 0; font-size: 18px;">${signupTime.toLocaleString()}</p>
                  </td>
                </tr>
                <tr><td style="height: 10px;"></td></tr>
                <tr>
                  <td style="padding: 15px; background-color: #10b981; border-radius: 8px;">
                    <p style="color: white; margin: 0 0 5px 0; font-size: 12px;">PLAN</p>
                    <p style="color: white; margin: 0; font-size: 18px; font-weight: bold;">14-Day Free Trial (Starter)</p>
                  </td>
                </tr>
              </table>
              
              <a href="${APP_URL}/admin" style="display: inline-block; background: linear-gradient(135deg, #06b6d4, #8b5cf6); color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; margin-top: 20px;">
                View in Admin Dashboard →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `New User Signup!\n\nEmail: ${userEmail}\nName: ${userName || 'Not provided'}\nSigned up: ${signupTime.toLocaleString()}\nPlan: 14-Day Free Trial (Starter)`,
  }),
};

// Notify admin of new signup - exported for use in other routes
export async function notifyAdminNewSignup(userEmail: string, userName: string): Promise<void> {
  if (!ADMIN_EMAIL) {
    console.log('No ADMIN_EMAIL configured, skipping admin notification');
    return;
  }
  
  const template = emailTemplates.adminNewSignup(userEmail, userName, new Date());
  await sendEmailWithRetry({
    to: ADMIN_EMAIL,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
  console.log(`Admin notification sent for new signup: ${userEmail}`);
}

// Password reset schemas
const requestResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(100),
});

export async function emailRoutes(app: FastifyInstance): Promise<void> {
  // Request password reset (rate limited to prevent email abuse)
  app.post('/auth/forgot-password', {
    config: {
      rateLimit: {
        max: 3,
        timeWindow: '1 minute',
      },
    },
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = requestResetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid email' });
    }

    const { email } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Always return success to prevent email enumeration
    const successResponse = { message: 'If an account exists, you will receive a password reset email.' };

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return reply.send(successResponse);
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: {
        email: normalizedEmail,
        token,
        expiresAt,
      },
    });

    // Send email
    const template = emailTemplates.passwordReset(token);
    await sendEmailWithRetry({
      to: normalizedEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    return reply.send(successResponse);
  });

  // Verify reset token is valid (for frontend)
  app.get('/auth/verify-reset-token', async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.query as { token?: string };

    if (!token) {
      return reply.send({ valid: false, error: 'No token provided' });
    }

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return reply.send({ valid: false, error: 'Token not found' });
    }

    if (resetRecord.expiresAt < new Date()) {
      return reply.send({ valid: false, error: 'Token expired' });
    }

    if (resetRecord.usedAt) {
      return reply.send({ valid: false, error: 'Token already used' });
    }

    return reply.send({ valid: true });
  });

  // Reset password with token
  app.post('/auth/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = resetPasswordSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { token, password } = parsed.data;

    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return reply.status(400).send({ error: 'Invalid or expired reset token' });
    }

    if (resetRecord.expiresAt < new Date()) {
      return reply.status(400).send({ error: 'Reset token has expired' });
    }

    if (resetRecord.usedAt) {
      return reply.status(400).send({ error: 'Reset token has already been used' });
    }

    // Update user password
    const passwordHash = await hashPassword(password);
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    });

    // Mark token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    return reply.send({ message: 'Password reset successfully' });
  });

  // Send test email (admin only)
  app.post('/admin/test-email', { preHandler: [authMiddleware('admin')] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { role: string; email: string };
    
    if (user.role !== 'owner' && user.role !== 'admin') {
      return reply.status(403).send({ error: 'Admin access required' });
    }

    const body = request.body as { type?: string };
    const emailType = body.type || 'welcome';

    let template;
    switch (emailType) {
      case 'welcome':
        template = emailTemplates.welcome('Test User');
        break;
      case 'invite':
        template = emailTemplates.teamInvite('Admin', 'Test Org', 'test-token');
        break;
      case 'reset':
        template = emailTemplates.passwordReset('test-reset-token');
        break;
      case 'digest':
        template = emailTemplates.securityDigest('Test User', {
          critical: 3,
          high: 12,
          newFindings: 15,
          fixedFindings: 8,
        });
        break;
      case 'payment_failed':
        template = emailTemplates.paymentFailed('Test User');
        break;
      default:
        return reply.status(400).send({ error: 'Unknown email type' });
    }

    const success = await sendEmailWithRetry({
      to: user.email,
      subject: `[TEST] ${template.subject}`,
      html: template.html,
      text: template.text,
    });

    return reply.send({ success, message: success ? 'Test email sent' : 'Failed to send email' });
  });

  // Email queue status endpoint
  app.get('/email/queue-status', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    return reply.send({
      total: emailQueue.length,
      pending: emailQueue.filter(e => e.status === 'pending').length,
      sent: emailQueue.filter(e => e.status === 'sent').length,
      failed: emailQueue.filter(e => e.status === 'failed').length,
    });
  });
}

// Export for use in other modules
export { sendEmail, sendEmailWithRetry, emailTemplates, queueEmail };
