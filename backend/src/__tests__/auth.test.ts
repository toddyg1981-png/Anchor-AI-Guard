import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, hasPermission, Roles, Permissions } from '../lib/auth';

describe('Auth Module', () => {
  describe('Password Hashing', () => {
    it('hashes a password with bcrypt', async () => {
      const hash = await hashPassword('testPassword123');
      expect(hash).toBeTruthy();
      expect(hash).toMatch(/^\$2[aby]?\$/);
      expect(hash).not.toBe('testPassword123');
    });

    it('verifies a correct password', async () => {
      const hash = await hashPassword('mySecret');
      const result = await verifyPassword('mySecret', hash);
      expect(result).toBe(true);
    });

    it('rejects an incorrect password', async () => {
      const hash = await hashPassword('correctPassword');
      const result = await verifyPassword('wrongPassword', hash);
      expect(result).toBe(false);
    });
  });

  describe('Permissions', () => {
    it('owner has all permissions', () => {
      const allPerms = Object.keys(Permissions) as (keyof typeof Permissions)[];
      for (const perm of allPerms) {
        expect(hasPermission(Roles.OWNER, perm)).toBe(true);
      }
    });

    it('viewer cannot create projects', () => {
      expect(hasPermission(Roles.VIEWER, 'project:create')).toBe(false);
    });

    it('viewer can read projects', () => {
      expect(hasPermission(Roles.VIEWER, 'project:read')).toBe(true);
    });

    it('member cannot manage team', () => {
      expect(hasPermission(Roles.MEMBER, 'team:manage')).toBe(false);
    });

    it('admin can manage team', () => {
      expect(hasPermission(Roles.ADMIN, 'team:manage')).toBe(true);
    });
  });
});
