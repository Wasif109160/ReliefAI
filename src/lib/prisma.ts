import { PrismaClient } from '@prisma/client';

/**
 * Global singleton interface to prevent connection exhaustion
 * during Next.js hot module reloading and across serverless invocations.
 */
declare global {
  var prismaGlobal: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error'],
  });
}

export const prisma: PrismaClient = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

/**
 * Standard Database Unavailable Error for 503 Fail-Closed Security
 */
export class DatabaseUnavailableError extends Error {
  readonly status = 503;
  readonly statusCode = 503;
  readonly code = 'DATABASE_UNAVAILABLE';
  constructor(message: string = 'Database service is currently unavailable. Please try again shortly.') {
    super(message);
    this.name = 'DatabaseUnavailableError';
    Object.setPrototypeOf(this, DatabaseUnavailableError.prototype);
  }
}

/**
 * Checks whether DATABASE_URL is configured
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0);
}

/**
 * Validates DATABASE_URL protocol and format
 */
export function validateDatabaseConfig(): { valid: boolean; error?: string } {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    return { valid: false, error: 'DATABASE_URL environment variable is not configured or is empty.' };
  }
  if (!url.startsWith('postgres://') && !url.startsWith('postgresql://')) {
    return { valid: false, error: 'DATABASE_URL must start with "postgresql://" or "postgres://".' };
  }
  return { valid: true };
}

/**
 * Masks database credentials for safe production logging
 */
export function sanitizeDatabaseUrl(rawUrl: string): { sanitized: string; host: string; dbName: string } {
  try {
    const url = new URL(rawUrl);
    const host = url.host || 'unknown';
    const dbName = url.pathname.replace(/^\//, '') || 'reliefai';
    const sanitized = `${url.protocol}//${url.username ? `${url.username}:***@` : ''}${url.host}${url.pathname}`;
    return { sanitized, host, dbName };
  } catch {
    return { sanitized: '[URI Parsing Error]', host: 'unknown', dbName: 'unknown' };
  }
}

/**
 * Comprehensive error classifier to determine if an error is a database connectivity/availability issue
 */
export function isDatabaseUnavailableError(err: unknown): boolean {
  if (!err) return false;
  if (err instanceof DatabaseUnavailableError) return true;

  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>;
    if (obj.code === 'DATABASE_UNAVAILABLE' || obj.status === 503 || obj.statusCode === 503) return true;
    if (obj.name === 'DatabaseUnavailableError') return true;

    // Prisma specific error codes:
    // P1000: Authentication failed
    // P1001: Can't reach database server
    // P1002: Database server was reached but timed out
    // P1003: Database does not exist
    // P1008: Operations timed out
    // P1017: Server has closed the connection
    if (typeof obj.code === 'string' && /^P1\d{3}$/.test(obj.code)) {
      return true;
    }
  }

  if (err instanceof Error) {
    const msg = err.message || '';
    if (
      err.name === 'DatabaseUnavailableError' ||
      err.name === 'PrismaClientInitializationError' ||
      err.name === 'PrismaClientRustPanicError' ||
      err.name === 'PrismaClientUnknownRequestError' ||
      msg.includes('DATABASE_UNAVAILABLE') ||
      msg.includes('DATABASE_URL is required') ||
      msg.includes("Can't reach database server") ||
      msg.includes('Connection pool timeout') ||
      msg.includes('Connection terminated') ||
      msg.includes('Server has closed the connection') ||
      msg.includes('connection refused')
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Live health check ping for health probe endpoints
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; latencyMs?: number; error?: string }> {
  if (!isDatabaseConfigured()) {
    return { healthy: false, error: 'DATABASE_URL not configured' };
  }
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { healthy: true, latencyMs: Date.now() - start };
  } catch (err: any) {
    return { healthy: false, latencyMs: Date.now() - start, error: err?.message || 'Database ping failed' };
  }
}
