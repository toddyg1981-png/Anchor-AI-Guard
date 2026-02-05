import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { Roles } from '../lib/auth';

// OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
// BACKEND_URL is used for OAuth callbacks (where GitHub/Google redirects back)
const BACKEND_URL = process.env.OAUTH_REDIRECT_BASE || process.env.BACKEND_URL || 'http://localhost:3001';
// FRONTEND_URL is used for redirecting users after auth
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5174';

interface GitHubUser {
  id: number;
  login: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export async function oauthRoutes(app: FastifyInstance): Promise<void> {
  // ============================================
  // GITHUB OAUTH
  // ============================================

  // Initiate GitHub OAuth
  app.get('/auth/github', async (_request: FastifyRequest, reply: FastifyReply) => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${BACKEND_URL}/api/auth/github/callback`,
      scope: 'read:user user:email',
      state: generateState(),
    });

    return reply.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });

  // GitHub OAuth callback
  app.get('/auth/github/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, state: _state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.redirect(`${FRONTEND_URL}/login?error=github_auth_failed`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${BACKEND_URL}/api/auth/github/callback`,
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        console.error('GitHub token error:', tokenData);
        return reply.redirect(`${FRONTEND_URL}/login?error=github_token_failed`);
      }

      // Get user info from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      const githubUser: GitHubUser = await userResponse.json();

      // Get email if not public
      let email = githubUser.email;
      if (!email) {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        });
        const emails = await emailsResponse.json();
        const primaryEmail = emails.find((e: { primary: boolean; verified: boolean; email: string }) => e.primary && e.verified);
        email = primaryEmail?.email;
      }

      if (!email) {
        return reply.redirect(`${FRONTEND_URL}/login?error=github_no_email`);
      }

      // Find or create user
      const { user: _user, token, isNewUser } = await findOrCreateOAuthUser({
        provider: 'github',
        providerId: githubUser.id.toString(),
        email: email.toLowerCase().trim(),
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        app,
      });

      // Redirect with token
      const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('isNewUser', isNewUser.toString());

      return reply.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      return reply.redirect(`${FRONTEND_URL}/login?error=github_auth_error`);
    }
  });

  // ============================================
  // GOOGLE OAUTH
  // ============================================

  // Initiate Google OAuth
  app.get('/auth/google', async (_request: FastifyRequest, reply: FastifyReply) => {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: generateState(),
      access_type: 'offline',
      prompt: 'consent',
    });

    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });

  // Google OAuth callback
  app.get('/auth/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const { code, state: _state } = request.query as { code?: string; state?: string };

    if (!code) {
      return reply.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${BACKEND_URL}/api/auth/google/callback`,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenData.access_token) {
        console.error('Google token error:', tokenData);
        return reply.redirect(`${FRONTEND_URL}/login?error=google_token_failed`);
      }

      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const googleUser: GoogleUser = await userResponse.json();

      if (!googleUser.email) {
        return reply.redirect(`${FRONTEND_URL}/login?error=google_no_email`);
      }

      // Find or create user
      const { user: _user, token, isNewUser } = await findOrCreateOAuthUser({
        provider: 'google',
        providerId: googleUser.id,
        email: googleUser.email.toLowerCase().trim(),
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : undefined,
        app,
      });

      // Redirect with token
      const redirectUrl = new URL(`${FRONTEND_URL}/auth/callback`);
      redirectUrl.searchParams.set('token', token);
      redirectUrl.searchParams.set('isNewUser', isNewUser.toString());

      return reply.redirect(redirectUrl.toString());
    } catch (error) {
      console.error('Google OAuth error:', error);
      return reply.redirect(`${FRONTEND_URL}/login?error=google_auth_error`);
    }
  });

  // ============================================
  // LINK ADDITIONAL OAUTH ACCOUNTS
  // ============================================

  // Link GitHub to existing account
  app.get('/auth/link/github', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.redirect(`${FRONTEND_URL}/settings?error=not_authenticated`);
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: `${BACKEND_URL}/api/auth/link/github/callback`,
      scope: 'read:user user:email',
      state: authHeader.replace('Bearer ', ''), // Pass token in state
    });

    return reply.redirect(`https://github.com/login/oauth/authorize?${params}`);
  });

  // Link Google to existing account
  app.get('/auth/link/google', async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.redirect(`${FRONTEND_URL}/settings?error=not_authenticated`);
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: `${BACKEND_URL}/api/auth/link/google/callback`,
      response_type: 'code',
      scope: 'openid email profile',
      state: authHeader.replace('Bearer ', ''),
      access_type: 'offline',
    });

    return reply.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
  });
}

// Helper function to find or create OAuth user
async function findOrCreateOAuthUser({
  provider,
  providerId,
  email,
  name,
  avatarUrl,
  accessToken,
  refreshToken,
  expiresAt,
  app,
}: {
  provider: string;
  providerId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  app: FastifyInstance;
}): Promise<{ user: { id: string; email: string; orgId: string; role: string }; token: string; isNewUser: boolean }> {
  // Check if OAuth account already exists
  let oauthAccount = await prisma.oAuthAccount.findUnique({
    where: {
      provider_providerId: {
        provider,
        providerId,
      },
    },
    include: {
      user: true,
    },
  });

  let user;
  let isNewUser = false;

  if (oauthAccount) {
    // Existing OAuth account - update tokens and return user
    await prisma.oAuthAccount.update({
      where: { id: oauthAccount.id },
      data: {
        accessToken,
        refreshToken,
        expiresAt,
      },
    });
    user = oauthAccount.user;
  } else {
    // Check if user exists with this email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Link OAuth to existing user
      await prisma.oAuthAccount.create({
        data: {
          provider,
          providerId,
          accessToken,
          refreshToken,
          expiresAt,
          userId: existingUser.id,
        },
      });
      
      // Update avatar if not set
      if (!existingUser.avatarUrl && avatarUrl) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { avatarUrl },
        });
      }
      
      user = existingUser;
    } else {
      // Create new user and organization
      isNewUser = true;

      const org = await prisma.organization.create({
        data: {
          name: `${name}'s Organization`,
        },
      });

      // Create trial subscription
      await prisma.subscription.create({
        data: {
          orgId: org.id,
          stripeCustomerId: `temp_${org.id}`, // Placeholder until Stripe customer created
          status: 'TRIALING',
          planTier: 'STARTER',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      user = await prisma.user.create({
        data: {
          email,
          name,
          avatarUrl,
          role: Roles.OWNER,
          orgId: org.id,
          oauthAccounts: {
            create: {
              provider,
              providerId,
              accessToken,
              refreshToken,
              expiresAt,
            },
          },
        },
      });
    }
  }

  // Generate JWT token
  const token = app.jwt.sign(
    {
      userId: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    },
    { expiresIn: '7d' }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      role: user.role,
    },
    token,
    isNewUser,
  };
}

// Generate random state for CSRF protection
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
