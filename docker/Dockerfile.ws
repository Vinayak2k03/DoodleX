FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm run db:generate

# Build all dependency packages
RUN pnpm --filter=@repo/backend-common run build
RUN pnpm --filter=@repo/common run build
RUN pnpm --filter=@repo/db run build

# Build ws-server
RUN pnpm --filter=ws-server run build

FROM base AS production
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

ENV PORT=8080
EXPOSE 8080
CMD ["pnpm", "run", "start:ws"]