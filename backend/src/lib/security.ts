/**
 * ANCHOR SECURITY PLATFORM - Security Middleware & Utilities
 * Enterprise-grade security for government and defense contracts
 * 
 * This file contains critical security infrastructure.
 * DO NOT MODIFY without security team review.
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import crypto from 'crypto';

// CSRF Token Store (in production, use Redis)
const csrfTokens = new Map<string, { token: string; createdAt: number; userId: string }>();
const CSRF_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(token, {
    token,
    createdAt: Date.now(),
    userId
  });
  
  // Cleanup expired tokens
  cleanupExpiredCSRFTokens();
  
  return token;
}

/**
 * Validate a CSRF token
 */
export function validateCSRFToken(token: string, userId: string): boolean {
  const stored = csrfTokens.get(token);
  if (!stored) return false;
  
  // Check expiry
  if (Date.now() - stored.createdAt > CSRF_TOKEN_EXPIRY) {
    csrfTokens.delete(token);
    return false;
  }
  
  // Check user match
  if (stored.userId !== userId) return false;
  
  // Single use - delete after validation
  csrfTokens.delete(token);
  return true;
}

/**
 * Cleanup expired CSRF tokens
 */
function cleanupExpiredCSRFTokens(): void {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now - data.createdAt > CSRF_TOKEN_EXPIRY) {
      csrfTokens.delete(token);
    }
  }
}

/**
 * CSRF Protection Middleware for state-changing operations
 * Validates X-CSRF-Token header against stored tokens
 */
export function csrfProtection() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip for GET, HEAD, OPTIONS (safe methods)
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(request.method)) {
      return;
    }
    
    // Check Origin/Referer header
    const origin = request.headers.origin || request.headers.referer;
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      'http://localhost:5173',
      'http://localhost:3000'
    ].filter(Boolean);
    
    if (origin) {
      const originHost = new URL(origin).origin;
      if (!allowedOrigins.some(allowed => originHost.startsWith(allowed || ''))) {
        request.log.warn({ origin, allowedOrigins }, 'CSRF: Invalid origin');
        return reply.status(403).send({ error: 'Invalid request origin' });
      }
    }
    
    // For API clients, check CSRF token in header
    const csrfToken = request.headers['x-csrf-token'] as string;
    const user = (request as any).user;
    
    // If we have a user context and a CSRF token, validate it
    if (user && csrfToken) {
      if (!validateCSRFToken(csrfToken, user.id)) {
        request.log.warn({ userId: user.id }, 'CSRF: Invalid or expired token');
        return reply.status(403).send({ error: 'Invalid or expired CSRF token' });
      }
    }
  };
}

/**
 * Security Headers Middleware
 */
export function securityHeaders() {
  return async (_request: FastifyRequest, reply: FastifyReply, _payload: unknown) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('X-XSS-Protection', '1; mode=block');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  };
}

/**
 * Request sanitization - strip potential XSS from inputs
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: URIs
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/data:/gi, ''); // Remove data URIs
}

/**
 * Deep sanitize object
 */
export function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeInput(key)] = sanitizeObject(value);
    }
    return sanitized;
  }
  return obj;
}

/**
 * Rate limit configuration by endpoint type
 */
export const rateLimitConfigs = {
  // Ultra-strict for auth endpoints
  auth: { max: 5, timeWindow: '1 minute' },
  authStrict: { max: 3, timeWindow: '1 minute' },
  
  // Strict for sensitive operations
  passwordReset: { max: 3, timeWindow: '5 minutes' },
  billing: { max: 10, timeWindow: '1 minute' },
  
  // Moderate for API operations
  api: { max: 60, timeWindow: '1 minute' },
  aiOperations: { max: 20, timeWindow: '1 minute' },
  
  // Relaxed for read operations
  read: { max: 120, timeWindow: '1 minute' },
  
  // Public endpoints
  public: { max: 30, timeWindow: '1 minute' },
  webhook: { max: 100, timeWindow: '1 minute' }
};

