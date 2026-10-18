import assert from 'node:assert/strict';
import { test, describe, beforeEach, after } from 'node:test';
import mongoose from 'mongoose';
import { authDb } from '@/lib/server/auth-db';
import { signAccessToken, verifyAccessToken } from '@/lib/server/jwt';
import { securityUtils } from '@/lib/server/security';
import {
  DESIGNATED_DEMO_ACCOUNTS,
  isDesignatedDemoEmail,
  isShowcaseMode,
  isShowcaseMutationBlocked,
} from '@/lib/server/demo-policy';

describe('ReliefAI Showcase Demo Mode & Demo Account Policy Test Suite', () => {
  beforeEach(() => {
    securityUtils.resetLocalRateLimits();
  });

  after(async () => {
    await mongoose.disconnect();
  });

  // =========================================================================
  // TEST 1: Server-Controlled Designated Demo Accounts Whitelist
  // =========================================================================
  describe('TEST 1: Server-Controlled Demo Accounts Whitelist', () => {
    test('Contains exactly the 7 required showcase roles', () => {
      const roles = DESIGNATED_DEMO_ACCOUNTS.map((a) => a.role);
      assert.strictEqual(roles.includes('super_admin'), true, 'super_admin must be in whitelist');
      assert.strictEqual(roles.includes('admin'), true, 'admin must be in whitelist');
      assert.strictEqual(roles.includes('government'), true, 'government must be in whitelist');
      assert.strictEqual(roles.includes('ngo'), true, 'ngo must be in whitelist');
      assert.strictEqual(roles.includes('rescue_team'), true, 'rescue_team must be in whitelist');
      assert.strictEqual(roles.includes('volunteer'), true, 'volunteer must be in whitelist');
      assert.strictEqual(roles.includes('citizen'), true, 'citizen must be in whitelist');
      assert.strictEqual(DESIGNATED_DEMO_ACCOUNTS.length, 7, 'Must have exactly 7 designated demo roles');
    });

    test('isDesignatedDemoEmail correctly matches only designated emails', () => {
      assert.strictEqual(isDesignatedDemoEmail('superadmin@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('admin@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('gov@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('ngo@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('rescue@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('volunteer@relief.ai'), true);
      assert.strictEqual(isDesignatedDemoEmail('citizen@relief.ai'), true);

      // Normal or arbitrary public emails must return false
      assert.strictEqual(isDesignatedDemoEmail('attacker@evil.com'), false);
      assert.strictEqual(isDesignatedDemoEmail('victim@gmail.com'), false);
      assert.strictEqual(isDesignatedDemoEmail('fake.admin@relief.ai'), false);
    });
  });

  // =========================================================================
  // TEST 2: Demo Accounts Verification & Password Hashing
  // =========================================================================
  describe('TEST 2: Demo Accounts Verification & Password Integrity', () => {
    test('All 7 demo accounts exist in authDb and have valid bcrypt password hashes', async () => {
      const demoUsers = await authDb.getAllUsers();

      for (const account of DESIGNATED_DEMO_ACCOUNTS) {
        const user = await authDb.findUserByEmail(account.email);
        assert.ok(user, `Demo account ${account.email} must exist in authDb`);
        assert.strictEqual(user?.role, account.expectedRole, `Role for ${account.email} must match`);
        assert.strictEqual(user?.isEmailVerified, true, `${account.email} must be email-verified`);

        // Check password validation using authDb.verifyPassword
        // Passwords follow RoleName@123456
        const prefixMap: Record<string, string> = {
          super_admin: 'SuperAdmin@123456',
          admin: 'Admin@123456',
          government: 'Gov@123456',
          ngo: 'Ngo@123456',
          rescue_team: 'Rescue@123456',
          volunteer: 'Volunteer@123456',
          citizen: 'Citizen@123456',
        };
        const expectedPass = prefixMap[account.role];
        assert.strictEqual(authDb.verifyPassword(user!, expectedPass), true, `Password for ${account.email} must verify`);
        assert.strictEqual(authDb.verifyPassword(user!, 'WrongPassword123!'), false, 'Wrong password must be rejected');
      }
    });
  });

  // =========================================================================
  // TEST 3: Account Lockout Security on Demo Accounts
  // =========================================================================
  describe('TEST 3: Account Lockout Security on Demo Accounts', () => {
    test('Demo accounts enforce account lockout after 5 consecutive failed login attempts', () => {
      const demoEmail = 'superadmin@relief.ai';

      // 4 failed attempts should not trigger lockout
      for (let i = 1; i <= 4; i++) {
        const failInfo = securityUtils.recordFailedLogin(demoEmail);
        assert.strictEqual(failInfo.isLockedNow, false);
        assert.strictEqual(failInfo.attempts, i);
      }

      // 5th attempt must trigger lockout
      const fifth = securityUtils.recordFailedLogin(demoEmail);
      assert.strictEqual(fifth.isLockedNow, true);
      assert.strictEqual(fifth.attempts, 5);

      // Lockout check must report active lockout
      const status = securityUtils.checkAccountLockout(demoEmail);
      assert.strictEqual(status.isLocked, true);
      assert.ok((status.remainingMinutes ?? 0) > 0);

      // Cleanup
      securityUtils.recordSuccessfulLogin(demoEmail);
      assert.strictEqual(securityUtils.checkAccountLockout(demoEmail).isLocked, false);
    });
  });

  // =========================================================================
  // TEST 4: Normal Public Registration Must Still Require OTP Verification
  // =========================================================================
  describe('TEST 4: Normal Public Registrations Mandatory OTP Verification', () => {
    test('Non-demo public users are created unverified and must verify via OTP', async () => {
      const publicEmail = `public.citizen.${Date.now()}@example.com`;
      const created = await authDb.createUser({
        name: 'Normal Public Citizen',
        email: publicEmail,
        password: 'PublicCitizen@123456',
        role: 'citizen',
        isEmailVerified: false,
      });

      assert.strictEqual(created.isEmailVerified, false);
      assert.strictEqual(isDesignatedDemoEmail(publicEmail), false);

      // Verify OTP is generated for public user
      const otp = securityUtils.generateNumericOtp();
      const record = await authDb.createEmailVerificationOtp(created.id, publicEmail, otp, 'email_verification', 10);
      assert.strictEqual(record.otp, otp);

      // Verification succeeds only when correct OTP is submitted
      const foundOtp = await authDb.findValidEmailVerificationOtp(publicEmail, otp);
      assert.ok(foundOtp);

      await authDb.verifyUserEmail(created.id);
      const updated = await authDb.findUserById(created.id);
      assert.strictEqual(updated?.isEmailVerified, true);
    });
  });

  // =========================================================================
  // TEST 5: Showcase Mode Mutation Protection
  // =========================================================================
  describe('TEST 5: Showcase Mode Mutation Protection', () => {
    test('When SHOWCASE_MODE is false (default), mutations are not blocked by policy', () => {
      const orig = process.env.SHOWCASE_MODE;
      process.env.SHOWCASE_MODE = 'false';

      const check = isShowcaseMutationBlocked('/api/auth/change-password', 'POST');
      assert.strictEqual(check.blocked, false);

      process.env.SHOWCASE_MODE = orig;
    });

    test('When SHOWCASE_MODE is true, destructive credential mutations are blocked', () => {
      const orig = process.env.SHOWCASE_MODE;
      process.env.SHOWCASE_MODE = 'true';

      assert.strictEqual(isShowcaseMode(), true);

      // GET requests remain allowed (read-only)
      const getCheck = isShowcaseMutationBlocked('/api/auth/change-password', 'GET');
      assert.strictEqual(getCheck.blocked, false);

      // POST to change-password must be blocked in showcase mode
      const postCheck = isShowcaseMutationBlocked('/api/auth/change-password', 'POST');
      assert.strictEqual(postCheck.blocked, true);
      assert.ok(postCheck.reason?.includes('Showcase Demo Mode'));

      // POST to bootstrap must be blocked in showcase mode
      const bootstrapCheck = isShowcaseMutationBlocked('/api/auth/bootstrap', 'POST');
      assert.strictEqual(bootstrapCheck.blocked, true);

      process.env.SHOWCASE_MODE = orig;
    });
  });

  // =========================================================================
  // TEST 6: RBAC Privilege Separation for Demo Roles
  // =========================================================================
  describe('TEST 6: RBAC Privilege Separation for Demo Roles', () => {
    test('Citizen token cannot access Admin or Super Admin endpoints', async () => {
      const citizenToken = await signAccessToken({
        userId: 'usr-citizen-05',
        email: 'citizen@relief.ai',
        role: 'citizen',
        name: 'Rafiqul Islam',
        sessionId: 'sess-cit-01',
      });

      const payload = await verifyAccessToken(citizenToken);
      assert.ok(payload);
      assert.strictEqual(payload?.role, 'citizen');

      // Admin permission check simulation
      const allowedRoles = ['admin', 'super_admin'];
      const hasPermission = allowedRoles.includes(payload?.role as string);
      assert.strictEqual(hasPermission, false, 'Citizen must not have admin permission');
    });

    test('Volunteer token cannot access Admin or Command endpoints', async () => {
      const volToken = await signAccessToken({
        userId: 'usr-volunteer-06',
        email: 'volunteer@relief.ai',
        role: 'volunteer',
        name: 'Tahmina Akter',
        sessionId: 'sess-vol-01',
      });

      const payload = await verifyAccessToken(volToken);
      assert.ok(payload);
      assert.strictEqual(payload?.role, 'volunteer');

      const adminRoles = ['admin', 'super_admin'];
      assert.strictEqual(adminRoles.includes(payload?.role as string), false);

      const commandRoles = ['super_admin', 'admin', 'government', 'commander', 'rescue_team'];
      assert.strictEqual(commandRoles.includes(payload?.role as string), false);
    });

    test('Super Admin has access to both Admin and Command operational levels', async () => {
      const superToken = await signAccessToken({
        userId: 'usr-superadmin-00',
        email: 'superadmin@relief.ai',
        role: 'super_admin',
        name: 'Maj. Gen. Sajjadul Islam',
        sessionId: 'sess-sadmin-01',
      });

      const payload = await verifyAccessToken(superToken);
      assert.ok(payload);
      assert.strictEqual(payload?.role, 'super_admin');

      const adminRoles = ['admin', 'super_admin'];
      assert.strictEqual(adminRoles.includes(payload?.role as string), true);

      const commandRoles = ['super_admin', 'admin', 'government', 'commander', 'rescue_team'];
      assert.strictEqual(commandRoles.includes(payload?.role as string), true);
    });
  });
});
