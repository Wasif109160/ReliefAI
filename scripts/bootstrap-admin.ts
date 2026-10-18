/**
 * ReliefAI Production Admin Bootstrap Utility
 *
 * Secure, one-time bootstrap script designed for initial platform deployment.
 *
 * Usage:
 *   npx tsx scripts/bootstrap-admin.ts
 *
 * Environment Variables:
 *   BOOTSTRAP_ADMIN_EMAIL    - The email address of the initial administrator (required)
 *   BOOTSTRAP_ADMIN_PASSWORD - The password for the initial administrator (min 8 chars)
 *   BOOTSTRAP_ADMIN_NAME     - The display name of the administrator (optional)
 *   ADMIN_BOOTSTRAP_SECRET   - Optional deployment token verification
 */

import crypto from 'crypto';
import fs from 'fs';
import { connectToDatabase, isMongoConfigured } from '../src/lib/mongodb';
import { authDb } from '../src/lib/server/auth-db';

// Load environment variables respecting Next.js precedence: .env.local overrides .env
if (!process.env.MONGODB_URI) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

async function bootstrap() {
  console.log('----------------------------------------------------');
  console.log('ReliefAI Emergency Incident Platform - Admin Bootstrap');
  console.log('----------------------------------------------------');

  if (isMongoConfigured()) {
    try {
      console.log('[Bootstrap] Connecting to database...');
      await connectToDatabase();
      console.log('[Bootstrap] Database connection established.');
    } catch (err: any) {
      console.error('[Bootstrap Error] Failed to connect to database:', err.message);
      process.exit(1);
    }
  }

  // 1. One-time check: Enforce that no administrator account currently exists
  const hasAdmin = await authDb.hasAdminUser();
  if (hasAdmin) {
    console.error('[Bootstrap Blocked] An administrator account already exists in this database.');
    console.error('For security reasons, bootstrap is locked once an admin account is present.');
    console.error('To manage users, sign in as an existing administrator and use the Admin Portal.');
    process.exit(1);
  }

  // 2. Validate input parameters
  const email = (process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  let password = (process.env.BOOTSTRAP_ADMIN_PASSWORD || '').trim();
  const name = (process.env.BOOTSTRAP_ADMIN_NAME || 'System Administrator').trim();

  if (!email || !email.includes('@')) {
    console.error('[Bootstrap Error] Missing or invalid BOOTSTRAP_ADMIN_EMAIL environment variable.');
    console.error('Please specify a valid email address via BOOTSTRAP_ADMIN_EMAIL.');
    process.exit(1);
  }

  let generated = false;
  if (!password) {
    // Generate a cryptographically strong 16-character password if not supplied
    password = crypto.randomBytes(12).toString('base64url') + '!1Aa';
    generated = true;
  } else if (password.length < 8) {
    console.error('[Bootstrap Error] BOOTSTRAP_ADMIN_PASSWORD must be at least 8 characters long.');
    process.exit(1);
  }

  // 3. Create administrator account with secure bcrypt hash
  const adminUser = await authDb.createUser({
    name,
    displayName: name,
    email,
    password, // Hashed with bcrypt (10 rounds) in authDb.createUser
    role: 'admin',
    isEmailVerified: true,
    organization: 'ReliefAI Command & Control Authority',
    badgeNumber: `BD-ADM-ROOT-${Date.now().toString().slice(-4)}`,
    assignedZone: 'National Incident Operations Center (EOC)',
  });

  console.log('\n[Bootstrap Success] Administrator account successfully provisioned!');
  console.log(`- User ID:       ${adminUser.id}`);
  console.log(`- Email:         ${adminUser.email}`);
  console.log(`- Assigned Role: ${adminUser.role}`);
  console.log(`- Verified:      ${adminUser.isEmailVerified}`);

  if (generated) {
    console.log('\n================== IMPORTANT CREDENTIAL NOTICE ==================');
    console.log(`One-Time Generated Password: ${password}`);
    console.log('Please record this password securely immediately.');
    console.log('You will be prompted to change your password upon logging in.');
    console.log('=================================================================\n');
  } else {
    console.log('\nPassword configured from BOOTSTRAP_ADMIN_PASSWORD environment variable.');
  }

  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Fatal Error]:', err);
  process.exit(1);
});
