FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client first
RUN pnpm run db:generate

# Build backend-common first
RUN pnpm --filter=@repo/backend-common run build

# Re-run install to properly link the built backend-common package
RUN pnpm install --frozen-lockfile

# Now build ws-server
RUN pnpm --filter=ws-server run build

FROM base
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 8080
CMD ["pnpm", "run", "start:ws"]