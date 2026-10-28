# Paired frontend/backend repair

Use this branch with the backend `fix/security-and-integration` branch. NestJS owns active user authentication and operational permissions.

## Configuration

- Set server-only `INTERNAL_API_URL` to the NestJS origin (local default: `http://localhost:5001`). Browser API requests now use frontend `/api` routes so HttpOnly cookies reach frontend middleware. Configure this variable at frontend build and runtime; rewrites are built into the deployment.
- Set `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` to the backend values. They must be distinct and at least 32 characters in production. The backend accepts the legacy access variable `JWT_BEARER_SECRET` as an alias. Changing these secrets invalidates old tokens.
- `NEXT_PUBLIC_API_URL` no longer controls the central API client. Do not point browser authentication directly at a separate backend host.
- Local AI API authorization calls backend `/auth/me` so revoked sessions and role/status changes are respected. Backend outages fail closed with 503.

## Verification

Run `npm run test:integration` for API client header checks. Run `npm run build` and `npx tsc --noEmit`. The existing `npm test` suite covers the legacy local database/auth helpers; it does not certify the NestJS integration. The backend branch includes actual HTTP authorization/session regression tests.

On staging, verify login, page reload, protected dashboard navigation, access-token expiry, refresh, logout, password change, profile update, citizen denial on operational records, and operational-user access. Browser networking should use `/api` on the frontend origin.

## Legacy authentication routes

The original Next.js-only verification, password-reset, email-change and bootstrap handlers operate on a separate local database. They must not mutate backend identities. The middleware blocks those unported authentication paths with a service-unavailable response. Port these workflows to NestJS before enabling them; do not initialize a second administrator store through the old bootstrap API.

Production credential rotation, existing-user data migration, and deployment are separate from these source changes. Do not apply the legacy Prisma schema migration to the NestJS database as part of this repair.

Next.js and eslint-config-next are updated to 16.4.3, addressing the Next.js advisories reported for 16.4.0. Compatible lockfile repairs were applied. The audit still reports high-severity Firebase/gRPC and Prisma/deepmerge dependency chains whose suggested fixes involve breaking dependency changes; no forced downgrade or major migration was applied.
