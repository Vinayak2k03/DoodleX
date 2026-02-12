FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm run db:generate

# Build backend-common then ws-server
RUN pnpm --filter=@repo/backend-common run build
RUN pnpm --filter=ws-server run build

FROM base AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

EXPOSE 8080
CMD ["pnpm", "run", "start:ws"]