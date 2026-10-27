/**
 * ReliefAI - Development & Staging User Seeding Script
 * 
 * Safely provisions seed accounts for every platform role without duplicating
 * existing users. Uses PostgreSQL via Prisma ORM.
 * 
 * Usage:
 *   npx tsx scripts/seed-users.ts
 *   npm run seed:users
 */

import fs from 'fs';
import bcrypt from 'bcryptjs';
import { prisma, isDatabaseConfigured, sanitizeDatabaseUrl } from '../src/lib/prisma';
import { UserRole } from '../src/lib/types';

// Load environment variables respecting Next.js precedence: .env.local overrides .env
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

export interface SeedAccountDefinition {
  id: string;
  name: string;
  displayName?: string;
  email: string;
  plainPassword: string;
  role: UserRole;
  isEmailVerified: boolean;
  status: 'approved' | 'pending' | 'rejected' | 'active' | 'suspended';
  organization?: string;
  badgeNumber?: string;
  assignedTeamId?: string;
  assignedZone?: string;
  phone?: string;
  skills?: string[];
  location?: {
    name: string;
    lat: number;
    lng: number;
  };
}

export const SEED_ACCOUNTS: SeedAccountDefinition[] = [
  // 1. Super Admin
  {
    id: 'usr-superadmin-00',
    name: 'মেজর জেনারেল কে. এম. সাজ্জাদুল ইসলাম (Maj. Gen. Sajjadul Islam)',
    displayName: 'Maj. Gen. Sajjadul Islam (Super Admin)',
    email: 'superadmin@relief.ai',
    plainPassword: 'SuperAdmin@123456',
    role: 'super_admin',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-SADM-0001',
    organization: 'জাতীয় দুর্যোগ ব্যবস্থাপনা কমান্ড ও সমন্বয় কর্তৃপক্ষ (NDMCA & Armed Forces)',
    phone: '+880 1711-998877',
    skills: ['কৌশলগত জাতীয় ক্রাইসিস কমান্ড', 'সশস্ত্র বাহিনী যৌথ লজিস্টিকস', 'জরুরি স্যাটেলাইট মেশ সমন্বয়'],
    assignedZone: 'জাতীয় কৌশলগত কমান্ড সেন্টার (National Strategic Command Dhaka)',
  },
  // 2. Platform Administrator
  {
    id: 'usr-admin-01',
    name: 'ব্রিগেডিয়ার জেনারেল মোস্তাফিজুর রহমান (Brig. Gen. Mostafizur Rahman)',
    displayName: 'Brig. Gen. Mostafizur Rahman',
    email: 'admin@relief.ai',
    plainPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@123456',
    role: 'admin',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-AFD-9001',
    organization: 'দুর্যোগ ব্যবস্থাপনা অধিদপ্তর ও সশস্ত্র বাহিনী বিভাগ (DDM / AFD)',
    phone: '+880 1711-001122',
    skills: ['জাতীয় ক্রাইসিস সমন্বয়', 'সশস্ত্র বাহিনী লজিস্টিকস', 'ইন্সিডেন্ট কমান্ড ICS-400'],
    assignedZone: 'জাতীয় ইমার্জেন্সি অপারেশন সেন্টার (National EOC Dhaka)',
  },
  // 3. Government Official
  {
    id: 'usr-gov-02',
    name: 'সচিব ড. তারেক মাহমুদ (Sec. Dr. Tareq Mahmud)',
    displayName: 'Sec. Dr. Tareq Mahmud',
    email: 'gov@relief.ai',
    plainPassword: 'Gov@123456',
    role: 'government',
    isEmailVerified: true,
    status: 'approved',
    organization: 'দুর্যোগ ব্যবস্থাপনা ও ত্রাণ মন্ত্রণালয় (MoDMR Bangladesh)',
    phone: '+880 1819-002233',
    assignedZone: 'বাংলাদেশ সচিবালয়, ঢাকা',
  },
  // 4. NGO Coordinator
  {
    id: 'usr-ngo-03',
    name: 'ফারহানা হক (Farhana Huq)',
    displayName: 'Farhana Huq (BRAC & BDRCS)',
    email: 'ngo@relief.ai',
    plainPassword: 'Ngo@123456',
    role: 'ngo',
    isEmailVerified: true,
    status: 'approved',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি ও ব্র্যাক (BDRCS / BRAC)',
    phone: '+880 1912-003344',
    skills: ['ত্রাণ বিতরণ ও লজিস্টিকস সমন্বয়', 'জরুরি পানি ও খাদ্য সরবরাহ'],
    assignedZone: 'সিলেট-সুনামগঞ্জ আঞ্চলিক ত্রাণ ডিপো',
  },
  // 5. Tactical Incident Commander
  {
    id: 'usr-commander-07',
    name: 'লেফটেন্যান্ট কর্নেল শাহরিয়ার নাফিস (Lt. Col. Shahriar Nafis)',
    displayName: 'Lt. Col. Shahriar Nafis (Sector Commander)',
    email: 'commander@relief.ai',
    plainPassword: 'Commander@123456',
    role: 'commander',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-CMD-4402',
    organization: 'সিলেট বিভাগীয় যৌথ দুর্যোগ কমান্ড সেল (Sylhet Joint Disaster Command)',
    phone: '+880 1814-556677',
    skills: ['ট্যাকটিক্যাল ইনসিডেন্ট কমান্ড', 'সশস্ত্র বাহিনী ও ফায়ার সার্ভিস সমন্বয়', 'এয়ারলিফট ও পন্টুন মোতায়েন'],
    assignedZone: 'সিলেট বিভাগীয় সেক্টর ১ কমান্ড সেন্টার (কদমতলী)',
  },
  // 6. Rescue Team Lead
  {
    id: 'usr-rescue-04',
    name: 'ক্যাপ্টেন তানভীর আহমেদ (Capt. Tanvir Ahmed)',
    displayName: 'Capt. Tanvir Ahmed (FSCD)',
    email: 'rescue@relief.ai',
    plainPassword: 'Rescue@123456',
    role: 'rescue_team',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'FSCD-USAR-DIV1',
    assignedTeamId: 'team-01',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
    phone: '+880 1611-004455',
    skills: ['স্পিডবোট উদ্ধার অভিযান', 'ডুবুরি সার্টিফাইড রেসকিউয়ার', 'জরুরি ট্রমা ও প্যারামেডিক'],
    assignedZone: 'সুরমা-কুশিয়ারা রিভারাইন সেক্টর ১',
  },
  // 7. Tactical First Responder
  {
    id: 'usr-responder-08',
    name: 'স্টেশন অফিসার কামরুল হাসান (Station Officer Kamrul Hasan)',
    displayName: 'SO Kamrul Hasan (Field Responder)',
    email: 'responder@relief.ai',
    plainPassword: 'Responder@123456',
    role: 'responder',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'FSCD-DIV-1044',
    assignedTeamId: 'team-01',
    organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স কুইক রেসপন্স ইউনিট (FSCD QRT)',
    phone: '+880 1718-223388',
    skills: ['Swift-water Rescue Skiff Pilot', 'High-Angle Rope Rescue', 'Advanced Trauma Life Support (ATLS)'],
    assignedZone: 'সুনামগঞ্জ সদর নদী তীরবর্তী জরুরি উদ্ধার সেক্টর',
  },
  // 8. Volunteer Lead
  {
    id: 'usr-volunteer-06',
    name: 'তাহমিনা আক্তার (Tahmina Akter)',
    displayName: 'Tahmina Akter (Volunteer Lead)',
    email: 'volunteer@relief.ai',
    plainPassword: 'Volunteer@123456',
    role: 'volunteer',
    isEmailVerified: true,
    status: 'approved',
    badgeNumber: 'BD-VOL-7701',
    organization: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি যুব স্বেচ্ছাসেবক দল (BDRCS Youth Volunteers)',
    phone: '+880 1715-443322',
    skills: ['Shelter Intake Logistics', 'Bilingual Field Support', 'First Aid / CPR Certified', 'Community Relief Mesh'],
    assignedZone: 'সিলেট সদর আশ্রয়কেন্দ্র ও ফিল্ড সমন্বয় হাব',
  },
  // 9. Verified Citizen
  {
    id: 'usr-citizen-05',
    name: 'রফিকুল ইসলাম (Rafiqul Islam)',
    displayName: 'Rafiqul Islam',
    email: 'citizen@relief.ai',
    plainPassword: 'Citizen@123456',
    role: 'citizen',
    isEmailVerified: true,
    status: 'approved',
    phone: '+880 1712-345678',
    location: {
      name: 'গোয়াইনঘাট উপজেলা, সিলেট (Gowainghat, Sylhet)',
      lat: 25.076,
      lng: 91.975,
    },
    assignedZone: 'গোয়াইনঘাট বন্যা প্লাবন এলাকা',
  },
  // 10. Pending Verification Account
  {
    id: 'usr-pending-09',
    name: 'আরিফুল ইসলাম (Ariful Islam - Pending Review)',
    displayName: 'Ariful Islam (Volunteer Applicant)',
    email: 'pending.volunteer@relief.ai',
    plainPassword: 'Pending@123456',
    role: 'volunteer',
    isEmailVerified: false,
    status: 'pending',
    organization: 'স্থানীয় যুব কল্যাণ সংঘ (Local Youth Welfare Group)',
    phone: '+880 1619-334455',
    assignedZone: 'কুড়িগ্রাম চরাঞ্চল',
  },
  // 11. Suspended / Inactive Account
  {
    id: 'usr-suspended-10',
    name: 'নিলয় চৌধুরী (Niloy Chowdhury - Suspended)',
    displayName: 'Niloy Chowdhury (Inactive Volunteer)',
    email: 'suspended.volunteer@relief.ai',
    plainPassword: 'Suspended@123456',
    role: 'volunteer',
    isEmailVerified: true,
    status: 'suspended',
    organization: 'স্বাধীন স্বেচ্ছাসেবক ফোরাম',
    phone: '+880 1713-778899',
    assignedZone: 'সুনামগঞ্জ হাওড় অঞ্চল',
  },
  // 12. Rejected Applicant Account
  {
    id: 'usr-rejected-11',
    name: 'মনোয়ার হোসেন (Monowar Hossain - Application Rejected)',
    displayName: 'Monowar Hossain (Rejected Applicant)',
    email: 'rejected.applicant@relief.ai',
    plainPassword: 'Rejected@123456',
    role: 'rescue_team',
    isEmailVerified: true,
    status: 'rejected',
    organization: 'Unverified Local Community Group',
    phone: '+880 1511-223344',
    assignedZone: 'Unassigned',
  },
];

