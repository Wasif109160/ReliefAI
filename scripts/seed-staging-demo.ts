/**
 * ReliefAI - Safe Staging & Showcase Demo Account Seeding / Reset Procedure
 *
 * SECURITY MANDATE:
 * - Isolated staging/showcase environments ONLY.
 * - Requires explicit confirmation flag (--confirm-staging) to execute writes.
 * - Never prints plaintext credentials or secrets in terminal logs.
 * - Reads credentials from local, git-ignored `scratch/demo-credentials.json`.
 *
 * Usage:
 *   npx tsx scripts/seed-staging-demo.ts --dry-run
 *   npx tsx scripts/seed-staging-demo.ts --confirm-staging
 */

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../src/lib/models/User';
import { DESIGNATED_DEMO_ACCOUNTS } from '../src/lib/server/demo-policy';

// Load environment variables respecting Next.js precedence
if (!process.env.MONGODB_URI) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

function maskMongoUri(uri: string): string {
  try {
    const match = uri.match(/^(mongodb(?:\+srv)?:\/\/)(?:([^:]+):([^@]+)@)?([^/?]+)(?:\/([^?]+))?(?:\?(.*))?$/);
    if (!match) return '[Invalid or masked URI]';
    const [, protocol, , , hosts, dbName = 'default'] = match;
    return `${protocol}***:***@${hosts}/${dbName}`;
  } catch {
    return '[Masked URI]';
  }
}

function isValidBcryptHash(hash: unknown): boolean {
  if (typeof hash !== 'string') return false;
  const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
  return bcryptRegex.test(hash);
}

interface StagingCredentialAccount {
  email: string;
  role: string;
  name?: string;
  plainPassword?: string;
  passwordHash?: string;
  isEmailVerified?: boolean;
  status?: string;
}

