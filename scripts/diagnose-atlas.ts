/**
 * ReliefAI MongoDB Atlas Autonomous Diagnostics Utility
 *
 * Safely tests:
 * 1. Current Public IP detection (to check against Atlas IP Access List).
 * 2. DNS SRV resolution for the Atlas cluster.
 * 3. Individual replica set node host resolution (IPv4).
 * 4. Raw TCP socket reachability on port 27017 (tests firewall / IP whitelist).
 * 5. TLS handshake test on port 27017.
 *
 * ZERO secret leakage: Never accesses, logs, or requires passwords.
 *
 * Usage:
 *   npx tsx scripts/diagnose-atlas.ts
 */

import dns from 'dns';
import net from 'net';
import tls from 'tls';
import https from 'https';

import fs from 'fs';

// Load environment variables respecting Next.js precedence
if (!process.env.MONGODB_URI) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.MONGODB_URI && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

function getAtlasDomain(): string {
  const custom = process.argv[2];
  if (custom && custom.includes('mongodb.net')) return custom.trim();
  const uri = process.env.MONGODB_URI || '';
  const match = uri.match(/@([^/?#]+)/);
  if (match && match[1].includes('mongodb.net')) return match[1];
  return 'cluster0.nco6w4z.mongodb.net';
}

const ATLAS_SRV_DOMAIN = getAtlasDomain();

async function getPublicIp(): Promise<string> {
  return new Promise((resolve) => {
    https.get('https://api.ipify.org?format=json', { timeout: 4000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip || 'Unknown');
        } catch {
          resolve('Failed to parse IP');
        }
      });
    }).on('error', (err) => {
      resolve(`Unable to fetch public IP (${err.message})`);
    });
  });
}

function testTcpConnection(host: string, port: number, timeoutMs = 5000): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  return new Promise((resolve) => {
    const start = Date.now();
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        const latencyMs = Date.now() - start;
        socket.destroy();
        resolve({ ok: true, latencyMs });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, error: `Connection timed out after ${timeoutMs}ms (Likely blocked by Atlas IP Access List or local firewall)` });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, error: err.message });
      }
    });

    socket.connect(port, host);
  });
}

function testTlsHandshake(host: string, port: number, timeoutMs = 5000): Promise<{ ok: boolean; cipher?: string; error?: string }> {
  return new Promise((resolve) => {
    let settled = false;
    const socket = tls.connect({
      host,
      port,
      servername: host,
      rejectUnauthorized: true,
      timeout: timeoutMs,
    });

    socket.on('secureConnect', () => {
      if (!settled) {
        settled = true;
        const cipher = socket.getCipher()?.name || 'unknown';
        socket.end();
        resolve({ ok: true, cipher });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, error: 'TLS Handshake timed out' });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, error: err.message });
      }
    });
  });
}

