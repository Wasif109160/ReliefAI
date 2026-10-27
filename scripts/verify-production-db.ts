/**
 * ReliefAI Production Database & Admin Account Verification Utility
 *
 * Inspects the target PostgreSQL connection, reports database name and cluster host
 * with all credentials safely redacted, and checks whether an administrator
 * account exists. Never prints passwords, hashes, or secrets.
 *
 * Usage:
 *   npx tsx scripts/verify-production-db.ts
 *   DATABASE_URL="<connection_string>" npx tsx scripts/verify-production-db.ts
 */

import fs from 'fs';
import { prisma, sanitizeDatabaseUrl } from '../src/lib/prisma';

// Load environment variables respecting Next.js precedence: .env.local overrides .env
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

async function verify() {
  console.log('====================================================');
  console.log('ReliefAI - Target PostgreSQL Database & Admin Verification');
  console.log('====================================================');

  const uri = process.env.DATABASE_URL;

  if (!uri || uri.trim().length === 0) {
    console.error('[Error] DATABASE_URL environment variable is NOT set.');
    console.error('Please configure DATABASE_URL in your environment or pass it inline:');
    console.error('  DATABASE_URL="postgresql://..." npx tsx scripts/verify-production-db.ts');
    process.exit(1);
  }

  const { sanitized, host, dbName } = sanitizeDatabaseUrl(uri);
  console.log(`\n1. Target Connection (Redacted):`);
  console.log(`   - Connection String : ${sanitized}`);
  console.log(`   - Host              : ${host}`);
  console.log(`   - Database Name     : ${dbName}`);

  console.log(`\n2. Connecting to PostgreSQL...`);
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    console.log(`   - Connection Status : CONNECTED SUCCESSFULLY (Latency: ${latency}ms)`);
  } catch (err: any) {
    console.error(`   - Connection Status : FAILED`);
    console.error(`   - Error Details     : ${err.message}`);
    process.exit(1);
  }

  console.log(`\n3. Inspecting User Accounts Table:`);
  try {
    const totalUsers = await prisma.user.count();
    const adminCount = await prisma.user.count({
      where: { role: { in: ['admin', 'super_admin'] } },
    });

    console.log(`   - Total Users in DB : ${totalUsers}`);
    console.log(`   - Total Admins in DB: ${adminCount}`);

    if (adminCount === 0) {
      console.log(`\n----------------------------------------------------`);
      console.log(`RESULT: NO ADMIN ACCOUNT FOUND`);
      console.log(`The target database has NO administrator accounts.`);
      console.log(`Bootstrap Status: UNLOCKED.`);
      console.log(`You can safely proceed with POST /api/auth/bootstrap.`);
      console.log(`----------------------------------------------------`);
    } else {
      console.log(`\nExisting Admin Account(s) (Credentials Masked):`);
      const admins = await prisma.user.findMany({
        where: { role: { in: ['admin', 'super_admin'] } },
        select: { id: true, email: true, displayName: true, name: true, role: true, createdAt: true, isEmailVerified: true },
      });
      for (const a of admins) {
        console.log(`   - Email: ${a.email} | Name: ${a.displayName || a.name || 'N/A'} | Role: ${a.role} | Verified: ${a.isEmailVerified} | Created: ${a.createdAt.toISOString()}`);
      }
      console.log(`\n----------------------------------------------------`);
      console.log(`RESULT: ADMIN ACCOUNT(S) ALREADY EXIST`);
      console.log(`The target database already has ${adminCount} administrator account(s).`);
      console.log(`Bootstrap Status: LOCKED.`);
      console.log(`POST /api/auth/bootstrap will reject attempts with HTTP 409 Conflict.`);
      console.log(`Sign in using an existing admin or request access from your team.`);
      console.log(`----------------------------------------------------`);
    }
  } catch (err: any) {
    console.error(`   - Query Error: ${err.message}`);
  } finally {
    await prisma.$disconnect();
    console.log(`\nDisconnected from database cleanly.`);
  }

  process.exit(0);
}

verify().catch((err) => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
