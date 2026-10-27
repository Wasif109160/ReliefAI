// scripts/migrate-rescue-teams.mjs
// ==============================================================================
// ReliefAI — Safe, Repeatable Rescue Personnel Team Migration Tool (PostgreSQL / Prisma)
// ==============================================================================
// Purpose:
// Safely migrate existing operational rescue personnel who lack assignedTeamId.
// - NEVER defaults every user to team-01.
// - Preserves existing valid assignments.
// - Accurately maps unambiguous personnel based on verified official unit credentials.
// - Identifies ambiguous or unmapped personnel and reports them for manual review.
// - Supports safe Dry-Run mode by default.
// - Refuses production writes without explicit confirmation flags.
// ==============================================================================

import { PrismaClient } from '@prisma/client';

// Verified deterministic unit roster mapping table
// Only unambiguous, officially issued organizational badges/units are mapped automatically.
const OFFICIAL_UNIT_MAPPINGS = [
  {
    teamId: 'team-01',
    teamName: 'FSCD Sylhet Station Swift-Water Rescue Dive Team 1 (ফায়ার সার্ভিস)',
    badgePrefixes: ['FSCD-USAR-DIV1', 'FSCD-SYL-DIVE1'],
    organizationKeywords: ['FSCD Sylhet', 'ফায়ার সার্ভিস সিলেট'],
  },
  {
    teamId: 'team-02',
    teamName: 'Cyclone Preparedness Programme (CPP) Coastal Rescue Unit 4 (BDRCS)',
    badgePrefixes: ['BDRCS-CPP-COASTAL', 'CPP-UNIT-04'],
    organizationKeywords: ['Cyclone Preparedness Programme', 'CPP', 'BDRCS Coastal'],
  },
  {
    teamId: 'team-03',
    teamName: 'Bangladesh Army 17th Infantry Division Disaster Task Force Alpha (Sylhet Corps)',
    badgePrefixes: ['ARMY-17INF-ALPHA', 'BA-17INF-TF1'],
    organizationKeywords: ['Bangladesh Army 17th Infantry', '17 Infantry Division', 'সেনাবাহিনী ১৭ পদাতিক'],
  },
  {
    teamId: 'team-04',
    teamName: 'FSCD Headquarters Special Rescue Unit Dhaka',
    badgePrefixes: ['FSCD-HQ-USAR', 'FSCD-DHAKA-SRU'],
    organizationKeywords: ['FSCD Headquarters', 'ফায়ার সার্ভিস হেডকোয়ার্টার্স'],
  },
  {
    teamId: 'team-05',
    teamName: 'Ansar & VDP Quick Response Disaster Team (Sunamganj Flotilla)',
    badgePrefixes: ['ANSAR-VDP-SUNAM', 'VDP-QRT-05'],
    organizationKeywords: ['Ansar & VDP', 'আনসার ও ভিডিপি'],
  },
];

/**
 * Resolves a team assignment decision for an operational user against available teams.
 * Guaranteed to return an explicit status. Never falls back to a guess.
 */
export function evaluateUserTeamAssignment(user, availableTeams) {
  const availableTeamIds = new Set(availableTeams.map((t) => t.id));

  // 1. If user already has an assigned team ID
  if (user.assignedTeamId && user.assignedTeamId.trim()) {
    const cleanId = user.assignedTeamId.trim();
    if (availableTeamIds.has(cleanId)) {
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        badgeNumber: user.badgeNumber || 'N/A',
        status: 'PRESERVED',
        teamId: cleanId,
        reason: 'Account already possesses a verified, valid team assignment.',
      };
    } else {
      return {
        userId: user.id,
        name: user.name,
        email: user.email,
        badgeNumber: user.badgeNumber || 'N/A',
        status: 'INVALID_ASSIGNMENT',
        teamId: cleanId,
        reason: `Assigned team '${cleanId}' does not exist in responder teams ledger.`,
      };
    }
  }

  // 2. Attempt deterministic matching against official unit mappings
  const candidateTeams = [];

  const badge = (user.badgeNumber || '').toUpperCase().trim();
  const org = (user.organization || '').toLowerCase().trim();

  for (const rule of OFFICIAL_UNIT_MAPPINGS) {
    if (!availableTeamIds.has(rule.teamId)) continue;

    // Check badge prefix match or compound token match
    const badgeMatch = rule.badgePrefixes.some((p) => badge.includes(p));
    // Check organization keyword match
    const orgMatch = rule.organizationKeywords.some((k) => org.includes(k.toLowerCase()));

    if (badgeMatch || (orgMatch && badge.length > 0)) {
      candidateTeams.push(rule.teamId);
    }
  }

  // 3. Exactly one unambiguous match found
  if (candidateTeams.length === 1) {
    const matchedTeamId = candidateTeams[0];
    const teamRecord = availableTeams.find((t) => t.id === matchedTeamId);
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      badgeNumber: user.badgeNumber || 'N/A',
      status: 'MIGRATABLE',
      teamId: matchedTeamId,
      teamName: teamRecord?.name || matchedTeamId,
      reason: `Unambiguous match identified for official unit roster: ${teamRecord?.name || matchedTeamId}.`,
    };
  }

  // 4. Ambiguous (multiple matches) or unmapped (zero matches)
  if (candidateTeams.length > 1) {
    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      badgeNumber: user.badgeNumber || 'N/A',
      status: 'NEEDS_MANUAL_REVIEW',
      teamId: null,
      reason: `Ambiguous criteria: matches multiple candidate teams (${candidateTeams.join(', ')}). Manual review required.`,
    };
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    badgeNumber: user.badgeNumber || 'N/A',
    status: 'NEEDS_MANUAL_REVIEW',
    teamId: null,
    reason: 'No verified official badge or unit affiliation found. Assignment cannot be assumed.',
  };
}

