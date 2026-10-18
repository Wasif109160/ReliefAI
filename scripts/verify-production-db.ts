/**
 * ReliefAI Production Database & Admin Account Verification Utility
 *
 * Inspects the target MongoDB connection, reports database name and cluster host
 * with all credentials safely redacted, and checks whether an administrator
 * account exists. Never prints passwords, hashes, or secrets.
 *
 * Usage:
 *   npx tsx scripts/verify-production-db.ts
 *   MONGODB_URI="<connection_string>" npx tsx scripts/verify-production-db.ts
 */

import mongoose from 'mongoose';
import fs from 'fs';
import { UserModel } from '../src/lib/models/User';

// Load environment variables respecting Next.js precedence: .env.local overrides .env
if (!process.env.MONGODB_URI) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

function sanitizeMongoUri(uri: string): { sanitized: string; dbName: string; hosts: string } {
  try {
    // Basic regex or URL parsing
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(?:([^:]+):([^@]+)@)?([^/?]+)(?:\/([^?]+))?(?:\?(.*))?$/);
    if (!match) {
      return { sanitized: '[Invalid or non-standard URI format]', dbName: 'unknown', hosts: 'unknown' };
    }
    const [, protocol, , , hosts, dbName = 'default/reliefai'] = match;
    const sanitized = `${protocol}***:***@${hosts}/${dbName}`;
    return { sanitized, dbName, hosts };
  } catch {
    return { sanitized: '[Failed to parse URI]', dbName: 'unknown', hosts: 'unknown' };
  }
}

async function verify() {
  console.log('====================================================');
  console.log('ReliefAI - Target Database & Admin Verification');
  console.log('====================================================');

  const uri = process.env.MONGODB_URI;

  if (!uri || uri.trim().length === 0) {
    console.error('[Error] MONGODB_URI environment variable is NOT set.');
    console.error('Please configure MONGODB_URI in your environment or pass it inline:');
    console.error('  MONGODB_URI="mongodb+srv://..." npx tsx scripts/verify-production-db.ts');
    process.exit(1);
  }

  const { sanitized, dbName, hosts } = sanitizeMongoUri(uri);
  console.log(`\n1. Target Connection (Redacted):`);
  console.log(`   - Connection String : ${sanitized}`);
  console.log(`   - Cluster / Hosts   : ${hosts}`);
  console.log(`   - Database Name     : ${dbName}`);

  console.log(`\n2. Connecting to MongoDB...`);
  try {
    await mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`   - Connection Status : CONNECTED SUCCESSFULLY`);
    console.log(`   - Connected DB Name : ${mongoose.connection.name || dbName}`);
  } catch (err: any) {
    console.error(`   - Connection Status : FAILED`);
    console.error(`   - Error Details     : ${err.message}`);
    process.exit(1);
  }

  console.log(`\n3. Inspecting User Accounts Collection:`);
  try {
    const totalUsers = await UserModel.countDocuments();
    const adminCount = await UserModel.countDocuments({ role: 'admin' });

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
      const admins = await UserModel.find({ role: 'admin' }).select('id email displayName name role createdAt isEmailVerified').lean();
      for (const a of admins) {
        console.log(`   - Email: ${a.email} | Name: ${a.displayName || a.name || 'N/A'} | Verified: ${a.isEmailVerified} | Created: ${a.createdAt}`);
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
    await mongoose.disconnect();
    console.log(`\nDisconnected from database cleanly.`);
  }

  process.exit(0);
}

verify().catch((err) => {
  console.error('[Fatal Error]:', err);
  process.exit(1);
});