const ACCOUNT_METADATA_DEFAULTS: Record<string, any> = {
  'superadmin@relief.ai': {
    name: 'মেজর জেনারেল কে. এম. সাজ্জাদুল ইসলাম (Maj. Gen. Sajjadul Islam)',
    displayName: 'Maj. Gen. Sajjadul Islam (Super Admin)',
    badgeNumber: 'BD-SADM-0001',
    organization: 'জাতীয় দুর্যোগ ব্যবস্থাপনা কমান্ড ও সমন্বয় কর্তৃপক্ষ (NDMCA & Armed Forces)',
    phone: '+880 1711-998877',
    skills: ['কৌশলগত জাতীয় ক্রাইসিস কমান্ড', 'সশস্ত্র বাহিনী যৌথ লজিস্টিকস', 'জরুরি স্যাটেলাইট মেশ সমন্বয়'],
    assignedZone: 'জাতীয় কৌশলগত কমান্ড সেন্টার (National Strategic Command Dhaka)',
  },
  'admin@relief.ai': {
    name: 'ব্রিগেডিয়ার জেনারেল মোস্তাফিজুর রহমান (Brig. Gen. Mostafizur Rahman)',
    displayName: 'Brig. Gen. Mostafizur Rahman',
    badgeNumber: 'BD-AFD-9001',
    organization: 'দুর্যোগ ব্যবস্থাপনা অধিদপ্তর ও সশস্ত্র বাহিনী বিভাগ (DDM / AFD)',
    phone: '+880 1711-001122',
    skills: ['জাতীয় ক্রাইসিস সমন্বয়', 'সশস্ত্র বাহিনী লজিস্টিকস', 'ইন্সিডেন্ট কমান্ড ICS-400'],
    assignedZone: 'জাতীয় ইমার্জেন্সি অপারেশন সেন্টার (National EOC Dhaka)',
  },
  'gov@relief.ai': {
    name: 'সচিব ড. তারেক মাহমুদ (Sec. Dr. Tareq Mahmud)',
    displayName: 'Sec. Dr. Tareq Mahmud',
    organization: 'দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয় (MoDMR Bangladesh)',
    phone: '+880 1819-002233',
    assignedZone: 'বাংলাদেশ সচিবালয়, ঢাকা',
  },
  'ngo@relief.ai': {
    name: 'ফারহানা হক (Farhana Huq)',
    displayName: 'Farhana Huq (BRAC & BDRCS)',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি ও ব্র্যাক (BDRCS / BRAC)',
    phone: '+880 1912-003344',
    skills: ['ত্রাণ বিতরণ ও লজিস্টিকস সমন্বয়', 'জরুরি পানি ও খাদ্য সরবরাহ'],
    assignedZone: 'সিলেট-সুনামগঞ্জ আঞ্চলিক ত্রাণ ডিপো',
  },
  'rescue@relief.ai': {
    name: 'ক্যাপ্টেন তানভীর আহমেদ (Capt. Tanvir Ahmed)',
    displayName: 'Capt. Tanvir Ahmed (FSCD)',
    badgeNumber: 'FSCD-USAR-DIV1',
    assignedTeamId: 'team-01',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
    phone: '+880 1611-004455',
    skills: ['স্পিডবোট উদ্ধার অভিযান', 'ডুবুরি সার্টিফাইড রেসকিউয়ার', 'জরুরি ট্রমা ও প্যারামেডিক'],
    assignedZone: 'সুরমা-কুশিয়ারা রিভারাইন সেক্টর ১',
  },
  'volunteer@relief.ai': {
    name: 'তাহমিনা আক্তার (Tahmina Akter)',
    displayName: 'Tahmina Akter (Volunteer Lead)',
    badgeNumber: 'BD-VOL-7701',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি যুব স্বেচ্ছাসেবক দল (BDRCS Youth Volunteers)',
    phone: '+880 1715-443322',
    skills: ['Shelter Intake Logistics', 'Bilingual Field Support', 'First Aid / CPR Certified', 'Community Relief Mesh'],
    assignedZone: 'সিলেট সদর আশ্রয়কেন্দ্র ও ফিল্ড সমন্বয় হাব',
  },
  'citizen@relief.ai': {
    name: 'রফিকুল ইসলাম (Rafiqul Islam)',
    displayName: 'Rafiqul Islam',
    phone: '+880 1712-345678',
    location: {
      name: 'গোয়াইনঘাট উপজেলা, সিলেট (Gowainghat, Sylhet)',
      lat: 25.0760,
      lng: 91.9750,
    },
    assignedZone: 'গোয়াইনঘাট বন্যা প্লাবন এলাকা',
  },
};