/**
 * Migration Runner
 */
export async function runMigration(options = {}) {
  const isExecute = options.execute === true;
  const isDryRun = !isExecute;
  const databaseUrl = options.databaseUrl || process.env.DATABASE_URL;

  console.log('=============================================================');
  console.log(' ReliefAI Rescue Personnel Team Assignment Migration Tool   ');
  console.log(` Mode: ${isDryRun ? 'DRY-RUN (Safe Read-Only Simulation)' : 'EXECUTE (Writing Changes to Database)'}`);
  console.log('=============================================================\n');

  // Production Safety Refusal
  if (isExecute && process.env.NODE_ENV === 'production' && !options.confirmProduction) {
    console.error('[SAFETY REFUSAL] Cannot execute migration against production without explicit --confirm-production flag.');
    process.exit(1);
  }

  let users = [];
  let teams = [];
  let prisma = null;

  if (databaseUrl && databaseUrl.trim().length > 0) {
    console.log('Connecting to PostgreSQL via Prisma...');
    prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl },
      },
    });
    users = await prisma.user.findMany({
      where: { role: { in: ['rescue_team', 'responder'] } },
    });
    teams = await prisma.responderTeam.findMany();
  } else {
    console.log('No DATABASE_URL configured. Running evaluation against representative operational personnel fixtures...');
    // Representative seed fixtures for standalone / dry-run evaluation
    users = [
      {
        id: 'usr-rescue-04',
        name: 'ক্যাপ্টেন তানভীর আহমেদ (Capt. Tanvir Ahmed)',
        email: 'rescue@relief.ai',
        role: 'rescue_team',
        badgeNumber: 'FSCD-USAR-DIV1',
        assignedTeamId: 'team-01',
        organization: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD Sylhet Division)',
      },
      {
        id: 'usr-legacy-unmapped',
        name: 'উদ্ধারকারী সাজ্জাদ (Rescue Sajjad)',
        email: 'sajjad.unmapped@relief.ai',
        role: 'rescue_team',
        badgeNumber: 'UNKNOWN-VOL-99',
        organization: 'Independent Local Volunteer Group',
      },
      {
        id: 'usr-legacy-fscd-hq',
        name: 'সিনিয়র স্টেশন অফিসার রফিক (Sr. SO Rafiq)',
        email: 'rafiq.fscd@relief.ai',
        role: 'rescue_team',
        badgeNumber: 'FSCD-HQ-USAR-08',
        organization: 'FSCD Headquarters Special Rescue Unit Dhaka',
      },
      {
        id: 'usr-legacy-ambiguous',
        name: 'অফিসার কামাল (Officer Kamal)',
        email: 'kamal.ambiguous@relief.ai',
        role: 'rescue_team',
        badgeNumber: 'FSCD-USAR-DIV1-CPP-JOINT',
        organization: 'FSCD Sylhet & Cyclone Preparedness Programme Joint Liaison',
      },
      {
        id: 'usr-invalid-team-ref',
        name: 'রেসকিউ তারেক (Rescue Tareq)',
        email: 'tareq.badteam@relief.ai',
        role: 'rescue_team',
        badgeNumber: 'FSCD-DIV-99',
        assignedTeamId: 'team-nonexistent-999',
        organization: 'FSCD Regional Relief Task Force',
      },
    ];

    teams = [
      { id: 'team-01', name: 'FSCD Sylhet Station Swift-Water Rescue Dive Team 1 (ফায়ার সার্ভিস)' },
      { id: 'team-02', name: 'Cyclone Preparedness Programme (CPP) Coastal Rescue Unit 4 (BDRCS)' },
      { id: 'team-03', name: 'Bangladesh Army 17th Infantry Division Disaster Task Force Alpha (Sylhet Corps)' },
      { id: 'team-04', name: 'FSCD Headquarters Special Rescue Unit Dhaka' },
      { id: 'team-05', name: 'Ansar & VDP Quick Response Disaster Team (Sunamganj Flotilla)' },
    ];
  }

  console.log(`Found ${users.length} operational personnel and ${teams.length} responder teams.\n`);

  const results = {
    preserved: [],
    migratable: [],
    invalid: [],
    manualReview: [],
  };

  for (const user of users) {
    const decision = evaluateUserTeamAssignment(user, teams);
    if (decision.status === 'PRESERVED') results.preserved.push(decision);
    else if (decision.status === 'MIGRATABLE') results.migratable.push(decision);
    else if (decision.status === 'INVALID_ASSIGNMENT') results.invalid.push(decision);
    else results.manualReview.push(decision);
  }

  // Display Migration Table
  console.log('--- Migration Analysis Summary ---');
  console.log(`• Already Valid & Preserved : ${results.preserved.length}`);
  console.log(`• Unambiguous & Migratable  : ${results.migratable.length}`);
  console.log(`• Invalid Existing Team ID : ${results.invalid.length}`);
  console.log(`• Requires Manual Review   : ${results.manualReview.length}\n`);

  if (results.preserved.length > 0) {
    console.log('Preserved Accounts (No Change Needed):');
    for (const r of results.preserved) {
      console.log(`  [PRESERVED] ${r.name} (${r.email}) -> Team: ${r.teamId}`);
    }
    console.log();
  }

  if (results.migratable.length > 0) {
    console.log(isDryRun ? 'Proposed Assignments (Dry-Run):' : 'Applied Assignments (Executed):');
    for (const r of results.migratable) {
      console.log(`  [${isDryRun ? 'DRY-RUN' : 'MIGRATED'}] ${r.name} (${r.email}) -> Assigned: ${r.teamId} (${r.teamName})`);
    }
    console.log();
  }

  if (results.invalid.length > 0) {
    console.log('Flagged Invalid Assignments (Action Required):');
    for (const r of results.invalid) {
      console.log(`  [INVALID] ${r.name} (${r.email}) -> References Non-existent Team: ${r.teamId}`);
    }
    console.log();
  }

  if (results.manualReview.length > 0) {
    console.log('Ambiguous / Unmapped Personnel (Manual Assignment Required):');
    for (const r of results.manualReview) {
      console.log(`  [MANUAL REVIEW] ${r.name} (${r.email}) Badge: ${r.badgeNumber} | Reason: ${r.reason}`);
    }
    console.log();
  }

  // Execute database updates if execute mode is active
  if (isExecute && results.migratable.length > 0) {
    console.log(`Applying updates for ${results.migratable.length} users to database...`);
    if (prisma) {
      for (const item of results.migratable) {
        await prisma.user.update({
          where: { id: item.userId },
          data: { assignedTeamId: item.teamId },
        });
        console.log(`  ✓ Updated ${item.userId} with assignedTeamId: ${item.teamId}`);
      }
    }
    console.log('Migration updates applied successfully.\n');
  } else if (isDryRun && results.migratable.length > 0) {
    console.log('Dry-run complete. No database writes were performed.');
    console.log('To apply these changes, re-run with --execute (and --confirm-production if in production).\n');
  }

  if (prisma) {
    await prisma.$disconnect();
  }

  return results;
}

import { fileURLToPath } from 'url';
import path from 'path';

// CLI Execution entrypoint
const currentFilePath = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(currentFilePath)) {
  const args = process.argv.slice(2);
  const isExecute = args.includes('--execute');
  const confirmProduction = args.includes('--confirm-production');
  const uriArg = args.find((a) => a.startsWith('--database-url='))?.split('=')[1];

  runMigration({
    execute: isExecute,
    confirmProduction,
    databaseUrl: uriArg,
  }).catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}
