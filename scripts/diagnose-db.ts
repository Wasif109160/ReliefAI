/**
 * ReliefAI PostgreSQL Autonomous Diagnostics Utility
 *
 * Safely tests:
 * 1. Current Public IP detection.
 * 2. DNS resolution for the PostgreSQL host.
 * 3. TCP socket connectivity to PostgreSQL port (typically 5432 or 6543 for Supabase pooler).
 * 4. TLS/SSL handshake reachability.
 * 5. Live Prisma query ping.
 *
 * ZERO secret leakage: Never logs database passwords.
 *
 * Usage:
 *   npx tsx scripts/diagnose-db.ts
 */

import dns from 'dns';
import net from 'net';
import tls from 'tls';
import https from 'https';
import fs from 'fs';
import { prisma, sanitizeDatabaseUrl } from '../src/lib/prisma';

// Load environment variables respecting Next.js precedence
if (!process.env.DATABASE_URL) {
  if (fs.existsSync('.env.local')) {
    try { process.loadEnvFile('.env.local'); } catch {}
  }
  if (!process.env.DATABASE_URL && fs.existsSync('.env')) {
    try { process.loadEnvFile('.env'); } catch {}
  }
}

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

async function testTcp(host: string, port: number, timeoutMs = 5000): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);

    socket.connect(port, host, () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ ok: true, latencyMs });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ ok: false, error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: `Connection timed out after ${timeoutMs}ms` });
    });
  });
}

async function testTls(host: string, port: number, timeoutMs = 5000): Promise<{ ok: boolean; latencyMs?: number; error?: string }> {
  const start = Date.now();
  return new Promise((resolve) => {
    const socket = tls.connect({
      host,
      port,
      rejectUnauthorized: false,
      timeout: timeoutMs,
    }, () => {
      const latencyMs = Date.now() - start;
      socket.destroy();
      resolve({ ok: true, latencyMs });
    });

    socket.on('error', (err) => {
      socket.destroy();
      resolve({ ok: false, error: err.message });
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve({ ok: false, error: `TLS handshake timed out after ${timeoutMs}ms` });
    });
  });
}

async function runDiagnostics() {
  console.log('================================================================');
  console.log(' ReliefAI PostgreSQL Autonomous Diagnostics Utility             ');
  console.log('================================================================\n');

  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) {
    console.error('[ERROR] DATABASE_URL environment variable is not defined.');
    console.log('Set DATABASE_URL in your .env or .env.local file:');
    console.log('  DATABASE_URL="postgresql://user:password@host:5432/reliefai?sslmode=require"');
    process.exit(1);
  }

  const { sanitized, host, dbName } = sanitizeDatabaseUrl(rawUrl);
  console.log(`[Config] Connection String: ${sanitized}`);
  console.log(`[Config] Database:          ${dbName}`);
  console.log(`[Config] Host:              ${host}`);

  // Parse port from host
  let hostname = host;
  let port = 5432;
  if (host.includes(':')) {
    const parts = host.split(':');
    hostname = parts[0];
    port = parseInt(parts[1], 10) || 5432;
  }

  // 1. Public IP Check
  process.stdout.write('1. Detecting egress public IP... ');
  const publicIp = await getPublicIp();
  console.log(`${publicIp}`);

  // 2. DNS Resolution
  process.stdout.write(`2. Resolving DNS for ${hostname}... `);
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    console.log(`OK (${addresses.map((a) => a.address).join(', ')})`);
  } catch (err: any) {
    console.log(`FAILED (${err.message})`);
  }

  // 3. TCP Connectivity
  process.stdout.write(`3. Testing TCP connection to ${hostname}:${port}... `);
  const tcpResult = await testTcp(hostname, port);
  if (tcpResult.ok) {
    console.log(`CONNECTED in ${tcpResult.latencyMs}ms`);
  } else {
    console.log(`FAILED (${tcpResult.error})`);
  }

  // 4. TLS Handshake
  process.stdout.write(`4. Testing TLS handshake on port ${port}... `);
  const tlsResult = await testTls(hostname, port);
  if (tlsResult.ok) {
    console.log(`SECURE in ${tlsResult.latencyMs}ms`);
  } else {
    console.log(`FAILED (${tlsResult.error})`);
  }

  // 5. Prisma Ping
  process.stdout.write('5. Executing live query ping (SELECT 1 via Prisma)... ');
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log(`SUCCESS in ${Date.now() - start}ms\n`);
  } catch (err: any) {
    console.log(`FAILED (${err.message})\n`);
  }

  console.log('================================================================');
  console.log(' Diagnostic Summary Complete                                    ');
  console.log('================================================================');

  await prisma.$disconnect();
  process.exit(0);
}

runDiagnostics().catch((err) => {
  console.error('Fatal diagnostic error:', err);
  process.exit(1);
});