async function tryConnectDatabase(): Promise<{ connected: boolean; isRemote: boolean; error?: string }> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.log('[SeedDB] DATABASE_URL not configured. Running in-memory simulation.');
    return { connected: false, isRemote: false };
  }

  const { sanitized, host, dbName } = sanitizeDatabaseUrl(url);
  const isRemote = !host.includes('localhost') && !host.includes('127.0.0.1');

  console.log(`[SeedDB] Target Database: ${sanitized} (Host: ${host}, DB: ${dbName})`);
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('[SeedDB] Connected successfully to PostgreSQL.');
    return { connected: true, isRemote };
  } catch (err: any) {
    console.error(`[SeedDB Error] Failed to connect to target PostgreSQL: ${err.message}`);
    return { connected: false, isRemote, error: err.message };
  }
}

async function seedDatabase() {
  const isDryRun = process.argv.includes('--dry-run');
  const isConfirmed = process.argv.includes('--confirm');

  console.log('====================================================');
  console.log(`ReliefAI - Multi-Role Seed Accounts Initializer (PostgreSQL) ${isDryRun ? '[DRY-RUN MODE]' : ''}`);
  console.log('====================================================\n');

  const { connected, isRemote } = await tryConnectDatabase();

  if (isRemote && !isConfirmed && !isDryRun) {
    console.error('\n[SAFETY BLOCK] Target database appears to be a REMOTE cluster.');
    console.error('To prevent accidental production database modifications, you must supply either:');
    console.error('  --dry-run   (to inspect actions without executing writes)');
    console.error('  --confirm   (to explicitly authorize database writes)');
    if (connected) await prisma.$disconnect();
    process.exit(1);
  }

  const results: {
    role: string;
    name: string;
    email: string;
    password: string;
    isVerified: boolean;
    status: string;
    source: string;
  }[] = [];

  for (const def of SEED_ACCOUNTS) {
    let source = connected ? 'Target DB' : 'In-Memory Fixture';

    if (connected) {
      // Check if user already exists in database
      const existing = await prisma.user.findUnique({
        where: { email: def.email.toLowerCase().trim() },
      });
      if (existing) {
        source = 'Existing (DB Preserved)';
        if (!isDryRun && !existing.status) {
          await prisma.user.update({
            where: { id: existing.id },
            data: { status: def.status },
          });
        }
      } else {
        if (!isDryRun) {
          const passwordHash = bcrypt.hashSync(def.plainPassword, 10);
          await prisma.user.create({
            data: {
              id: def.id,
              name: def.name,
              displayName: def.displayName || def.name,
              email: def.email.toLowerCase().trim(),
              passwordHash,
              role: def.role as any,
              isEmailVerified: def.isEmailVerified,
              status: def.status,
              organization: def.organization,
              badgeNumber: def.badgeNumber,
              assignedTeamId: def.assignedTeamId,
              assignedZone: def.assignedZone,
              phone: def.phone,
              skills: def.skills || [],
              location: def.location as any,
            },
          });
          source = 'Newly Seeded (DB Created)';
        } else {
          source = 'Dry-Run (Would Create)';
        }
      }
    }

    results.push({
      role: def.role,
      name: def.name,
      email: def.email,
      password: def.plainPassword,
      isVerified: def.isEmailVerified,
      status: def.status,
      source,
    });
  }

  // Also seed initial NGO applications if in database
  if (connected && !isDryRun) {
    try {
      const ngoCount = await prisma.nGOApplication.count();
      if (ngoCount === 0) {
        console.log('[SeedDB] Seeding default NGO accreditation records...');
        const initialNGOs = [
          {
            id: 'ngo-app-101',
            organizationName: 'ব্র্যাক ডিজাস্টার ম্যানেজমেন্ট ক্লাস্টার (BRAC Disaster Cluster)',
            registrationNumber: 'NGOAB-DH-2024-0042',
            focalPersonName: 'মাহমুদুল হাসান (Mahmudul Hasan)',
            focalPersonEmail: 'brac.relief@humanitarian.org',
            focalPersonPhone: '+880 1711-223344',
            website: 'https://brac.net',
            hqAddress: 'BRAC Centre, 75 Mohakhali, Dhaka-1212',
            operationalDistricts: ['Sylhet', 'Sunamganj', 'Kurigram', 'Netrokona'],
            reliefCapabilities: ['Water Purification', 'Emergency Food Rations', 'Shelter Logistics'],
            documentName: 'BRAC_NGOAB_Renewal_Certificate_2025.pdf',
            status: 'pending',
          },
          {
            id: 'ngo-app-102',
            organizationName: 'বাংলাদেশ রেড ক্রিসেন্ট সোসাইটি (BDRCS)',
            registrationNumber: 'BDRCS-EST-1973',
            focalPersonName: 'ফারহানা হক (Farhana Huq)',
            focalPersonEmail: 'ngo@relief.ai',
            focalPersonPhone: '+880 1912-003344',
            website: 'https://bdrcs.org',
            hqAddress: '684-686, Red Crescent Sarak, Bara Moghbazar, Dhaka-1217',
            operationalDistricts: ['All 64 Districts', 'Sylhet', 'Chittagong Coastal'],
            reliefCapabilities: ['Emergency Ambulance', 'Speedboat Extraction', 'Blood Bank', 'Relief Mesh'],
            documentName: 'BDRCS_Charter_Accreditation.pdf',
            status: 'approved',
            reviewedBy: 'Cmdr. Elena Vance',
            reviewedAt: new Date(Date.now() - 86400000),
          },
        ];

        for (const ngo of initialNGOs) {
          await prisma.nGOApplication.create({
            data: {
              id: ngo.id,
              organizationName: ngo.organizationName,
              registrationNumber: ngo.registrationNumber,
              focalPersonName: ngo.focalPersonName,
              focalPersonEmail: ngo.focalPersonEmail,
              focalPersonPhone: ngo.focalPersonPhone,
              website: ngo.website,
              hqAddress: ngo.hqAddress,
              operationalDistricts: ngo.operationalDistricts,
              reliefCapabilities: ngo.reliefCapabilities,
              documentName: ngo.documentName,
              status: ngo.status as any,
              reviewedBy: ngo.reviewedBy,
              reviewedAt: ngo.reviewedAt,
            },
          });
        }
      }
    } catch (e: any) {
      console.warn('[SeedDB] NGOApplication seeding warning:', e.message);
    }
  }

  console.log('\n========================================================================================================');
  console.log('RELIEFAI PLATFORM DEVELOPMENT & DEMO SEED ACCOUNTS');
  console.log('========================================================================================================\n');

  console.table(
    results.map((r) => ({
      Role: r.role,
      Name: r.name,
      Email: r.email,
      Password: r.password,
      'Email Verified': r.isVerified ? 'YES' : 'NO',
      Status: r.status,
      Source: r.source,
    }))
  );

  if (connected) {
    await prisma.$disconnect();
    console.log('\n[SeedDB] Database disconnected cleanly.');
  }

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error('[Seed Fatal Error]:', err);
  process.exit(1);
});
