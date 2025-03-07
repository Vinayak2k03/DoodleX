FROM node:22-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++ gcc

COPY ./packages ./packages
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY ./package.json ./package.json
COPY ./turbo.json ./turbo.json
COPY ./apps/ws-server ./apps/ws-server

RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run db:generate

RUN cd apps/ws-server && pnpm run build

EXPOSE 8080

CMD ["pnpm","run","start:ws"]