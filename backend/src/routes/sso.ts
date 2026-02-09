import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware, Roles } from '../lib/auth';
import { env } from '../config/env';

// SSO Configuration schema
const ssoConfigSchema = z.object({
  provider: z.enum(['saml', 'oidc']),
  entityId: z.string().min(1),
  ssoUrl: z.string().url(),
  certificate: z.string().min(1),
  allowedDomains: z.array(z.string()).min(1),
});

export async function ssoRoutes(app: FastifyInstance): Promise<void> {
  // GET /sso/config - Get SSO configuration for org
  app.get('/sso/config', { preHandler: authMiddleware([Roles.OWNER, Roles.ADMIN]) }, async (request, reply) => {
    const { orgId } = (request as unknown as Record<string, unknown>).user as { orgId: string };
    // Check org has Enterprise tier
    const sub = await prisma.subscription.findUnique({ where: { orgId } });
    if (!sub || !['ENTERPRISE', 'ENTERPRISE_PLUS', 'GOVERNMENT'].includes(sub.planTier)) {
      return reply.status(403).send({ error: 'SSO requires Enterprise tier or above' });
    }
    // Return SSO config from org metadata (stored in integrations)
    const ssoIntegration = await prisma.integration.findFirst({
      where: { orgId, type: 'sso' },
    });
    return reply.send({ configured: !!ssoIntegration, config: ssoIntegration?.config || null });
  });

  // POST /sso/config - Configure SSO for org
  app.post('/sso/config', { preHandler: authMiddleware([Roles.OWNER]) }, async (request, reply) => {
    const { orgId } = (request as unknown as Record<string, unknown>).user as { orgId: string };
    const parsed = ssoConfigSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid SSO configuration', details: parsed.error.flatten() });
    }
    // Upsert SSO integration
    const existing = await prisma.integration.findFirst({ where: { orgId, type: 'sso' } });
    if (existing) {
      await prisma.integration.update({ where: { id: existing.id }, data: { config: JSON.parse(JSON.stringify(parsed.data)) } });
    } else {
      await prisma.integration.create({
        data: { type: 'sso', name: `${parsed.data.provider.toUpperCase()} SSO`, orgId, config: JSON.parse(JSON.stringify(parsed.data)) },
      });
    }
    return reply.send({ success: true, message: 'SSO configuration saved' });
  });

  // GET /sso/login/:orgId - Initiate SSO login (redirect to IdP)
  app.get('/sso/login/:orgId', async (request, reply) => {
    const { orgId } = request.params as { orgId: string };
    const ssoIntegration = await prisma.integration.findFirst({
      where: { orgId, type: 'sso', enabled: true },
    });
    if (!ssoIntegration) {
      return reply.status(404).send({ error: 'SSO not configured for this organization' });
    }
    const config = ssoIntegration.config as Record<string, unknown>;
    // For SAML, redirect to IdP SSO URL with SAMLRequest
    if (config.provider === 'saml') {
      const relayState = Buffer.from(JSON.stringify({ orgId, timestamp: Date.now() })).toString('base64');
      const samlRequest = Buffer.from(
        `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ID="_${crypto.randomUUID()}" Version="2.0" IssueInstant="${new Date().toISOString()}" AssertionConsumerServiceURL="${env.backendUrl}/api/sso/callback" ProviderName="Anchor Security"><saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${config.entityId}</saml:Issuer></samlp:AuthnRequest>`
      ).toString('base64');
      const redirectUrl = `${config.ssoUrl}?SAMLRequest=${encodeURIComponent(samlRequest)}&RelayState=${encodeURIComponent(relayState)}`;
      return reply.redirect(redirectUrl);
    }
    // For OIDC
    return reply.status(501).send({ error: 'OIDC login not yet implemented' });
  });

  // POST /sso/callback - Handle SSO callback (ACS endpoint)
  app.post('/sso/callback', async (request, reply) => {
    // In production, this would validate the SAML Response XML signature
    // For now, we accept the callback and create/find the user
    const { SAMLResponse, RelayState } = request.body as { SAMLResponse?: string; RelayState?: string };
    if (!SAMLResponse || !RelayState) {
      return reply.status(400).send({ error: 'Missing SAML response' });
    }
    try {
      const relayData = JSON.parse(Buffer.from(RelayState, 'base64').toString());
      // TODO: Parse and validate SAML assertion XML, extract email, name
      // For now return a placeholder indicating the flow works
      return reply.send({
        success: true,
        message: 'SSO callback received. Full SAML assertion validation requires enterprise setup.',
        orgId: relayData.orgId,
        note: 'Contact support@anchor-security.com to complete SAML integration.',
      });
    } catch {
      return reply.status(400).send({ error: 'Invalid SAML callback data' });
    }
  });

  // DELETE /sso/config - Remove SSO configuration
  app.delete('/sso/config', { preHandler: authMiddleware([Roles.OWNER]) }, async (request, reply) => {
    const { orgId } = (request as unknown as Record<string, unknown>).user as { orgId: string };
    await prisma.integration.deleteMany({ where: { orgId, type: 'sso' } });
    return reply.send({ success: true, message: 'SSO configuration removed' });
  });

  // GET /sso/metadata - Return SP metadata XML
  app.get('/sso/metadata', async (request, reply) => {
    const metadata = `<?xml version="1.0"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="anchor-security">
  <md:SPSSODescriptor AuthnRequestsSigned="false" WantAssertionsSigned="true" protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${env.backendUrl}/api/sso/callback" index="0" isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;
    reply.header('Content-Type', 'application/xml');
    return reply.send(metadata);
  });
}
