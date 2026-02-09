import { describe, it, expect } from 'vitest';

// Force in-memory fallback
process.env.REDIS_URL = '';

import {
  storeCSRFToken,
  getCSRFToken,
  deleteCSRFToken,
  blockIP,
  isIPBlocked,
  unblockIP,
  recordViolation,
  getViolationCount,
  pushAuditLog,
  getAuditLog,
} from '../lib/security-store';

describe('Security Store', () => {
  describe('CSRF Tokens', () => {
    it('stores and retrieves a CSRF token', async () => {
      await storeCSRFToken('test-csrf-1', 'user-123');
      const result = await getCSRFToken('test-csrf-1');
      expect(result).toBeTruthy();
      expect(result!.userId).toBe('user-123');
    });

    it('returns null for unknown token', async () => {
      const result = await getCSRFToken('nonexistent');
      expect(result).toBeNull();
    });

    it('deletes a token', async () => {
      await storeCSRFToken('test-csrf-del', 'user-456');
      await deleteCSRFToken('test-csrf-del');
      const result = await getCSRFToken('test-csrf-del');
      expect(result).toBeNull();
    });
  });

  describe('IP Blocking', () => {
    it('blocks and checks an IP', async () => {
      await blockIP('192.168.1.100', 'test-block', 3600);
      const result = await isIPBlocked('192.168.1.100');
      expect(result).toBeTruthy();
      expect(result!.reason).toBe('test-block');
    });

    it('returns null for non-blocked IP', async () => {
      const result = await isIPBlocked('10.0.0.1');
      expect(result).toBeNull();
    });

    it('unblocks an IP', async () => {
      await blockIP('192.168.1.200', 'temp-block', 3600);
      await unblockIP('192.168.1.200');
      const result = await isIPBlocked('192.168.1.200');
      expect(result).toBeNull();
    });
  });

  describe('Violation Tracking', () => {
    it('records and counts violations', async () => {
      const ip = 'violation-test-' + Date.now();
      await recordViolation(ip, 3600);
      const count = await getViolationCount(ip);
      expect(count).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Audit Log', () => {
    it('pushes and retrieves audit entries', async () => {
      const entry = { action: 'test', timestamp: Date.now() };
      await pushAuditLog(entry);
      const log = await getAuditLog(10);
      expect(log.length).toBeGreaterThanOrEqual(1);
    });
  });
});
