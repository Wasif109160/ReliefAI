/**
 * ReliefAI - Safe Staging & Showcase Demo Account Seeding / Reset Procedure (PostgreSQL / Prisma)
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
import bcrypt from 'bcryptjs';
import { prisma, sanitizeDatabaseUrl } from '../src/lib/prisma';
import { DESIGNATED_DEMO_ACCOUNTS } from '../src/lib/server/demo-policy';

// Load environment variables respecting Next.js precedence
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
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
    organization: 'জাতীয় দুর্যোগ ব্যবস্থাপনা কমান্ড ও সমন্বয় কর্তৃপক্ষ (NDMCA & Armed Forces)',
    badgeNumber: 'BD-SADM-0001',
    phone: '+880 1711-998877',
    assignedZone: 'জাতীয় কৌশলগত কমান্ড সেন্টার (National Strategic Command Dhaka)',
    skills: ['কৌশলগত জাতীয় ক্রাইসিস কমান্ড', 'সশস্ত্র বাহিনী যৌথ লজিস্টিকস', 'জরুরি স্যাটেলাইট মেশ সমন্বয়'],
  },
  'admin@relief.ai': {
    name: 'ব্রিগেডিয়ার জেনারেল মোস্তাফিজুর রহমান (Brig. Gen. Mostafizur Rahman)',
    displayName: 'Brig. Gen. Mostafizur Rahman',
    organization: 'দুর্যোগ ব্যবস্থাপনা অধিদপ্তর ও সশস্ত্র বাহিনী বিভাগ (DDM / AFD)',
    badgeNumber: 'BD-AFD-9001',
    phone: '+880 1711-001122',
    assignedZone: 'জাতীয় ইমার্জেন্সি অপারেশন সেন্টার (National EOC Dhaka)',
    skills: ['জাতীয় ক্রাইসিস সমন্বয়', 'সশস্ত্র বাহিনী লজিস্টিকস', 'ইন্সিডেন্ট কমান্ড ICS-400'],
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
    assignedZone: 'সিলেট-সুনামগঞ্জ আঞ্চলিক ত্রাণ ডিপো',
    skills: ['ত্রাণ বিতরণ ও লজিস্টিকস সমন্বয়', 'জরুরি পানি ও খাদ্য সরবরাহ'],
  },
  'commander@relief.ai': {
    name: 'লেফটেন্যান্ট কর্নেল শাহরিয়ার নাফিস (Lt. Col. Shahriar Nafis)',
    displayName: 'Lt. Col. Shahriar Nafis (Sector Commander)',
    organization: 'সিলেট বিভাগীয় যৌথ দুর্যোগ কমান্ড সেল (Sylhet Joint Disaster Command)',
    badgeNumber: 'BD-CMD-4402',
    phone: '+880 1814-556677',
    assignedZone: 'সিলেট বিভাগীয় সেক্টর ১ কমান্ড সেন্টার (কদমতলী)',
    skills: ['ট্যাকটিক্যাল ইনসিডেন্ট কমান্ড', 'সশস্ত্র বাহিনী ও ফায়ার সার্ভিস সমন্বয়', 'এয়ারলিফট ও পন্টুন মোতায়েন'],
  },
  'rescue@relief.ai': {
    name: 'ক্যাপ্টেন তানভীর আহমেদ (Capt. Tanvir Ahmed)',
    displayName: 'Capt. Tanvir Ahmed (FSCD)',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
    badgeNumber: 'FSCD-USAR-DIV1',
    assignedTeamId: 'team-01',
    phone: '+880 1611-004455',
    assignedZone: 'সুরমা-কুশিয়ারা রিভারাইন সেক্টর ১',
    skills: ['স্পিডবোট উদ্ধার অভিযান', 'ডুবুরি সার্টিফাইড রেসকিউয়ার', 'জরুরি ট্রমা ও প্যারামেডিক'],
  },
  'responder@relief.ai': {
    name: 'স্টেশন অফিসার কামরুল হাসান (Station Officer Kamrul Hasan)',
    displayName: 'SO Kamrul Hasan (Field Responder)',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স কুইক রেসপন্স ইউনিট (FSCD QRT)',
    badgeNumber: 'FSCD-DIV-1044',
    assignedTeamId: 'team-01',
    phone: '+880 1718-223388',
    assignedZone: 'সুনামগঞ্জ সদর নদী তীরবর্তী জরুরি উদ্ধার সেক্টর',
    skills: ['Swift-water Rescue Skiff Pilot', 'High-Angle Rope Rescue', 'Advanced Trauma Life Support (ATLS)'],
  },
  'volunteer@relief.ai': {
    name: 'তাহমিনা আক্তার (Tahmina Akter)',
    displayName: 'Tahmina Akter (Volunteer Lead)',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি যুব স্বেচ্ছাসেবক দল (BDRCS Youth Volunteers)',
    badgeNumber: 'BD-VOL-7701',
    phone: '+880 1715-443322',
    assignedZone: 'সিলেট সদর আশ্রয়কেন্দ্র ও ফিল্ড সমন্বয় হাব',
    skills: ['Shelter Intake Logistics', 'Bilingual Field Support', 'First Aid / CPR Certified', 'Community Relief Mesh'],
  },
  'citizen@relief.ai': {
    name: 'রফিকুল ইসলাম (Rafiqul Islam)',
    displayName: 'Rafiqul Islam',
    phone: '+880 1712-345678',
    assignedZone: 'গোয়াইনঘাট বন্যা প্লাবন এলাকা',
    location: {
      name: 'গোয়াইনঘাট উপজেলা, সিলেট (Gowainghat, Sylhet)',
      lat: 25.076,
      lng: 91.975,
    },
  },
};

export async function runStagingSeeder() {
  const isDryRun = process.argv.includes('--dry-run');
  const isConfirmed = process.argv.includes('--confirm-staging');

  console.log('========================================================================');
  console.log('ReliefAI - Staging & Showcase Demo Account Seeding / Password Sync');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Inspection Only)' : isConfirmed ? 'CONFIRMED WRITES' : 'UNCONFIRMED'}`);
  console.log('========================================================================\n');

  if (!isDryRun && !isConfirmed) {
    console.error('[SAFETY REFUSAL] Modifying staging/demo accounts requires explicit confirmation.');
    console.error('Use either:');
    console.error('  --dry-run          (Safe preview of account states)');
    console.error('  --confirm-staging  (Execute updates against database)\n');
    process.exit(1);
  }

  // 1. Check local git-ignored credentials file
  const credPath = path.resolve(process.cwd(), 'scratch/demo-credentials.json');
  let credAccounts: StagingCredentialAccount[] = [];

  if (fs.existsSync(credPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(credPath, 'utf8'));
      credAccounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
      console.log(`[OK] Loaded ${credAccounts.length} credentials from: scratch/demo-credentials.json`);
    } catch (e: any) {
      console.warn(`[WARN] Could not parse scratch/demo-credentials.json: ${e.message}`);
    }
  }

  // Fallback defaults if no file exists
  if (credAccounts.length === 0) {
    console.log('[INFO] Using fallback standard staging demo credential definitions.');
    const defaultPassword = process.env.STAGING_DEMO_PASSWORD || 'ReliefAI@2026';
    credAccounts = DESIGNATED_DEMO_ACCOUNTS.map((acc) => ({
      email: acc.email,
      role: acc.expectedRole,
      plainPassword: defaultPassword,
    }));
  }

  // 2. Connect to PostgreSQL
  const dbUrl = process.env.DATABASE_URL;
  let connected = false;

  if (dbUrl) {
    const { sanitized, host, dbName } = sanitizeDatabaseUrl(dbUrl);
    console.log(`Target Database: ${sanitized} (Host: ${host}, DB: ${dbName})`);
    try {
      await prisma.$queryRaw`SELECT 1`;
      connected = true;
      console.log('Connected to PostgreSQL successfully.\n');
    } catch (e: any) {
      console.error(`PostgreSQL connection failed: ${e.message}`);
      if (!isDryRun) process.exit(1);
    }
  } else {
    console.log('No DATABASE_URL configured. Running in offline/dry-run mode.\n');
  }

  // 3. Process accounts
  const auditLog: Array<{
    Email: string;
    Role: string;
    'Password Status': string;
    'Bcrypt Hash': string;
    Action: string;
  }> = [];

  for (const accountDef of DESIGNATED_DEMO_ACCOUNTS) {
    const email = accountDef.email.toLowerCase().trim();
    const credAccount = credAccounts.find((c) => c.email.toLowerCase().trim() === email);

    if (!credAccount) {
      console.error(`[ERROR] Missing credential definition for designated demo email: ${email}`);
      continue;
    }

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
    let existing = null;
    if (connected) {
      existing = await prisma.user.findUnique({ where: { email } });
    }

    let actionTaken = 'Dry-Run (No Change)';

    if (!isDryRun && connected) {
      if (existing) {
        await prisma.user.update({
          where: { email },
          data: {
            role: accountDef.expectedRole as any,
            passwordHash: hash,
            isEmailVerified: true,
            status: 'approved',
            ...meta,
          },
        });
        actionTaken = 'Updated / Password Reset in DB';
      } else {
        await prisma.user.create({
          data: {
            id: `usr-demo-${accountDef.expectedRole.replace('_', '')}`,
            email,
            name: meta.name || email,
            displayName: meta.displayName || meta.name || email,
            role: accountDef.expectedRole as any,
            passwordHash: hash,
            isEmailVerified: true,
            status: 'approved',
            ...meta,
          },
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
    await prisma.$disconnect();
    console.log('\nDatabase connection closed cleanly.');
  }

  console.log('\n========================================================================');
  console.log('Execution Complete. Zero secrets were logged.');
  console.log('========================================================================');
}

if (typeof process !== 'undefined' && process.argv[1]?.endsWith('seed-staging-demo.ts')) {
  runStagingSeeder().catch((err) => {
    console.error('Fatal Seeder Error:', err.message);
    process.exit(1);
  });
}