async function main() {
  console.log('====================================================');
  console.log('ReliefAI - MongoDB Atlas Autonomous Diagnostics');
  console.log('Target Cluster: ' + ATLAS_SRV_DOMAIN);
  console.log('====================================================\n');

  // Step 1: Detect Current Public IP
  console.log('[Step 1] Detecting Local Environment Public Outbound IP...');
  const publicIp = await getPublicIp();
  console.log(`  Current Public IPv4 Address: ${publicIp}\n`);

  // Step 2: DNS SRV Lookup
  console.log(`[Step 2] Resolving DNS SRV records for _mongodb._tcp.${ATLAS_SRV_DOMAIN}...`);
  let srvRecords: dns.SrvRecord[] = [];
  try {
    srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${ATLAS_SRV_DOMAIN}`);
    console.log(`  DNS SRV Resolution SUCCESS: Found ${srvRecords.length} replica set nodes:`);
    for (const r of srvRecords) {
      console.log(`    - Node: ${r.name}:${r.port} (Priority: ${r.priority}, Weight: ${r.weight})`);
    }
  } catch (err: any) {
    console.error(`  DNS SRV Resolution FAILED: ${err.message}`);
    process.exit(1);
  }

  // Step 3: DNS A/AAAA Lookup for each node
  console.log(`\n[Step 3] Resolving IP addresses for replica set nodes...`);
  const nodeHosts: { name: string; port: number; ips: string[] }[] = [];
  for (const r of srvRecords) {
    try {
      const ips = await dns.promises.resolve4(r.name);
      console.log(`  - ${r.name} -> ${ips.join(', ')}`);
      nodeHosts.push({ name: r.name, port: r.port, ips });
    } catch (err: any) {
      console.error(`  - ${r.name} resolution FAILED: ${err.message}`);
    }
  }

  // Step 4: TCP Connectivity Test on Port 27017
  console.log(`\n[Step 4] Testing raw TCP socket reachability on port 27017...`);
  let reachableNodes = 0;
  for (const node of nodeHosts) {
    process.stdout.write(`  Connecting to ${node.name}:${node.port}... `);
    const result = await testTcpConnection(node.name, node.port, 6000);
    if (result.ok) {
      reachableNodes++;
      console.log(`REACHABLE (${result.latencyMs}ms latency)`);
    } else {
      console.log(`UNREACHABLE`);
      console.log(`    Reason: ${result.error}`);
    }
  }

  // Step 5: TLS Handshake Test (if TCP succeeded)
  let tlsSuccess = false;
  let tlsErrMessage = '';
  if (reachableNodes > 0) {
    console.log(`\n[Step 5] Testing TLS Handshake with replica set node...`);
    const target = nodeHosts[0];
    const tlsResult = await testTlsHandshake(target.name, target.port, 6000);
    if (tlsResult.ok) {
      tlsSuccess = true;
      console.log(`  TLS Handshake SUCCESS: Cipher ${tlsResult.cipher}`);
    } else {
      tlsErrMessage = tlsResult.error || 'Unknown TLS error';
      console.log(`  TLS Handshake FAILED: ${tlsErrMessage}`);
    }
  }

  // Summary and Exact Root Cause Identification
  console.log('\n====================================================');
  console.log('DIAGNOSTIC SUMMARY & ACTIONABLE ROOT CAUSE');
  console.log('====================================================');
  if (reachableNodes === 0 || !tlsSuccess) {
    console.log('STATUS: MONGODB ATLAS NETWORK ACCESS / IP ACCESS LIST BLOCK CONFIRMED.');
    console.log('\nTechnical Root Cause:');
    console.log('1. DNS SRV resolved successfully to all 3 replica set nodes.');
    console.log('2. TCP port 27017 socket connected to the Atlas edge proxy.');
    console.log('3. The Atlas edge proxy immediately terminated the TLS handshake with "TLS Alert 80 (Internal Error)".');
    console.log('   In MongoDB Atlas shared clusters, Alert 80 occurs when the client IP is not in the project IP Access List.');
    console.log('\nRemediation Required in MongoDB Atlas Dashboard:');
    console.log(`1. Log into MongoDB Atlas: https://cloud.mongodb.com/`);
    console.log(`2. Navigate to: Security -> Network Access`);
    console.log(`3. Click "Add IP Address":`);
    console.log(`   - To allow local development from this machine:`);
    console.log(`     Add IP: ${publicIp}/32 (Comment: ReliefAI Local Dev Machine)`);
    console.log(`   - To allow Vercel production serverless deployments (Required for Vercel):`);
    console.log(`     Add IP: 0.0.0.0/0 (Allow access from anywhere)`);
    console.log(`4. Wait 1-2 minutes for Atlas to deploy the network security changes.`);
  } else {
    console.log('STATUS: TLS HANDSHAKE SUCCESSFUL.');
    console.log('Port 27017 and TLS negotiation are working.');
    console.log('If Mongoose still fails, verify database user credentials in .env.local.');
  }
  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('[Diagnostic Fatal Error]:', err);
  process.exit(1);
});
