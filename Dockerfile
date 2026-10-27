# ==============================================================================
# ReliefAI Multi-Stage Production Container
# Optimized for Render, Railway, AWS ECS, and Docker deployments
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Dependencies Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app

# Install OpenSSL for Prisma engine binary compilation
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

# ------------------------------------------------------------------------------
# 2. Builder Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set dummy DATABASE_URL during build for Prisma Client code generation
ENV DATABASE_URL="postgresql://build_user:build_pass@localhost:5432/reliefai_build"
ENV NEXT_STANDALONE="true"
ENV DOCKER_BUILD="true"
ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1

# Generate Prisma Client and build standalone Next.js bundle
RUN npx prisma generate
RUN npm run build

# ------------------------------------------------------------------------------
# 3. Production Runner Stage
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl curl bash

ENV NODE_ENV="production"
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create unprivileged system user for hardened container security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets and standalone server bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000 10000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

CMD ["node", "server.js"]
