/**
 * ANCHOR SECURITY PLATFORM - Security Middleware & Utilities
 * Enterprise-grade security for government and defense contracts
 * 
 * This file contains critical security infrastructure.
 * DO NOT MODIFY without security team review.
 */

import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import crypto from 'crypto';
import * as store from './security-store';

/**
 * Generate a cryptographically secure CSRF token
 */
export async function generateCSRFToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  await store.storeCSRFToken(token, userId);
  return token;
}

/**
 * Validate a CSRF token
 */
export async function validateCSRFToken(token: string, userId: string): Promise<boolean> {
  const stored = await store.getCSRFToken(token);
  if (!stored) return false;
  
  // Check user match
  if (stored.userId !== userId) return false;
  
  // Single use - delete after validation
  await store.deleteCSRFToken(token);
  return true;
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
      if (!(await validateCSRFToken(csrfToken, user.id))) {
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
const BLOCK_THRESHOLD = 10; // violations before block
const BLOCK_DURATION_SECONDS = 24 * 60 * 60; // 24 hours
const VIOLATION_WINDOW_SECONDS = 60 * 60; // 1 hour window

/**
 * Check if IP is blocked
 */
export async function isIPBlocked(ip: string): Promise<{ blocked: boolean; reason?: string; until?: Date }> {
  const block = await store.isIPBlocked(ip);
  if (!block) return { blocked: false };
  
  return { 
    blocked: true, 
    reason: block.reason,
    until: new Date(block.expiresAt)
  };
}

/**
 * Record a security violation for an IP
 */
export async function recordViolation(ip: string, reason: string): Promise<void> {
  const count = await store.recordViolation(ip, VIOLATION_WINDOW_SECONDS);
  if (count >= BLOCK_THRESHOLD) {
    await store.blockIP(ip, reason, BLOCK_DURATION_SECONDS);
  }
}

/**
 * IP blocking middleware
 */
export function ipBlockingMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip;
    const blockStatus = await isIPBlocked(ip);
    
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

/**
 * Log a security audit event
 */
export async function logAuditEvent(entry: Omit<AuditLogEntry, 'timestamp'>): Promise<void> {
  await store.pushAuditLog({ ...entry, timestamp: new Date() });
}

/**
 * Get recent audit events
 */
export async function getAuditLog(filters?: { userId?: string; orgId?: string; action?: string }): Promise<AuditLogEntry[]> {
  const entries = (await store.getAuditLog(100)) as AuditLogEntry[];
  let result = entries;
  
  if (filters?.userId) {
    result = result.filter(e => e.userId === filters.userId);
  }
  if (filters?.orgId) {
    result = result.filter(e => e.orgId === filters.orgId);
  }
  if (filters?.action) {
    result = result.filter(e => e.action === filters.action);
  }
  
  return result;
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