export async function runStagingSeeder() {
  const args = process.argv.slice(2);
  const isConfirmed = args.includes('--confirm-staging');
  const isDryRun = args.includes('--dry-run') || !isConfirmed;

  console.log('========================================================================');
  console.log(`ReliefAI - Staging/Showcase Demo Seeding & Password Reset`);
  console.log(`Execution Mode: ${isConfirmed ? 'LIVE WRITES AUTHORIZED' : 'DRY-RUN (SAFETY DEFAULT)'}`);
  console.log('========================================================================\n');

  // Load credentials from local git-ignored file
  const credsPath = path.resolve(process.cwd(), 'scratch', 'demo-credentials.json');
  if (!fs.existsSync(credsPath)) {
    console.error('[ERROR] Local credentials file not found: scratch/demo-credentials.json');
    console.error('Please generate credentials first using: node scratch/generate-demo-credentials.mjs');
    process.exit(1);
  }

  let credsData: { accounts: StagingCredentialAccount[] };
  try {
    credsData = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
  } catch (err: any) {
    console.error('[ERROR] Failed to parse credentials file:', err.message);
    process.exit(1);
  }

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri || rawUri.trim().length === 0) {
    console.error('[ERROR] No MONGODB_URI configured. Please set the staging database URI.');
    process.exit(1);
  }

  console.log(`Target Database: ${maskMongoUri(rawUri)}`);

  // Guard against accidental production writes
  if (process.env.NODE_ENV === 'production' && !args.includes('--allow-prod-override')) {
    console.error('\n[SAFETY BLOCK] NODE_ENV is set to production.');
    console.error('This script is strictly intended for isolated staging/showcase environments.');
    console.error('Execution halted.');
    process.exit(1);
  }

  if (isDryRun && !isConfirmed) {
    console.log('\n[NOTICE] Running in DRY-RUN mode. Zero database writes will occur.');
    console.log('To execute writes to the target staging database, supply the --confirm-staging flag.\n');
  }

  let connected = false;
  try {
    await mongoose.connect(rawUri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 6000,
    });
    connected = true;
    console.log(`Connected successfully to database: ${mongoose.connection.name}`);
  } catch (err: any) {
    console.error(`\n[CONNECTION FAILED] Unable to reach target database: ${err.message}`);
    console.error('Check network connectivity, IP access list in MongoDB Atlas, and URI credentials.');
    process.exit(1);
  }

  const auditLog: Array<{
    Email: string;
    Role: string;
    'Password Status': string;
    'Bcrypt Hash': string;
    Action: string;
  }> = [];

  for (const accountDef of DESIGNATED_DEMO_ACCOUNTS) {
    const email = accountDef.email.toLowerCase().trim();
    const credAccount = credsData.accounts.find((a) => a.email.toLowerCase().trim() === email);

    if (!credAccount) {
      console.warn(`[WARNING] No credentials definition found for: ${email}`);
      continue;
    }

    // Ensure valid bcrypt hash
    let hash = credAccount.passwordHash;
    if (!hash || !isValidBcryptHash(hash)) {
      if (credAccount.plainPassword) {
        hash = bcrypt.hashSync(credAccount.plainPassword, 10);
      } else {
        console.error(`[ERROR] Missing password and hash for ${email}`);
        continue;
      }
    }

    const meta = ACCOUNT_METADATA_DEFAULTS[email] || {};
    const existing = await UserModel.findOne({ email }).lean();

    let actionTaken = 'Dry-Run (No Change)';

    if (!isDryRun) {
      if (existing) {
        await UserModel.updateOne(
          { email },
          {
            $set: {
              role: accountDef.expectedRole,
              passwordHash: hash,
              isEmailVerified: true,
              status: 'approved',
              updatedAt: new Date().toISOString(),
              ...meta,
            },
          }
        );
        actionTaken = 'Updated / Password Reset in DB';
      } else {
        await UserModel.create({
          id: `usr-demo-${accountDef.expectedRole.replace('_', '')}`,
          email,
          role: accountDef.expectedRole,
          passwordHash: hash,
          isEmailVerified: true,
          status: 'approved',
          createdAt: new Date().toISOString(),
          ...meta,
        });
        actionTaken = 'Created / Seeded in DB';
      }
    } else {
      actionTaken = existing ? 'Would Update / Reset Password' : 'Would Create Account';
    }

    auditLog.push({
      Email: email,
      Role: accountDef.expectedRole,
      'Password Status': '[REDACTED - SECURELY GENERATED]',
      'Bcrypt Hash': '[VALID BCRYPT (Cost 10)]',
      Action: actionTaken,
    });
  }

  console.log('\n------------------------------------------------------------------------');
  console.log('Staging Demo Account Audit & Action Summary:');
  console.log('------------------------------------------------------------------------');
  console.table(auditLog);

  if (connected) {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed cleanly.');
  }

  console.log('\n========================================================================');
  console.log(`Execution Complete. Zero secrets were logged.`);
  console.log('========================================================================');
}

if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.endsWith('seed-staging-demo.ts'))) {
  runStagingSeeder().catch((err) => {
    console.error('Fatal Seeder Error:', err.message);
    process.exit(1);
  });
}
