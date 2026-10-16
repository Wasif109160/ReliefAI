import crypto from 'crypto';

interface RateLimitEntry {
  count: number;
  lastRequestAt: number;
  firstRequestAt: number;
}

// In-memory rate limiting map: key -> { count, lastRequestAt, firstRequestAt }
const rateLimitMap = new Map<string, RateLimitEntry>();

// In-memory failed attempts tracker: email -> { attempts, lockoutUntil }
const loginAttemptsMap = new Map<string, { attempts: number; lockoutUntil?: number }>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_OTP_PER_WINDOW = 5;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  message?: string;
  isBackendError?: boolean;
  status?: number;
}

export interface IRateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; ttlSeconds: number }>;
}

let customStoreAdapter: IRateLimitStore | null = null;

async function incrementUpstash(
  url: string,
  token: string,
  key: string,
  windowMs: number
): Promise<{ count: number; ttlSeconds: number }> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const cleanUrl = url.replace(/\/+$/, '');
  const pipelineUrl = `${cleanUrl}/pipeline`;

  const pipelineBody = [
    ['INCR', key],
    ['EXPIRE', key, windowSeconds, 'NX'],
  ];

  const res = await fetch(pipelineUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pipelineBody),
  });

  if (!res.ok) {
    throw new Error(`Upstash HTTP error: status ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data) || typeof data[0]?.result !== 'number') {
    throw new Error(`Invalid response structure from Upstash REST API`);
  }

  return {
    count: data[0].result,
    ttlSeconds: windowSeconds,
  };
}

export const securityUtils = {
  /**
   * Sets a custom shared rate limit store adapter (useful for testing or custom Redis clients)
   */
  setSharedStoreAdapter(adapter: IRateLimitStore | null): void {
    customStoreAdapter = adapter;
  },

  /**
   * Clears in-memory rate limiting map (for test isolation)
   */
  resetLocalRateLimits(): void {
    rateLimitMap.clear();
  },

  /**
   * Generates a cryptographically strong 6-digit numeric OTP (100000 - 999999)
   */
  generateNumericOtp(): string {
    return crypto.randomInt(100000, 1000000).toString();
  },

  /**
   * Rate limiting for OTP generation requests
   */
  checkOtpRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number; message?: string } {
    const now = Date.now();
    const cleanKey = key.toLowerCase().trim();
    const entry = rateLimitMap.get(cleanKey);

    if (!entry) {
      rateLimitMap.set(cleanKey, { count: 1, lastRequestAt: now, firstRequestAt: now });
      return { allowed: true };
    }

    // Cooldown check (60 seconds)
    const timeSinceLast = now - entry.lastRequestAt;
    if (timeSinceLast < OTP_COOLDOWN_MS) {
      const waitSec = Math.ceil((OTP_COOLDOWN_MS - timeSinceLast) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: waitSec,
        message: `Please wait ${waitSec} seconds before requesting another verification code.`,
      };
    }

    // Window check (15 minutes)
    if (now - entry.firstRequestAt > OTP_WINDOW_MS) {
      // Reset window
      rateLimitMap.set(cleanKey, { count: 1, lastRequestAt: now, firstRequestAt: now });
      return { allowed: true };
    }

    if (entry.count >= MAX_OTP_PER_WINDOW) {
      const windowRemainingSec = Math.ceil((OTP_WINDOW_MS - (now - entry.firstRequestAt)) / 1000);
      return {
        allowed: false,
        retryAfterSeconds: windowRemainingSec,
        message: `Maximum verification code requests exceeded. Please try again in ${Math.ceil(windowRemainingSec / 60)} minutes.`,
      };
    }

    entry.count += 1;
    entry.lastRequestAt = now;
    return { allowed: true };
  },

  /**
   * Rate limiting for public mutation endpoints (e.g., POST /api/sos, POST /api/donations).
   * - In production: Requires a shared store (Upstash Redis or custom store adapter).
   *   Fails closed safely with 503 if unconfigured or unreachable.
   * - In development/testing: Falls back to local in-memory rate limiting map.
   */
  async checkPublicRateLimit(
    identifier: string,
    endpoint: string,
    maxRequests: number = 10,
    windowMs: number = 60 * 1000
  ): Promise<RateLimitResult> {
    const cleanEndpoint = endpoint.toLowerCase().trim();
    const cleanId = identifier.toLowerCase().trim();
    const key = `ratelimit:${cleanEndpoint}:${cleanId}`;
    const isProduction = process.env.NODE_ENV === 'production';
    const isTestEnv = process.env.RELIEFAI_TEST_ENV === 'true' && !isProduction;

    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const isPlaceholder = (val?: string) => {
      if (!val) return true;
      const s = val.toLowerCase().trim();
      return (
        s.includes('your_') ||
        s.includes('your-') ||
        s.includes('endpoint.upstash.io') ||
        s.includes('example') ||
        s.includes('placeholder') ||
        s.length < 10
      );
    };
    const hasUpstash = Boolean(upstashUrl && upstashToken && !isPlaceholder(upstashUrl) && !isPlaceholder(upstashToken));

    // 1. Custom shared store adapter (e.g. for testing distributed clusters or custom Redis)
    if (customStoreAdapter) {
      try {
        const { count, ttlSeconds } = await customStoreAdapter.increment(key, windowMs);
        if (count > maxRequests) {
          return {
            allowed: false,
            status: 429,
            retryAfterSeconds: ttlSeconds,
            message: `Too many requests to ${endpoint}. Rate limit exceeded. Please retry in ${ttlSeconds} seconds.`,
          };
        }
        return { allowed: true };
      } catch (err) {
        console.error('[ReliefAI RateLimiter] Custom store adapter error:', err instanceof Error ? err.message : 'Unknown error');
        if (isProduction || isTestEnv) {
          return {
            allowed: false,
            isBackendError: true,
            status: 503,
            message: `Service temporarily unavailable: Rate limit verification failed for ${endpoint}.`,
          };
        }
      }
    }

    // 2. Production Upstash Redis REST
    if (hasUpstash) {
      try {
        const { count, ttlSeconds } = await incrementUpstash(upstashUrl!, upstashToken!, key, windowMs);
        if (count > maxRequests) {
          return {
            allowed: false,
            status: 429,
            retryAfterSeconds: ttlSeconds,
            message: `Too many requests to ${endpoint}. Rate limit exceeded. Please retry in ${ttlSeconds} seconds.`,
          };
        }
        return { allowed: true };
      } catch (err) {
        console.error('[ReliefAI RateLimiter] Upstash Redis error:', err instanceof Error ? err.message : 'Unknown error');
        return {
          allowed: false,
          isBackendError: true,
          status: 503,
          message: `Service temporarily unavailable: Distributed rate limit verification failed for ${endpoint}.`,
        };
      }
    }

    // 3. Fail closed in production if shared store is missing
    if (isProduction) {
      console.error(`[ReliefAI Security Alert] Shared rate limit store is not configured in production for ${endpoint}. Failing closed safely.`);
      return {
        allowed: false,
        isBackendError: true,
        status: 503,
        message: 'Service unavailable: Distributed rate limit verification is required in production.',
      };
    }

    // 4. Non-production / local test fallback (in-memory)
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry) {
      rateLimitMap.set(key, { count: 1, lastRequestAt: now, firstRequestAt: now });
      return { allowed: true };
    }

    if (now - entry.firstRequestAt > windowMs) {
      rateLimitMap.set(key, { count: 1, lastRequestAt: now, firstRequestAt: now });
      return { allowed: true };
    }

    if (entry.count >= maxRequests) {
      const remainingSec = Math.ceil((windowMs - (now - entry.firstRequestAt)) / 1000);
      return {
        allowed: false,
        status: 429,
        retryAfterSeconds: remainingSec,
        message: `Too many requests to ${endpoint}. Rate limit exceeded. Please retry in ${remainingSec} seconds.`,
      };
    }

    entry.count += 1;
    entry.lastRequestAt = now;
    return { allowed: true };
  },

  /**
   * Checks if an email is currently locked out due to multiple failed login attempts
   */
  checkAccountLockout(email: string): { isLocked: boolean; remainingMinutes?: number; message?: string } {
    const clean = email.toLowerCase().trim();
    const entry = loginAttemptsMap.get(clean);
    if (!entry || !entry.lockoutUntil) return { isLocked: false };

    const now = Date.now();
    if (now < entry.lockoutUntil) {
      const remainingMin = Math.ceil((entry.lockoutUntil - now) / 60000);
      return {
        isLocked: true,
        remainingMinutes: remainingMin,
        message: `Account temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMin} minute(s).`,
      };
    }

    // Lockout expired, reset
    loginAttemptsMap.delete(clean);
    return { isLocked: false };
  },

  /**
   * Records a failed login attempt and calculates lockout if threshold is exceeded
   */
  recordFailedLogin(email: string): { attempts: number; isLockedNow: boolean; remainingAttempts: number; message?: string } {
    const clean = email.toLowerCase().trim();
    const entry = loginAttemptsMap.get(clean) || { attempts: 0 };
    entry.attempts += 1;

    if (entry.attempts >= MAX_FAILED_ATTEMPTS) {
      entry.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
      loginAttemptsMap.set(clean, entry);
      return {
        attempts: entry.attempts,
        isLockedNow: true,
        remainingAttempts: 0,
        message: 'Account locked for 15 minutes due to multiple failed login attempts.',
      };
    }

    loginAttemptsMap.set(clean, entry);
    const remaining = MAX_FAILED_ATTEMPTS - entry.attempts;
    return {
      attempts: entry.attempts,
      isLockedNow: false,
      remainingAttempts: remaining,
      message: `Invalid email or password. ${remaining} attempt(s) remaining before temporary account lockout.`,
    };
  },

  /**
   * Resets failed attempts after a successful login
   */
  recordSuccessfulLogin(email: string): void {
    const clean = email.toLowerCase().trim();
    loginAttemptsMap.delete(clean);
  },
};

/**
 * Extracts client IP safely according to verified trusted-proxy policy.
 * When TRUST_PROXY_HEADERS is 'true', headers from an upstream reverse proxy
 * (e.g. Cloudflare 'cf-connecting-ip', 'x-real-ip', or trusted 'x-forwarded-for') are evaluated.
 * When TRUST_PROXY_HEADERS is NOT enabled (or set to 'false'), client-supplied forwarding
 * headers are completely ignored to prevent IP spoofing and rate-limit evasion.
 */
export function getClientIp(req: Request): string {
  const isTrustedProxy = process.env.TRUST_PROXY_HEADERS === 'true';

  if (isTrustedProxy) {
    // 1. Cloudflare Connecting IP header
    const cfIp = req.headers.get('cf-connecting-ip');
    if (cfIp && cfIp.trim()) return cfIp.trim();

    // 2. Standard Real IP header from verified reverse proxy (e.g. Nginx, ALB)
    const realIp = req.headers.get('x-real-ip');
    if (realIp && realIp.trim()) return realIp.trim();

    // 3. Forwarded IP header: first IP is the client IP in standard proxy configurations
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      const first = forwarded.split(',')[0].trim();
      if (first) return first;
    }
  }

  // Direct socket IP if exposed by server runtime
  const directIp = (req as { ip?: string }).ip;
  if (directIp && directIp.trim()) {
    return directIp.trim();
  }

  // When trusted proxy policy is not active, client-supplied forwarding headers
  // are untrusted. Group direct connections into a single safe bucket.
  return 'direct-client';
}
