# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/azora-buildspaces/package.json ./apps/azora-buildspaces/
RUN corepack enable && pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable && pnpm --filter azora-buildspaces build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/azora-buildspaces/public ./apps/azora-buildspaces/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/azora-buildspaces/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/azora-buildspaces/.next/static ./apps/azora-buildspaces/.next/static
COPY --from=builder /app/apps/azora-buildspaces/scripts/healthcheck.js ./scripts/healthcheck.js

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD node /app/scripts/healthcheck.js

CMD ["node", "apps/azora-buildspaces/server.js"]
