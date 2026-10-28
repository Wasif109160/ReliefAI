import { NextResponse } from 'next/server';
import { checkDatabaseHealth, isDatabaseConfigured } from '@/lib/prisma';

// Next.js 16 dynamic health probe compatible with cacheComponents
export async function GET(request: Request) {
  const startTime = Date.now();
  const dbConfigured = isDatabaseConfigured();
  const isProduction = process.env.NODE_ENV === 'production';

  let dbStatus: { healthy: boolean; latencyMs?: number; error?: string } = {
    healthy: false,
    error: 'Database not checked',
  };

  if (dbConfigured) {
    dbStatus = await checkDatabaseHealth();
  } else {
    dbStatus = {
      healthy: !isProduction, // In development without DB, in-memory is okay; in production, fatal
      error: isProduction ? 'DATABASE_URL is not configured' : 'In-memory fallback mode',
    };
  }

  // Check Upstash Redis configuration if set
  const redisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  const isHealthy = isProduction ? dbConfigured && dbStatus.healthy : true;
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: {
          status: dbStatus.healthy ? 'connected' : 'error',
          configured: dbConfigured,
          engine: 'PostgreSQL / Prisma',
          latencyMs: dbStatus.latencyMs,
          error: dbStatus.error,
        },
        redis: {
          configured: redisConfigured,
          status: redisConfigured ? 'configured' : 'in-memory-fallback',
        },
      },
      responseTimeMs: Date.now() - startTime,
    },
    { status: statusCode }
  );
}
