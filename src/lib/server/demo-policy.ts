import { NextResponse } from 'next/server';

/**
 * ReliefAI - Server-Controlled Showcase & Demo Account Security Policy
 *
 * Defines strict, server-side policies for platform showcase evaluation:
 * 1. Server-controlled designated demo account whitelist.
 * 2. Immutable role & identity guarantees (no client-provided overrides).
 * 3. Centralized default-deny mutation lock when SHOWCASE_MODE=true.
 *
 * ENVIRONMENT ISOLATION NOTICE:
 * SHOWCASE_MODE is designed for dedicated staging and showcase evaluation instances.
 * It must NOT be enabled in multi-tenant production environments containing real users,
 * because the mutation freeze intentionally blocks persistent mutations (password changes,
 * profile edits, and data creation) across all non-allowlisted API routes to preserve
 * test scenario consistency.
 */

export const DESIGNATED_DEMO_ACCOUNTS = [
  { role: 'super_admin', email: 'superadmin@relief.ai', expectedRole: 'super_admin' },
  { role: 'admin', email: 'admin@relief.ai', expectedRole: 'admin' },
  { role: 'government', email: 'gov@relief.ai', expectedRole: 'government' },
  { role: 'ngo', email: 'ngo@relief.ai', expectedRole: 'ngo' },
  { role: 'rescue_team', email: 'rescue@relief.ai', expectedRole: 'rescue_team' },
  { role: 'volunteer', email: 'volunteer@relief.ai', expectedRole: 'volunteer' },
  { role: 'citizen', email: 'citizen@relief.ai', expectedRole: 'citizen' },
] as const;

export const DESIGNATED_DEMO_EMAILS: ReadonlySet<string> = new Set(
  DESIGNATED_DEMO_ACCOUNTS.map((a) => a.email.toLowerCase())
);

/**
 * Returns true if SHOWCASE_MODE environment variable is explicitly set to 'true'.
 * Default: false.
 */
export function isShowcaseMode(): boolean {
  return process.env.SHOWCASE_MODE === 'true';
}

/**
 * Validates whether an email belongs to the predefined server-controlled demo accounts.
 */
export function isDesignatedDemoEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  return DESIGNATED_DEMO_EMAILS.has(email.toLowerCase().trim());
}

/**
 * Returns expected role for a designated demo email.
 */
export function getDesignatedDemoRole(email: string): string | undefined {
  const clean = email.toLowerCase().trim();
  const found = DESIGNATED_DEMO_ACCOUNTS.find((a) => a.email === clean);
  return found?.expectedRole;
}

/**
 * Explicit allowlist of mutation endpoints permitted during Showcase Mode.
 * Only flows demonstrably required for authentication sessions and ephemeral evaluations are allowed.
 */
const SHOWCASE_ALLOWLISTED_MUTATION_PATHS = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/ai/chat',
  '/api/ai/triage',
];

/**
 * Evaluates whether an operation should be restricted in Showcase Mode.
 * Implements a strict default-deny policy: all non-GET/HEAD/OPTIONS mutating requests
 * are blocked unless explicitly allowlisted above.
 */
export function isShowcaseMutationBlocked(
  pathname: string,
  method: string
): { blocked: boolean; reason?: string; code?: string } {
  if (!isShowcaseMode()) {
    return { blocked: false };
  }

  const upperMethod = method.toUpperCase();
  if (upperMethod === 'GET' || upperMethod === 'HEAD' || upperMethod === 'OPTIONS') {
    return { blocked: false };
  }

  // Explicit allowlist check
  const isAllowlisted = SHOWCASE_ALLOWLISTED_MUTATION_PATHS.some(
    (allowed) => pathname === allowed || pathname.startsWith(allowed + '/')
  );

  if (isAllowlisted) {
    return { blocked: false };
  }

  return {
    blocked: true,
    code: 'SHOWCASE_MUTATION_RESTRICTED',
    reason: 'Modifications and persistent mutations are disabled in Showcase Demo Mode to preserve platform evaluation integrity.',
  };
}

/**
 * Defense-in-depth helper for route handlers to enforce the showcase mutation restriction
 * independently of edge middleware.
 */
export function assertShowcaseMutation(
  req: Request | { method: string },
  pathname: string
): NextResponse | null {
  const check = isShowcaseMutationBlocked(pathname, req.method);
  if (check.blocked) {
    return NextResponse.json(
      { error: check.reason, code: check.code || 'SHOWCASE_MUTATION_RESTRICTED' },
      { status: 403 }
    );
  }
  return null;
}
