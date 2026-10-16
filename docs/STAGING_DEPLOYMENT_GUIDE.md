# ReliefAI Bangladesh — Staging Deployment & Operational Runbook

This guide outlines the complete operational procedures for deploying, configuring, and verifying ReliefAI Bangladesh in a staging environment.

---

## 1. Environment Variable Classification

### Production & Staging Required Variables

| Variable | Scope | Minimum Requirements / Format | Purpose |
|---|---|---|---|
| `MONGODB_URI` | Server | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>` | Primary persistent data store (MongoDB Atlas M10+ recommended for staging) |
| `JWT_ACCESS_SECRET` | Server | Min 32 hex/base64 characters (`openssl rand -hex 32`) | Access token signing (15m expiry) |
| `JWT_SECRET` | Server | Min 32 characters (can match `JWT_ACCESS_SECRET`) | Legacy fallback for access tokens |
| `JWT_REFRESH_SECRET` | Server | Min 32 characters (`openssl rand -hex 32`, distinct from access secret) | Refresh token signing (7d expiry, HttpOnly cookie) |
| `UPSTASH_REDIS_REST_URL` | Server | `https://<cluster-id>.upstash.io` | Distributed Redis endpoint for multi-instance rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Upstash REST Bearer token | Distributed Redis authentication token |
| `GEMINI_API_KEY` | Server | Google AI Studio key (`AIzaSy...`) | Multimodal damage vision, Bengali transcription, SOS urgency triage |
| `TRUST_PROXY_HEADERS` | Server | `true` or `false` | Must be `true` only if deployed behind a sanitized reverse proxy (Vercel, Cloudflare, ALB) |

### Optional Integrations

| Variable | Scope | Purpose | Fallback Behavior if Omitted |
|---|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Client | Google Maps JavaScript API tile layer | Renders high-fidelity Bangladesh Tactical Vector SVG HUD |
| `OPENAI_API_KEY` | Server | Secondary LLM fallback | Operates exclusively on Gemini 2.5 Flash / Pro |
| `NEXT_PUBLIC_FIREBASE_*` | Client | Cloud photo storage & remote messaging | Utilizes localized object storage and browser notifications |
| `NEXT_PUBLIC_APP_URL` | Client/Server | Canonical URL for webhook callbacks & redirects | Defaults to `http://localhost:3000` |

---

## 2. Official Provider Credential Acquisition Procedures

### A. MongoDB Atlas (Staging Database)
1. Log in to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Create or select a dedicated Staging Project (`ReliefAI-Staging`).
3. Deploy an M10 or serverless cluster in the `ap-southeast-1` (Singapore) or `ap-south-1` (Mumbai) region for minimal latency to Bangladesh.
4. Under **Database Access**, create a dedicated database user (e.g., `reliefai_staging_app`) with read and write privileges to the `reliefai_staging` database only.
5. Under **Network Access**, whitelist the outbound IP addresses of your staging application server (or enable VPC peering / AWS PrivateLink).
6. Under **Clusters > Connect > Drivers**, select Node.js and copy the connection string.
7. Replace `<password>` with the generated secure password and ensure database name is `reliefai_staging`.

### B. Upstash Redis (Distributed Rate Limiting)
1. Log in to [Upstash Console](https://console.upstash.com/).
2. Create a new Redis Database:
   - Name: `reliefai-staging-ratelimit`
   - Region: Regional replica matching MongoDB cluster (`ap-southeast-1` or `ap-south-1`)
   - Primary: Serverless
3. In the database dashboard, scroll to **REST API** section.
4. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
5. **Security Note:** In production/staging, ReliefAI fails closed with HTTP 503 if Upstash Redis credentials are placeholders or unreachable, preventing rate limit bypass on public endpoints.

### C. Google AI Studio (Gemini 2.5)
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. Click **Get API key** > **Create API key in new project**.
3. Label the key `reliefai-staging-gemini`.
4. Restrict key usage if applicable to Vertex AI / Generative Language APIs.
5. Store strictly as `GEMINI_API_KEY` (server-side). **Never use `NEXT_PUBLIC_` prefix.**

### D. Google Cloud Console (Google Maps - Optional)
1. Navigate to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an API Key labeled `reliefai-staging-maps`.
3. In **API Restrictions**, restrict the key to **Maps JavaScript API**.
4. In **Application Restrictions**, restrict HTTP referrers to your staging domain (e.g., `https://staging.reliefai-bangladesh.org/*`).

---

## 3. Staging Deployment Checklist

### Pre-Deployment
- [ ] Staging `.env` populated with valid provider credentials (no placeholder values).
- [ ] Automated rate limiter verified against Upstash Redis.
- [ ] Database tools (`mongodump` / `mongorestore` v100+) installed on maintenance runner.
- [ ] Staging database initialized and isolated from development.
- [ ] Reverse proxy configured to sanitize `X-Forwarded-For` if `TRUST_PROXY_HEADERS=true`.

### Staging Verification Run
1. Run full type check: `npm run type-check` (or `tsc --noEmit`).
2. Run security remediation test suite: `node --import tsx .\scratch\test-remediation-security.mjs`.
3. Run persistent MongoDB integration tests: `node --import tsx .\scratch\test-mongodb-integration.mjs`.
4. Perform production build: `npm run build`.
5. Deploy bundle to staging runtime environment.

---

## 4. Responder Migration & Approval Protocol (Phase 4)

Before executing any database migration in staging or production:

1. **Verify Source Restorable Backup:** A full dump must be created and restored into a test database verifying 100% document integrity.
2. **Incident Command Sign-Off:** The following pending responder records require manual human mapping approval:
   - `Rescue Sajjad` (Badge `UNKNOWN-VOL-99`): Unassigned. Requires Incident Command verification.
   - `Officer Kamal` (Badge `FSCD-USAR-DIV1-CPP-JOINT`): Ambiguous joint badge. Requires team assignment.
   - `Rescue Tareq` (Reference to `team-nonexistent-999`): Invalid team reference. Requires reassignment to a verified unit.
   - `Sr. SO Rafiq` (Badge `FSCD-HQ-USAR-08`): Proposed for `team-04`. Awaiting formal roster confirmation.
3. **Audit Trail Preservation:** The migration script records all mappings with timestamps and operator signatures in `RescueTeamAuditLog`.

---

## 5. Emergency Rollback Procedure

If unexpected errors occur post-deployment:
1. Revert application container to the previous container image tag.
2. If schema corruption occurs, restore the verified pre-migration backup:
   ```bash
   mongorestore --uri="$MONGODB_STAGING_URI" --drop --dir=./backups/staging_pre_migration_backup/
   ```
3. Purge Upstash rate-limit cache:
   ```bash
   curl -X POST "$UPSTASH_REDIS_REST_URL/flushdb" -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
   ```
4. Verify HTTP 200 on `/api/health` and `/api/auth/me`.
