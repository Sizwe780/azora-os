FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat && corepack enable

# Copy workspace manifests
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY apps/azora-buildspaces ./apps/azora-buildspaces
COPY components.json ./components.json

# Install only what we need for this workspace and build
RUN pnpm install --frozen-lockfile --filter azora-buildspaces...
RUN pnpm --filter azora-buildspaces build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app
COPY --from=builder /app/apps/azora-buildspaces/.next ./.next
COPY --from=builder /app/apps/azora-buildspaces/public ./public
COPY --from=builder /app/apps/azora-buildspaces/package.json ./package.json
COPY --from=builder /app/apps/azora-buildspaces/scripts ./scripts
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node /app/scripts/healthcheck.js

CMD ["node", "./node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
