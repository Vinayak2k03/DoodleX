FROM node:22-alpine

WORKDIR /usr/src/app

COPY ./packages ./packages
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json
COPY ./apps/ws-server ./apps/ws-server

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm --filter @repo/db run db:generate

EXPOSE 8080

CMD ["pnpm","run","start:ws"]