/**
 * IP-based blocking for repeated violations
 */
const blockedIPs = new Map<string, { until: number; reason: string }>();
const violationCounts = new Map<string, { count: number; firstViolation: number }>();

const BLOCK_THRESHOLD = 10; // violations before block
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const VIOLATION_WINDOW = 60 * 60 * 1000; // 1 hour window

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): { blocked: boolean; reason?: string; until?: Date } {
  const block = blockedIPs.get(ip);
  if (!block) return { blocked: false };
  
  if (Date.now() > block.until) {
    blockedIPs.delete(ip);
    return { blocked: false };
  }
  
  return { 
    blocked: true, 
    reason: block.reason,
    until: new Date(block.until)
  };
}

/**
 * Record a security violation for an IP
 */
export function recordViolation(ip: string, reason: string): void {
  const now = Date.now();
  const existing = violationCounts.get(ip);
  
  if (existing && now - existing.firstViolation < VIOLATION_WINDOW) {
    existing.count++;
    if (existing.count >= BLOCK_THRESHOLD) {
      blockedIPs.set(ip, { until: now + BLOCK_DURATION, reason });
      violationCounts.delete(ip);
    }
  } else {
    violationCounts.set(ip, { count: 1, firstViolation: now });
  }
}

/**
 * IP blocking middleware
 */
export function ipBlockingMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip;
    const blockStatus = isIPBlocked(ip);
    
    if (blockStatus.blocked) {
      request.log.warn({ ip, reason: blockStatus.reason }, 'Blocked IP attempted access');
      return reply.status(403).send({ 
        error: 'Access denied',
        reason: 'Your IP has been temporarily blocked due to security policy violations',
        blockedUntil: blockStatus.until
      });
    }
  };
}

/**
 * Audit logging for security-sensitive operations
 */
export interface AuditLogEntry {
  timestamp: Date;
  userId?: string;
  orgId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent?: string;
  success: boolean;
  details?: Record<string, any>;
}

const auditLog: AuditLogEntry[] = [];
const MAX_AUDIT_LOG_SIZE = 10000;

/**
 * Log a security audit event
 */
export function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): void {
  auditLog.unshift({ ...entry, timestamp: new Date() });
  
  // Trim log if too large (in production, this would go to a database)
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.pop();
  }
}

/**
 * Get recent audit events
 */
export function getAuditLog(filters?: { userId?: string; orgId?: string; action?: string }): AuditLogEntry[] {
  let result = auditLog;
  
  if (filters?.userId) {
    result = result.filter(e => e.userId === filters.userId);
  }
  if (filters?.orgId) {
    result = result.filter(e => e.orgId === filters.orgId);
  }
  if (filters?.action) {
    result = result.filter(e => e.action === filters.action);
  }
  
  return result.slice(0, 100); // Return max 100 entries
}

/**
 * Generate a secure random string
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash sensitive data for logging (never log raw sensitive data)
 */
export function hashForLogging(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

/**
 * Validate and sanitize user input for database operations
 */
export function validateAndSanitize<T>(data: T, allowedFields: string[]): Partial<T> {
  if (!data || typeof data !== 'object') return {};
  
  const sanitized: Partial<T> = {};
  for (const field of allowedFields) {
    if (field in data) {
      const value = (data as any)[field];
      (sanitized as any)[field] = typeof value === 'string' ? sanitizeInput(value) : value;
    }
  }
  return sanitized;
}

/**
 * Content type validation
 */
export function validateContentType(request: FastifyRequest, allowedTypes: string[]): boolean {
  const contentType = request.headers['content-type']?.toLowerCase() || '';
  return allowedTypes.some(type => contentType.includes(type));
}

/**
 * Request size validation (in addition to Fastify's bodyLimit)
 */
export function validateRequestSize(request: FastifyRequest, maxSize: number): boolean {
  const contentLength = parseInt(request.headers['content-length'] || '0', 10);
  return contentLength <= maxSize;
}
