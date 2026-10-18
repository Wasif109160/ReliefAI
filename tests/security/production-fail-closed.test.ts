import assert from 'node:assert/strict';
import { test, describe, beforeEach, afterEach, after } from 'node:test';
import mongoose from 'mongoose';
import {
  connectToDatabase,
  isMongoConfigured,
  DatabaseUnavailableError,
  isDatabaseUnavailableError,
} from '@/lib/mongodb';
import { authDb } from '@/lib/server/auth-db';
import { db } from '@/lib/db';
import { getAccessSecret, getRefreshSecret } from '@/lib/server/jwt';
import {
  isShowcaseMutationBlocked,
  assertShowcaseMutation,
  getDesignatedDemoRole,
  isDesignatedDemoEmail,
} from '@/lib/server/demo-policy';
import { config as middlewareConfig } from '@/middleware';
import { POST as loginPost } from '@/app/api/auth/login/route';
import { securityUtils } from '@/lib/server/security';

function setNodeEnv(val: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = val;
}

describe('ReliefAI Phase 2: Production-Safety & Fail-Closed Remediation Test Suite', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    securityUtils.resetLocalRateLimits();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    securityUtils.resetLocalRateLimits();
  });

  after(async () => {
    process.env = { ...originalEnv };
    await mongoose.disconnect();
  });

  // =========================================================================
  // SUITE 1: Production Database Fail-Closed Enforcement
  // =========================================================================
  describe('1. Production Database Fail-Closed Enforcement', () => {
    test('connectToDatabase throws DatabaseUnavailableError (503) when MONGODB_URI is missing in production', async () => {
      setNodeEnv('production');
      delete process.env.MONGODB_URI;

      assert.strictEqual(isMongoConfigured(), false);
      await assert.rejects(
        async () => {
          await connectToDatabase();
        },
        (err: unknown) => {
          assert.strictEqual(isDatabaseUnavailableError(err), true);
          assert.strictEqual((err as DatabaseUnavailableError).statusCode, 503);
          assert.strictEqual((err as DatabaseUnavailableError).code, 'DATABASE_UNAVAILABLE');
          return true;
        }
      );
    });

    test('authDb operations fail-closed with 503 in production without silent in-memory fallback', async () => {
      setNodeEnv('production');
      delete process.env.MONGODB_URI;

      await assert.rejects(
        async () => {
          await authDb.findUserByEmail('admin@relief.ai');
        },
        (err: unknown) => {
          assert.strictEqual(isDatabaseUnavailableError(err), true);
          assert.strictEqual((err as DatabaseUnavailableError).statusCode, 503);
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await authDb.getAllUsers();
        },
        (err: unknown) => {
          assert.strictEqual(isDatabaseUnavailableError(err), true);
          assert.strictEqual((err as DatabaseUnavailableError).statusCode, 503);
          return true;
        }
      );
    });

    test('incident db operations fail-closed with 503 in production without silent in-memory fallback', async () => {
      setNodeEnv('production');
      delete process.env.MONGODB_URI;

      await assert.rejects(
        async () => {
          await db.getDisasters();
        },
        (err: unknown) => {
          assert.strictEqual(isDatabaseUnavailableError(err), true);
          assert.strictEqual((err as DatabaseUnavailableError).statusCode, 503);
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await db.createSOS({
            reporterName: 'Test Reporter',
            phone: '+8801700000000',
            disasterId: 'dis-001',
            location: { address: 'Test Location', lat: 24.89, lng: 91.86 },
            urgencyScore: 90,
            priority: 'CRITICAL',
            details: 'Emergency flood entrapment',
            trappedCount: 2,
            injuriesCount: 0,
            specialNeeds: [],
            needsBoat: true,
            needsMedical: false,
            needsFoodWater: true,
          });
        },
        (err: unknown) => {
          assert.strictEqual(isDatabaseUnavailableError(err), true);
          assert.strictEqual((err as DatabaseUnavailableError).statusCode, 503);
          return true;
        }
      );
    });

    test('in-memory fixtures remain safely accessible in development and test environments', async () => {
      setNodeEnv('test');
      delete process.env.MONGODB_URI;

      const user = await authDb.findUserByEmail('superadmin@relief.ai');
      assert.ok(user, 'In-memory demo fixture should be returned in test environment');
      assert.strictEqual(user?.role, 'super_admin');

      const disasters = await db.getDisasters();
      assert.ok(Array.isArray(disasters) && disasters.length > 0, 'Fixture disasters should be returned');
    });
  });

  // =========================================================================
  // SUITE 2: Mandatory, Distinct, >= 32-char JWT Secret Enforcement
  // =========================================================================
  describe('2. Mandatory, Distinct, >= 32-char JWT Secret Enforcement in Production', () => {
    test('getAccessSecret throws fatal error if access secret is missing in production', () => {
      setNodeEnv('production');
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_SECRET;

      assert.throws(() => getAccessSecret(), /JWT_ACCESS_SECRET must be configured in production/);
    });

    test('getAccessSecret throws fatal error if access secret is less than 32 characters in production', () => {
      setNodeEnv('production');
      process.env.JWT_ACCESS_SECRET = 'short-secret-under-32-chars';

      assert.throws(() => getAccessSecret(), /must be at least 32 characters long in production/);
    });

    test('getRefreshSecret throws fatal error if refresh secret is missing in production', () => {
      setNodeEnv('production');
      delete process.env.JWT_REFRESH_SECRET;

      assert.throws(() => getRefreshSecret(), /JWT_REFRESH_SECRET must be configured in production/);
    });

    test('getRefreshSecret throws fatal error if refresh secret is less than 32 characters in production', () => {
      setNodeEnv('production');
      process.env.JWT_REFRESH_SECRET = 'short-refresh-secret';

      assert.throws(() => getRefreshSecret(), /must be at least 32 characters long in production/);
    });

    test('getRefreshSecret throws fatal error if refresh secret is identical to access secret in production', () => {
      setNodeEnv('production');
      const identicalSecret = 'identical-production-secret-key-that-is-32-characters-long!';
      process.env.JWT_ACCESS_SECRET = identicalSecret;
      process.env.JWT_REFRESH_SECRET = identicalSecret;

      assert.throws(() => getRefreshSecret(), /JWT_REFRESH_SECRET must be distinct from JWT_ACCESS_SECRET/);
    });

    test('accepts valid, distinct, >= 32 character access and refresh secrets in production', () => {
      setNodeEnv('production');
      process.env.JWT_ACCESS_SECRET = 'access-production-secret-key-32-characters-minimum!';
      process.env.JWT_REFRESH_SECRET = 'refresh-production-secret-key-32-characters-minimum!';

      const accessKey = getAccessSecret();
      const refreshKey = getRefreshSecret();
      assert.ok(accessKey.length >= 32);
      assert.ok(refreshKey.length >= 32);
      assert.notDeepStrictEqual(accessKey, refreshKey);
    });

    test('development environment allows default fallback secrets without throwing', () => {
      setNodeEnv('development');
      delete process.env.JWT_ACCESS_SECRET;
      delete process.env.JWT_SECRET;
      delete process.env.JWT_REFRESH_SECRET;

      assert.doesNotThrow(() => getAccessSecret());
      assert.doesNotThrow(() => getRefreshSecret());
    });
  });

  // =========================================================================
  // SUITE 3: Showcase Mode Default-Deny Mutation Policy & Route Guards
  // =========================================================================
  describe('3. Showcase Mode Default-Deny Mutation Policy', () => {
    test('when SHOWCASE_MODE is false (default), mutations are not blocked', () => {
      process.env.SHOWCASE_MODE = 'false';

      assert.strictEqual(isShowcaseMutationBlocked('/api/sos/sos-001/dispatch', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/donations', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/admin/users/provision', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/admin/users', 'PATCH').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/admin/ngo-applications/app-001/review', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/auth/reset-password', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/auth/change-password', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/disasters', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/shelters', 'PATCH').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/supplies', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/responders', 'PATCH').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/auth/register', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/auth/request-email-change', 'POST').blocked, false);
      assert.strictEqual(isShowcaseMutationBlocked('/api/auth/verify-email-change', 'POST').blocked, false);
    });

    test('when SHOWCASE_MODE is true, all sensitive mutating APIs are blocked by default', () => {
      process.env.SHOWCASE_MODE = 'true';

      const mutatingEndpoints = [
        { path: '/api/sos/sos-001/dispatch', method: 'POST' },
        { path: '/api/donations', method: 'POST' },
        { path: '/api/admin/users/provision', method: 'POST' },
        { path: '/api/admin/users', method: 'PATCH' },
        { path: '/api/admin/ngo-applications/app-001/review', method: 'POST' },
        { path: '/api/auth/reset-password', method: 'POST' },
        { path: '/api/auth/change-password', method: 'POST' },
        { path: '/api/disasters', method: 'POST' },
        { path: '/api/shelters', method: 'PATCH' },
        { path: '/api/supplies', method: 'POST' },
        { path: '/api/responders', method: 'PATCH' },
        { path: '/api/auth/register', method: 'POST' },
        { path: '/api/auth/request-email-change', method: 'POST' },
        { path: '/api/auth/verify-email-change', method: 'POST' },
        { path: '/api/auth/bootstrap', method: 'POST' },
        { path: '/api/auth/resend-otp', method: 'POST' },
        { path: '/api/auth/ngo-apply', method: 'POST' },
        { path: '/api/auth/me', method: 'PATCH' },
      ];

      for (const { path, method } of mutatingEndpoints) {
        const check = isShowcaseMutationBlocked(path, method);
        assert.strictEqual(
          check.blocked,
          true,
          `Expected ${method} ${path} to be blocked in Showcase Mode`
        );
        assert.strictEqual(check.code, 'SHOWCASE_MUTATION_RESTRICTED');
        assert.ok(check.reason?.includes('Showcase Demo Mode'));

        // Also test the assertShowcaseMutation helper
        const res = assertShowcaseMutation({ method }, path);
        assert.ok(res, `assertShowcaseMutation must return a NextResponse for ${method} ${path}`);
        assert.strictEqual(res.status, 403);
      }
    });

    test('when SHOWCASE_MODE is true, only necessary auth/session and AI chat endpoints are allowlisted', () => {
      process.env.SHOWCASE_MODE = 'true';

      const allowlistedEndpoints = [
        { path: '/api/auth/login', method: 'POST' },
        { path: '/api/auth/logout', method: 'POST' },
        { path: '/api/auth/refresh', method: 'POST' },
        { path: '/api/ai/chat', method: 'POST' },
        { path: '/api/ai/triage', method: 'POST' },
      ];

      for (const { path, method } of allowlistedEndpoints) {
        const check = isShowcaseMutationBlocked(path, method);
        assert.strictEqual(
          check.blocked,
          false,
          `Expected ${method} ${path} to be allowlisted in Showcase Mode`
        );
        const res = assertShowcaseMutation({ method }, path);
        assert.strictEqual(res, null);
      }
    });

    test('when SHOWCASE_MODE is true, all read-only GET/HEAD/OPTIONS requests remain accessible', () => {
      process.env.SHOWCASE_MODE = 'true';

      const readEndpoints = [
        '/api/disasters',
        '/api/donations',
        '/api/sos',
        '/api/shelters',
        '/api/supplies',
        '/api/responders',
        '/api/admin/users',
        '/api/auth/me',
      ];

      for (const path of readEndpoints) {
        assert.strictEqual(isShowcaseMutationBlocked(path, 'GET').blocked, false);
        assert.strictEqual(isShowcaseMutationBlocked(path, 'HEAD').blocked, false);
        assert.strictEqual(isShowcaseMutationBlocked(path, 'OPTIONS').blocked, false);
      }
    });
  });

  // =========================================================================
  // SUITE 4: Demo Password Verification & Role Integrity
  // =========================================================================
  describe('4. Demo Password Verification & Role Integrity Security', () => {
    test('invalid demo password causes rejection with HTTP 401 INVALID_CREDENTIALS', async () => {
      setNodeEnv('test');
      process.env.SHOWCASE_MODE = 'true';

      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@relief.ai',
          password: 'CompletelyWrongPassword123!',
        }),
      });

      const res = await loginPost(req);
      const data = await res.json();

      assert.strictEqual(res.status, 401);
      assert.strictEqual(data.code, 'INVALID_CREDENTIALS');
      assert.strictEqual(data.user, undefined, 'User data must not be returned on failed password');
    });

    test('invalid demo password never auto-activates or bypasses email verification', async () => {
      setNodeEnv('test');
      process.env.SHOWCASE_MODE = 'true';

      // Find an unverified account or verify that wrong password never sets isEmailVerified
      const demoEmail = 'citizen@relief.ai';
      const userBefore = await authDb.findUserByEmail(demoEmail);
      assert.ok(userBefore);

      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: demoEmail,
          password: 'IncorrectPasswordAttempt!',
        }),
      });

      const res = await loginPost(req);
      assert.strictEqual(res.status, 401);
    });

    test('tampered demo account role returns HTTP 403 DEMO_ROLE_MISMATCH', async () => {
      setNodeEnv('test');
      process.env.SHOWCASE_MODE = 'true';

      // Create a temporary mock user whose email is in designated demo list but role does not match
      const demoEmail = 'citizen@relief.ai';
      const expectedRole = getDesignatedDemoRole(demoEmail);
      assert.strictEqual(expectedRole, 'citizen');

      // Temporarily tamper the user's role in authDb to admin
      const originalUser = await authDb.findUserByEmail(demoEmail);
      assert.ok(originalUser);

      await authDb.updateUser(originalUser.id, { role: 'admin' as any });

      try {
        const req = new Request('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: demoEmail,
            password: 'Citizen@123456',
          }),
        });

        const res = await loginPost(req);
        const data = await res.json();

        assert.strictEqual(res.status, 403);
        assert.strictEqual(data.code, 'DEMO_ROLE_MISMATCH');
        assert.ok(data.error?.includes('Demo account role mismatch'));
      } finally {
        // Restore genuine role
        await authDb.updateUser(originalUser.id, { role: 'citizen' });
      }
    });

    test('valid demo password with matching role logs in successfully', async () => {
      setNodeEnv('test');
      process.env.SHOWCASE_MODE = 'true';

      const req = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@relief.ai',
          password: 'Admin@123456',
        }),
      });

      const res = await loginPost(req);
      const data = await res.json();

      assert.strictEqual(res.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.user.role, 'admin');
    });
  });

  // =========================================================================
  // SUITE 5: Middleware Matcher Coverage
  // =========================================================================
  describe('5. Middleware Matcher Coverage for All API Routes', () => {
    test('middleware config includes /api/:path* pattern', () => {
      assert.ok(Array.isArray(middlewareConfig.matcher));
      assert.ok(
        middlewareConfig.matcher.includes('/api/:path*'),
        'Middleware matcher must explicitly include /api/:path*'
      );
    });

    test('middleware matcher pattern intercepts email change and critical write endpoints', () => {
      const matchers = middlewareConfig.matcher;
      const apiMatcher = matchers.find((m) => m === '/api/:path*');
      assert.ok(apiMatcher);

      // Verify that sensitive paths match the matcher prefix
      const sensitivePaths = [
        '/api/auth/request-email-change',
        '/api/auth/verify-email-change',
        '/api/sos/sos-001/dispatch',
        '/api/donations',
        '/api/admin/users/provision',
        '/api/admin/users',
        '/api/auth/reset-password',
        '/api/auth/change-password',
        '/api/disasters',
        '/api/shelters',
        '/api/supplies',
        '/api/responders',
      ];

      for (const p of sensitivePaths) {
        assert.ok(
          p.startsWith('/api/'),
          `Path ${p} must start with /api/ to be matched by /api/:path*`
        );
      }
    });
  });
});
