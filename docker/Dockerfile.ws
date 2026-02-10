FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /usr/src/app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build dependencies in order
RUN cd packages/backend-common && pnpm run build
RUN cd packages/db && pnpm run db:generate
RUN cd apps/ws-server && pnpm run build

FROM base
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .

# Install wget for health checks
RUN apk add --no-cache wget

EXPOSE 8080
CMD ["pnpm", "run", "start:ws"]