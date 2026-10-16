# ReliefAI — Multi-Agency Disaster Response & Crisis Coordination Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_%2F_Mongoose_9-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini_1.5_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Security Audited](https://img.shields.io/badge/Security-RBAC_%26_Fail--Closed-green?style=flat-square)](./remediation_report.md)

**ReliefAI** is a mission-critical, full-stack disaster response and humanitarian crisis coordination platform engineered for regional disaster grids (with specialized operational configurations for Bangladesh disaster vectors, including Surma-Jamuna river basin flash flooding, Bay of Bengal coastal super cyclones, and urban landslides).

The platform bridges real-time distress signals from stranded citizens with tactical incident commanders, field search-and-rescue teams (FSCD / USAR), humanitarian logistics hubs (Red Crescent / NGOs), and government emergency operations centers (EOC).

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Multi-Role Access & Clearance Hierarchy](#multi-role-access--clearance-hierarchy)
- [Technology Stack](#technology-stack)
- [Architecture & Security Engineering](#architecture--security-engineering)
- [Environment Variable Configuration](#environment-variable-configuration)
- [Installation & Local Development](#installation--local-development)
- [Verification & Quality Gate Commands](#verification--quality-gate-commands)
- [Deployment Guide](#deployment-guide)
  - [Vercel Preview Deployments](#vercel-preview-deployments)
  - [Production Deployment](#production-deployment)
- [Production Readiness Requirements](#production-readiness-requirements)
- [License](#license)

---

## Project Overview

During major climate disasters, disconnected communications, unverified distress reports, and fragmented supply chains lead to critical delays in emergency relief. ReliefAI solves this operational challenge through:

1. **Deterministic Incident Triage:** Transforming unstructured voice and image distress reports into structured, geotagged, urgency-ranked incidents using Google Gemini multimodal AI (with built-in heuristic triage simulation fallback).
2. **Unified Incident Command System (ICS):** Providing real-time coordination across government agencies, armed forces rescue divisions, certified NGOs, and grassroots volunteer units.
3. **Resilient Dual-Mode Operation:** Built with offline-first data simulations and in-memory caches that run zero-config in local development while supporting high-availability MongoDB Atlas and distributed Redis clusters in production.

---

## Key Features

### 1. Tactical Emergency Operations Center (EOC HUD)
- Real-time command dashboard displaying live disaster telemetry, casualty figures, active hazards, and resource dispatch status.
- National and regional operational sector monitoring with high-priority alert broadcasting.

### 2. SOS Emergency Distress Dispatch
- **1-Touch SOS Beacon:** Instant emergency signal broadcast with browser GPS coordinates and offline-safe queueing.
- **Multimodal Crisis Assessment:** Ingests photo and audio reports for automated triage analysis.
- **Urgency Scoring & Prioritization:** Automated severity classification categorizing incidents from Routine to Critical (Life Threat) via Gemini 1.5 Flash (or deterministic fallback when unconfigured).

### 3. Tactical Vector Map & Shelter GIS Network
- Live disaster zone tracking with custom SVG tactical vector map of Bangladesh and optional Google Maps JavaScript API satellite integration.
- Real-time shelter database tracking capacity, current occupancy, safe drinking water, generator power, and medical supply reserves.

### 4. Supply Chain & Humanitarian Logistics Hub
- Warehouse inventory tracking across medical supplies, water purification kits, high-discharge pumps, and emergency food rations.
- Supply requisition workflow, low-stock threshold triggers, and relief convoy dispatch tracking.

### 5. Field Rescue & Responder Management
- Operational assignment tracking for Bangladesh Fire Service & Civil Defence (FSCD), Red Crescent (BDRCS), and Cyclone Preparedness Programme (CPP) units.
- Strict responder ownership enforcement: field teams manage only their assigned incidents, while commanders retain multi-unit dispatch oversight.

### 6. Transparent Aid & Humanitarian Donations
- Public donation portal supporting simulated mobile financial services (bKash, Nagad) and card checkout.
- Transparent ledger tracking fund allocations, relief impact metrics, and simulated transaction hashes.

### 7. Gemini AI Disaster Copilot
- AI-driven situation reports, damage extent estimations from disaster imagery, and automated resource recommendation summaries (uses live Google Gemini 1.5 Flash when `GEMINI_API_KEY` is configured; falls back gracefully to contextual rule-based simulations when unconfigured).

---

## Multi-Role Access & Clearance Hierarchy

ReliefAI implements a server-enforced clearance hierarchy with dedicated dashboards:

| Role | Dashboard Route | Clearance Scope |
| :--- | :--- | :--- |
| **Citizen** | `/dashboard/citizen` | 1-Touch SOS beacon, family safety check-ins, local shelter locator, personal SOS history. |
| **Rescue Team** | `/dashboard/rescue` | Tactical search-and-rescue (SAR) queue, field triage, victim status updates, VHF radio net status. |
| **NGO Logistics** | `/dashboard/ngo` | Humanitarian relief drives, warehouse supply stocks, aid convoy routing, distribution logs. |
| **Government EOC** | `/dashboard/government` | National disaster grid oversight, hydrological telemetry, inter-agency resource requisition. |
| **Admin Commander** | `/dashboard/admin` | Multi-agency RBAC user governance, NGO accreditation approvals, system health, and audit logs. |
| **Volunteer** | `/dashboard/volunteer` | Field deployment coordination, community aid delivery tasks, local relief support. |

---

## Technology Stack

### Core Framework & Language
- **Next.js 16.4.0 (App Router):** Modern server components, Route Handlers, middleware, and Turbopack bundler.
- **React 19.3.0:** Modern client hooks and concurrent rendering features.
- **TypeScript 5.x:** Strict end-to-end typing across models, API contracts, and components.

### UI & Aesthetics
- **Tailwind CSS v4:** Zero-runtime utility styling with Turbopack integration.
- **Framer Motion 14.1.0:** Fluid micro-interactions, smooth panel transitions, and status badge pulses.
- **Lucide React 1.55.0:** High-contrast tactical iconography.
- **Recharts 3.10.1:** Crisis analytics, SOS trends, and shelter occupancy data visualizations.
- **React Hook Form 7.89.0 & Zod 4.6.5:** Validated forms with type-safe schema parsing.

### Backend, Database & Cloud
- **MongoDB Atlas & Mongoose 9.11.1:** Persistent document store for Users, Disasters, Shelters, Supplies, SOS Requests, and Donations.
- **In-Memory Zero-Config Engine:** Automatic local fallback when MongoDB is unconfigured for local development.
- **Google Gemini 1.5 Flash (`@google/generative-ai` 0.24.1):** Multimodal vision damage detection, incident classification, and situation summarization.
- **Firebase Web SDK 13.0.0:** Cloud media storage for field photos and relief asset telemetry (optional cloud integration).
- **Google Maps JavaScript API:** Interactive satellite and terrain mapping (optional cloud integration, with custom SVG vector fallback).

### Security & Authentication
- **Jose 6.2.12:** High-performance JWT signing and verification.
- **Bcryptjs 3.0.3:** Salted cryptographic password hashing.
- **Upstash Redis REST:** Distributed rate limiting with strict fail-closed enforcement in production.

---

## Architecture & Security Engineering

ReliefAI follows a defense-in-depth security model verified by automated test suites (see audit report in [`remediation_report.md`](./remediation_report.md)):

### 1. Production-Grade Dual-Token JWT Architecture
- **Access Token:** Short-lived (15 minutes), signed via HS256, transmitted in `httpOnly`, `secure`, `sameSite: 'lax'` cookies (`reliefai_access_token`).
- **Refresh Token:** Long-lived (7 days, or 30 days with Remember Me), signed with a distinct secret, stored in `reliefai_refresh_token` with session rotation and revocation tracking.
- **Zero Insecure Defaults:** In production (`NODE_ENV === 'production'`), secrets must be explicitly defined and at least 32 characters long. Unset secrets trigger immediate process termination.

### 2. Server-Side Role-Based Access Control (RBAC)
- **Middleware Guard (`src/middleware.ts`):** Edge-level route protection intercepting all `/dashboard/:path*` and `/api/admin/:path*` requests, redirecting unauthorized users or returning HTTP 403.
- **API Guard (`requireAuth`):** Programmatic clearance verification in API Route Handlers ensuring users possess required clearance before executing mutations.
- **Explicit Responder Ownership:** Field responders can only mutate records belonging to their assigned team (`assignedTeamId`). Heuristic-based or unassigned team mutation attempts are rejected with HTTP 403 (`FORBIDDEN_RESOURCE_OWNERSHIP`).

### 3. Distributed Rate Limiting & Fail-Closed Safety
- Public mutation endpoints (`POST /api/sos`, `POST /api/donations`) enforce shared rate limits across serverless instances via Upstash Redis REST.
- **Production Invariant (Fail-Closed):** If the distributed rate limiter is unconfigured or unreachable in production, requests fail closed safely with HTTP 503 rather than failing open. Local development automatically falls back to an in-memory tracker.

### 4. Anti-Spoofing Trusted Proxy Configuration
- Controlled via `TRUST_PROXY_HEADERS`. When set to `false` or omitted, client-supplied forwarding headers (`X-Forwarded-For`, `X-Real-IP`) are strictly ignored to prevent client IP spoofing and rate-limit evasion. Set to `true` only behind verified reverse proxies (Cloudflare, AWS ALB, Vercel Edge).

### 5. Brute-Force & Abuse Mitigation
- **Account Lockout:** Accounts are temporarily locked for 15 minutes after 5 consecutive failed login attempts.
- **OTP Rate-Limiting:** 6-digit numeric verification OTPs enforce a 60-second cooldown and a maximum of 5 requests per 15-minute window.
- **Development Outbox Isolation:** The `/api/auth/dev-outbox` debug endpoint is strictly disabled in production (`NODE_ENV === 'production'` returns HTTP 404).

---

## Environment Variable Configuration

Copy `.env.example` to `.env.local` to configure your environment:

```bash
cp .env.example .env.local
```

> [!WARNING]
> Never commit real passwords, private keys, database connection strings, or cloud API tokens to version control. Keep `.env.local` in `.gitignore`.

### Environment Variables Reference

| Variable | Required In | Description & Format |
| :--- | :---: | :--- |
| `MONGODB_URI` | Production | MongoDB Atlas connection string (`mongodb+srv://...`). If left blank in local dev, ReliefAI runs in resilient in-memory mode. |
| `JWT_ACCESS_SECRET` | Production | Secret key for signing access tokens (minimum 32 characters). Fallback alias: `JWT_SECRET`. |
| `JWT_REFRESH_SECRET` | Production | Secret key for signing refresh tokens (minimum 32 characters). |
| `UPSTASH_REDIS_REST_URL` | Production | Upstash Redis REST endpoint for distributed rate limiting (`https://...upstash.io`). |
| `UPSTASH_REDIS_REST_TOKEN` | Production | Upstash Redis REST bearer authentication token. |
| `TRUST_PROXY_HEADERS` | Production | Set to `'true'` ONLY when behind a verified reverse proxy. Defaults to `'false'` to prevent IP spoofing. |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for live AI multimodal damage analysis. Falls back to simulated engine when omitted. |
| `OPENAI_API_KEY` | Optional | Secondary LLM fallback provider key. |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Optional | Google Maps JavaScript API key. When omitted, the tactical SVG vector map renders. |
| `NEXT_PUBLIC_FIREBASE_*` | Optional | Firebase configuration for live cloud file storage. |
| `NEXT_PUBLIC_APP_URL` | All | Canonical application URL (e.g., `http://localhost:3000` or production domain). |
| `NEXT_PUBLIC_OPERATIONAL_SECTOR` | All | Operational sector identifier (e.g., `BANGLADESH_NATIONAL_GRID`). |
| `NEXT_PUBLIC_MESH_NODE_ID` | All | Incident Command node tag (e.g., `BD_DHAKA_CENTRAL_EOC`). |

---

## Installation & Local Development

### Prerequisites
- **Node.js:** `>= 20.9.0` (Node 20 LTS or Node 22 LTS recommended; tested on Node 24)
- **Package Manager:** `npm` (bundled with Node.js)

### 1. Clone & Install Dependencies

> [!NOTE]
> The repository URL below is a placeholder because no Git remote is currently configured on this repository. Replace `<repository-url>` with your actual repository URL.

```bash
# Clone the repository (placeholder URL — replace with your actual remote URL)
git clone https://github.com/<your-username>/<your-repo-name>.git
cd relief-ai
npm install
```

### 2. Configure Environment
Create your local environment file:

```bash
cp .env.example .env.local
```

*(In local development, ReliefAI functions out of the box with zero external dependencies by utilizing in-memory database simulation and development outbox).*

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Verification & Quality Gate Commands

The following npm scripts (configured in [`package.json`](./package.json)) and CLI verification commands have been executed and verified against the codebase:

| Action | Command | Purpose & Description | Verified Result |
| :--- | :--- | :--- | :--- |
| **Development** | `npm run dev` | Starts local Next.js development server with Turbopack. | Ready on `http://localhost:3000`. |
| **Production Build** | `npm run build` | Compiles an optimized production build (`next build`), verifying static generation and TypeScript types across all 57 routes. | **PASS** (57/57 routes compiled successfully). |
| **Production Server** | `npm start` | Runs the compiled production application server locally (`next start`). | Ready for production traffic. |
| **Code Linting** | `npm run lint` | Runs ESLint analysis across the repository (`eslint`). | **PASS** (0 errors, 42 stylistic warnings). |
| **Type Check** | `npx tsc --noEmit` | Directly executes TypeScript compiler validation without emitting artifacts (use `npx.cmd tsc --noEmit` on Windows PowerShell). | **PASS** (0 type errors). |
| **Security Test Suite** | `node --experimental-strip-types scratch/test-remediation-security.mjs` | Automated verification suite testing explicit responder ownership, trusted proxy policies, rate-limiting fail-closed, and admin provisioning. | **PASS** (25/25 tests passed). |
| **Migration Dry-Run** | `node scripts/migrate-rescue-teams.mjs --dry-run` | Evaluates rescue personnel team assignments in dry-run mode without performing database writes. | **PASS** (0 database writes, dry-run completed). |
| **MongoDB Integration Test** | `node --experimental-strip-types scratch/test-mongodb-integration.mjs` | Persistent database integration test suite. | **SKIPPED** (cleanly skipped when `MONGODB_TEST_URI` is unset; requires active MongoDB instance). |

For detailed audit results and gate verification records, see [`remediation_report.md`](./remediation_report.md).

---

## Deployment Guide

### Vercel Preview Deployments

Preview deployments provide isolated environments for pull requests and QA verification without affecting production data:

1. Push your working branch to your Git remote.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New Project** and import your repository.
3. Configure project settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
4. Add Preview Environment Variables in **Project Settings > Environment Variables** (Scope: Preview):
   - `JWT_ACCESS_SECRET` (generate using `openssl rand -hex 32`)
   - `JWT_REFRESH_SECRET` (generate using `openssl rand -hex 32`)
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel preview domain)
5. Click **Deploy**. Vercel will generate an isolated preview URL for each pull request. In preview environments without external cloud services, ReliefAI automatically runs with resilient in-memory fallbacks.

### Production Deployment

> [!CAUTION]
> **Mandatory Infrastructure Setup & Operational Approval Gate**
>
> Live production deployment requires complete external cloud infrastructure provisioning and Incident Command sign-off. The codebase enforces strict fail-closed security invariants in production; deployment is blocked until all staging prerequisites in [`remediation_report.md`](./remediation_report.md) are verified:
>
> 1. **External Cloud Infrastructure:** MongoDB Atlas replica set, distributed Upstash Redis REST rate limiting, and enterprise SMTP delivery must be provisioned.
> 2. **Operational Sign-Off:** Incident Command and agency operators must sign off on personnel assignments prior to applying database migrations.

Follow these required preparation and deployment steps:

1. **Provision External Cloud Infrastructure:**
   - MongoDB Atlas replica set (or persistent MongoDB cluster).
   - Upstash Redis REST database for distributed rate limiting.
   - Production SMTP email provider (e.g., SendGrid, Postmark, AWS SES).
2. **Configure Production Environment Variables:**
   - In your production host (Vercel Production, AWS ECS/Amplify, Docker, or bare metal), set all mandatory production variables:
     - `NODE_ENV=production`
     - `MONGODB_URI`
     - `JWT_ACCESS_SECRET` (minimum 32 characters)
     - `JWT_REFRESH_SECRET` (minimum 32 characters)
     - `UPSTASH_REDIS_REST_URL`
     - `UPSTASH_REDIS_REST_TOKEN`
     - `TRUST_PROXY_HEADERS=true` (only if behind verified reverse proxy: Cloudflare, AWS ALB, Vercel Edge)
     - `NEXT_PUBLIC_APP_URL` (canonical production domain)
3. **Run Staging Migration & Verification:**
   - Execute dry-run migration: `NODE_ENV=staging node scripts/migrate-rescue-teams.mjs --dry-run`
   - Create pre-migration backup artifact via MongoDB Atlas Snapshot or Database Tools.
   - Run authorized migration script with required approval flags (see [`remediation_report.md`](./remediation_report.md)).
4. **Deploy Application Artifact:**
   - Build production bundle: `npm run build`
   - Start production server: `npm start` (or deploy via container / serverless pipeline).
5. **Post-Deployment Verification:**
   - Verify health check and API endpoints.
   - Confirm public mutation endpoints (`POST /api/sos`, `POST /api/donations`) enforce distributed rate limits.
   - Verify that `/api/auth/dev-outbox` returns HTTP 404 in production.

---

## Production Readiness Requirements

> [!IMPORTANT]
> **Mandatory Production Service Requirements**
>
> Deploying ReliefAI to a live production environment requires correctly configured external cloud infrastructure. The application enforces strict runtime safety checks that will halt or fail closed if production services are missing:
>
> 1. **MongoDB Atlas Replica Set:** Set a valid `MONGODB_URI` pointing to a production cluster. The database handles User credentials, SOS distress signals, and incident history.
> 2. **Distributed Rate Limiting (Upstash Redis):** `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are mandatory in production. Without these, public mutation endpoints fail closed with HTTP 503 to protect against distributed abuse.
> 3. **Cryptographically Secure Secrets:** Both `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be set to unique, unguessable strings of at least 32 characters (`openssl rand -hex 32`). Short or placeholder secrets will throw fatal errors at runtime.
> 4. **Reverse Proxy Configuration:** If deployed behind Cloudflare, Vercel Edge, or an AWS Application Load Balancer, configure `TRUST_PROXY_HEADERS=true` only after ensuring untrusted client headers are stripped by the ingress proxy.
> 5. **External SMTP Delivery:** Transition from the in-memory development outbox to an enterprise SMTP provider (SendGrid, Postmark, AWS SES) for production email verification and password resets.

---

## License

This repository does not currently contain an open-source license file and is designated private in [`package.json`](./package.json). All rights are reserved until formal licensing terms are published by the project maintainers.
