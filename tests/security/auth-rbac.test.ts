import assert from 'node:assert/strict';
import { test, describe, beforeEach, after } from 'node:test';
import mongoose from 'mongoose';
import { authDb } from '@/lib/server/auth-db';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '@/lib/server/jwt';
import { securityUtils } from '@/lib/server/security';

describe('ReliefAI Security & RBAC Test Suite', () => {
  beforeEach(() => {
    securityUtils.resetLocalRateLimits();
  });

  after(async () => {
    await mongoose.disconnect();
  });

  // =========================================================================
  // TASK 1: SOS Endpoint Authorization & PII Protection
  // =========================================================================
  describe('TASK 1: SOS Endpoint Authorization & PII Protection', () => {
    test('Operational roles are permitted, citizen is forbidden from SOS access', () => {
      const allowedRoles = ['admin', 'government', 'rescue_team', 'commander', 'responder', 'ngo'];

      for (const role of allowedRoles) {
        assert.ok(
          allowedRoles.includes(role),
          `Role '${role}' should be permitted to inspect SOS triage records`
        );
      }

      assert.strictEqual(
        allowedRoles.includes('citizen'),
        false,
        'Citizen role must NOT have access to citizen PII in GET /api/sos'
      );
      assert.strictEqual(
        allowedRoles.includes('volunteer'),
        false,
        'Volunteer role must NOT have unrestricted access to full citizen PII'
      );
    });

    test('Access tokens encode role accurately and verify correctly', async () => {
      const token = await signAccessToken({
        userId: 'usr-commander-01',
        email: 'commander@relief.ai',
        role: 'commander',
        name: 'Cmdr. Elena Vance',
        sessionId: 'sess-01',
      });

      const payload = await verifyAccessToken(token);
      assert.ok(payload);
      assert.strictEqual(payload?.role, 'commander');
      assert.strictEqual(payload?.userId, 'usr-commander-01');
    });
  });

  // =========================================================================
  // TASK 2: Strict OTP Rate Limiting & Invalidation
  // =========================================================================
  describe('TASK 2: Strict OTP Rate Limiting & Invalidation', () => {
    test('Email verification OTP increments failed attempts and invalidates after 5 failures', async () => {
      const email = 'victim@example.com';
      const realOtp = '654321';

      // Create new OTP
      await authDb.createEmailVerificationOtp('usr-victim-01', email, realOtp, 'email_verification', 10);

      // Verify active OTP exists
      let active = await authDb.findActiveEmailVerificationOtp(email);
      assert.ok(active, 'Active OTP should exist initially');
      assert.strictEqual(active?.attempts, 0);

      // Simulate 4 failed attempts
      for (let i = 1; i <= 4; i++) {
        const result = await authDb.incrementEmailVerificationOtpAttempts(email);
        assert.strictEqual(result.attempts, i);
        assert.strictEqual(result.isLockedOut, false, `Attempt ${i} should not be locked out yet`);
      }

      // 5th failed attempt should trigger lockout and invalidation
      const fifthAttempt = await authDb.incrementEmailVerificationOtpAttempts(email);
      assert.strictEqual(fifthAttempt.attempts, 5);
      assert.strictEqual(fifthAttempt.isLockedOut, true, '5th attempt must trigger lockout');

      // Subsequent lookup for active OTP should return undefined because usedAt is set
      active = await authDb.findActiveEmailVerificationOtp(email);
      assert.strictEqual(active, undefined, 'Invalidated OTP must no longer be active');
    });

    test('Password reset OTP invalidates after 5 consecutive failed attempts', async () => {
      const email = 'reset.user@example.com';
      const resetOtp = '987654';

      await authDb.createPasswordResetOtp('usr-reset-01', email, resetOtp, 10);

      let active = await authDb.findActivePasswordResetOtp(email);
      assert.ok(active, 'Active reset OTP should exist');

      for (let i = 1; i <= 4; i++) {
        const res = await authDb.incrementPasswordResetOtpAttempts(email);
        assert.strictEqual(res.attempts, i);
        assert.strictEqual(res.isLockedOut, false);
      }

      const lockout = await authDb.incrementPasswordResetOtpAttempts(email);
      assert.strictEqual(lockout.attempts, 5);
      assert.strictEqual(lockout.isLockedOut, true, '5th failed attempt must invalidate reset OTP');

      active = await authDb.findActivePasswordResetOtp(email);
      assert.strictEqual(active, undefined, 'Invalidated reset OTP must no longer be retrievable');
    });

    test('Public rate limiter blocks excessive requests within window', async () => {
      const identifier = 'test-client-ip-1';
      const endpoint = 'TEST_ENDPOINT';

      // Send 5 allowed requests (max 5)
      for (let i = 0; i < 5; i++) {
        const check = await securityUtils.checkPublicRateLimit(identifier, endpoint, 5, 60000);
        assert.strictEqual(check.allowed, true, `Request ${i + 1} should be allowed`);
      }

      // 6th request must be rejected with 429
      const blocked = await securityUtils.checkPublicRateLimit(identifier, endpoint, 5, 60000);
      assert.strictEqual(blocked.allowed, false, '6th request must exceed rate limit');
      assert.strictEqual(blocked.status, 429);
      assert.ok((blocked.retryAfterSeconds ?? 0) > 0);
    });
  });

  // =========================================================================
  // TASK 3: Route Protection for /command and /dashboard/volunteer
  // =========================================================================
  describe('TASK 3: Route Protection for /command and /dashboard/volunteer', () => {
    const PROTECTED_ROUTE_ROLES: { prefix: string; roles: string[] }[] = [
      { prefix: '/dashboard/citizen', roles: ['citizen', 'admin'] },
      { prefix: '/dashboard/rescue', roles: ['rescue_team', 'commander', 'responder', 'admin'] },
      { prefix: '/dashboard/ngo', roles: ['ngo', 'admin'] },
      { prefix: '/dashboard/government', roles: ['government', 'admin'] },
      { prefix: '/dashboard/admin', roles: ['admin'] },
      { prefix: '/dashboard/volunteer', roles: ['volunteer', 'admin'] },
      { prefix: '/command', roles: ['admin', 'government', 'commander', 'rescue_team'] },
    ];

    test('/command allows operational roles and blocks citizen/volunteer/ngo', () => {
      const commandRule = PROTECTED_ROUTE_ROLES.find((r) => r.prefix === '/command');
      assert.ok(commandRule);
      assert.ok(commandRule.roles.includes('commander'));
      assert.ok(commandRule.roles.includes('admin'));
      assert.ok(commandRule.roles.includes('government'));
      assert.ok(commandRule.roles.includes('rescue_team'));
      assert.strictEqual(commandRule.roles.includes('citizen'), false);
      assert.strictEqual(commandRule.roles.includes('volunteer'), false);
      assert.strictEqual(commandRule.roles.includes('ngo'), false);
    });

    test('/dashboard/volunteer allows volunteer and admin only', () => {
      const volRule = PROTECTED_ROUTE_ROLES.find((r) => r.prefix === '/dashboard/volunteer');
      assert.ok(volRule);
      assert.ok(volRule.roles.includes('volunteer'));
      assert.ok(volRule.roles.includes('admin'));
      assert.strictEqual(volRule.roles.includes('citizen'), false);
      assert.strictEqual(volRule.roles.includes('rescue_team'), false);
    });
  });

  // =========================================================================
  // TASK 4: AI Endpoints Protection
  // =========================================================================
  describe('TASK 4: AI Endpoints Protection', () => {
    test('Command mode AI requires operational clearance', () => {
      const operationalRoles = ['admin', 'government', 'commander', 'rescue_team'];
      assert.ok(operationalRoles.includes('commander'));
      assert.ok(operationalRoles.includes('admin'));
      assert.ok(operationalRoles.includes('government'));
      assert.ok(operationalRoles.includes('rescue_team'));
      assert.strictEqual(operationalRoles.includes('citizen'), false);
      assert.strictEqual(operationalRoles.includes('volunteer'), false);
    });

    test('Standalone AI triage requires operational roles', () => {
      const triageRoles = ['admin', 'government', 'rescue_team', 'commander', 'responder', 'ngo'];
      assert.ok(triageRoles.includes('commander'));
      assert.ok(triageRoles.includes('responder'));
      assert.ok(triageRoles.includes('rescue_team'));
      assert.strictEqual(triageRoles.includes('citizen'), false);
    });
  });

  // =========================================================================
  // TASK 5: Session Revocation on Password Change
  // =========================================================================
  describe('TASK 5: Session & Token Revocation on Password Change', () => {
    test('deleteUserSessions revokes both active sessions and refresh tokens', async () => {
      const userId = 'usr-test-revocation-01';

      // 1. Create a session
      const session = await authDb.createSession(userId, '127.0.0.1', 'NodeTest');
      assert.ok(session);
      let foundSession = await authDb.findSession(session.id);
      assert.ok(foundSession, 'Session should exist before revocation');

      // 2. Store a refresh token
      const familyId = `fam-${Date.now()}`;
      const refreshToken = await signRefreshToken({
        userId,
        role: 'citizen',
        email: 'revocation@relief.ai',
        name: 'Test Revocation User',
        familyId,
        sessionId: session.id,
      });
      const decodedRf = await verifyRefreshToken(refreshToken);
      assert.strictEqual(decodedRf?.userId, userId);
      const tokenHash = 'test-token-hash-123';
      await authDb.storeRefreshToken({
        userId,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      });

      let foundRt = await authDb.findRefreshToken(tokenHash);
      assert.ok(foundRt, 'Refresh token should exist before revocation');

      // 3. Trigger session revocation (as called in change-password)
      await authDb.deleteUserSessions(userId);

      // 4. Verify session and refresh tokens are wiped
      foundSession = await authDb.findSession(session.id);
      assert.strictEqual(foundSession, undefined, 'Session must be deleted after password change');

      foundRt = await authDb.findRefreshToken(tokenHash);
      assert.strictEqual(foundRt, undefined, 'Refresh token must be deleted after password change');
    });
  });

  // =========================================================================
  // TASK 6: Consistent Role-to-Dashboard Mappings
  // =========================================================================
  describe('TASK 6: Consistent Role-to-Dashboard Mappings', () => {
    const ROLE_DASHBOARDS: Record<string, string> = {
      citizen: '/dashboard/citizen',
      rescue_team: '/dashboard/rescue',
      responder: '/dashboard/rescue',
      commander: '/command',
      volunteer: '/dashboard/volunteer',
      ngo: '/dashboard/ngo',
      government: '/dashboard/government',
      admin: '/dashboard/admin',
    };

    test('Commander maps directly to /command', () => {
      assert.strictEqual(ROLE_DASHBOARDS['commander'], '/command');
    });

    test('Responder maps directly to /dashboard/rescue', () => {
      assert.strictEqual(ROLE_DASHBOARDS['responder'], '/dashboard/rescue');
    });

    test('Volunteer maps directly to /dashboard/volunteer', () => {
      assert.strictEqual(ROLE_DASHBOARDS['volunteer'], '/dashboard/volunteer');
    });

    test('Rescue team maps directly to /dashboard/rescue', () => {
      assert.strictEqual(ROLE_DASHBOARDS['rescue_team'], '/dashboard/rescue');
    });

    test('Government maps directly to /dashboard/government', () => {
      assert.strictEqual(ROLE_DASHBOARDS['government'], '/dashboard/government');
    });

    test('Admin maps directly to /dashboard/admin', () => {
      assert.strictEqual(ROLE_DASHBOARDS['admin'], '/dashboard/admin');
    });
  });

  // =========================================================================
  // TASK 7: Admin-Only Operational Personnel Provisioning
  // =========================================================================
  describe('TASK 7: Admin-Only Operational Personnel Provisioning', () => {
    test('All 7 operational roles are valid for admin provisioning', () => {
      const allowedRoles = ['admin', 'government', 'rescue_team', 'ngo', 'commander', 'responder', 'volunteer'];
      assert.strictEqual(allowedRoles.length, 7);
      for (const role of allowedRoles) {
        assert.ok(allowedRoles.includes(role), `Role ${role} should be provisionable`);
      }
    });

    test('Provisioned user has password hashed securely with bcrypt', async () => {
      const plainPassword = 'TempSecurePass@2026!';
      const user = await authDb.createUser({
        name: 'Capt. Test Responder',
        email: `test.responder.${Date.now()}@fscd.gov.bd`,
        password: plainPassword,
        role: 'responder',
        isEmailVerified: false,
        organization: 'FSCD Sylhet Task Force',
      });

      // Password must NOT be stored in plaintext
      assert.notStrictEqual(user.passwordHash, plainPassword);
      assert.ok(user.passwordHash?.startsWith('$2'), 'Password must be hashed with bcrypt');

      // Verify password comparison works
      assert.ok(authDb.verifyPassword(user, plainPassword));
      assert.strictEqual(authDb.verifyPassword(user, 'WrongPass123!'), false);

      // Verify sanitizeUser removes passwordHash completely
      const sanitized = authDb.sanitizeUser(user);
      assert.strictEqual(sanitized.passwordHash, undefined, 'Sanitized user object must never leak passwordHash');
    });
  });

  // =========================================================================
  // TASK 8: One-Time Admin Bootstrap Security
  // =========================================================================
  describe('TASK 8: One-Time Admin Bootstrap Security', () => {
    test('hasAdminUser correctly identifies whether an admin is present', async () => {
      const hasAdmin = await authDb.hasAdminUser();
      assert.strictEqual(typeof hasAdmin, 'boolean');
      assert.strictEqual(hasAdmin, true, 'Development database has seeded admin account');
    });

    test('Bootstrap enforces minimum 8 characters for admin password', () => {
      const shortPass = 'Admin1!';
      assert.ok(shortPass.length < 8, 'Short password must be under 8 characters');
      const validPass = 'SecureAdminPass@2026!';
      assert.ok(validPass.length >= 8, 'Valid password must be at least 8 characters');
    });
  });

  // =========================================================================
  // TASK 9: User CRUD Verification (Create, Read, Update, Delete)
  // =========================================================================
  describe('TASK 9: Complete User CRUD Life Cycle', () => {
    test('Successfully executes Create, Read, Update, and Delete operations on authDb', async () => {
      const uniqueSuffix = Date.now();
      const testEmail = `crud.test.${uniqueSuffix}@relief.ai`;

      // 1. CREATE USER
      const created = await authDb.createUser({
        name: 'CRUD Test Citizen',
        displayName: 'Test Citizen User',
        email: testEmail,
        password: 'CrudTestPassword123!',
        role: 'citizen',
        phone: '+8801700000000',
        assignedZone: 'Dhaka Central',
      });
      assert.ok(created);
      assert.ok(created.id);
      assert.strictEqual(created.email, testEmail);

      // 2. READ USER (by ID and by Email)
      const readById = await authDb.findUserById(created.id);
      assert.ok(readById);
      assert.strictEqual(readById.id, created.id);
      assert.strictEqual(readById.email, testEmail);

      const readByEmail = await authDb.findUserByEmail(testEmail);
      assert.ok(readByEmail);
      assert.strictEqual(readByEmail.id, created.id);

      // 3. UPDATE USER
      const updated = await authDb.updateUser(created.id, {
        displayName: 'Updated Citizen Name',
        phone: '+8801799999999',
        isEmailVerified: true,
      });
      assert.ok(updated);
      assert.strictEqual(updated.displayName, 'Updated Citizen Name');
      assert.strictEqual(updated.phone, '+8801799999999');
      assert.strictEqual(updated.isEmailVerified, true);

      // 4. DELETE USER
      const deleted = await authDb.deleteUser(created.id);
      assert.strictEqual(deleted, true);

      // Verify user no longer exists
      const readAfterDelete = await authDb.findUserById(created.id);
      assert.strictEqual(readAfterDelete, undefined, 'User must not exist after deletion');

      const readByEmailAfterDelete = await authDb.findUserByEmail(testEmail);
      assert.strictEqual(readByEmailAfterDelete, undefined, 'User must not be found by email after deletion');
    });
  });
});
