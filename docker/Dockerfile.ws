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
RUN cd packages/backend-common && pnpm run build

# Verify backend-common was built correctly
RUN ls -la packages/backend-common/dist/

# Change moduleResolution to node16 for better compatibility with pnpm workspaces
RUN sed -i 's/"moduleResolution": "bundler"/"moduleResolution": "node16"/' apps/ws-server/tsconfig.json

# Remove project references to avoid composite build issues
RUN sed -i '/"references"/,/\]/d' apps/ws-server/tsconfig.json

# Build ws-server
RUN cd apps/ws-server && pnpm run build

FROM base
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 8080
CMD ["pnpm", "run", "start:ws"]