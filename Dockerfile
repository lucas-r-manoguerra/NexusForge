# Stage 1: Builder
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN node_modules/.bin/astro build

# Stage 2: Runner
FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/dist ./dist

EXPOSE 4321

CMD ["npx", "serve", "dist", "-l", "4321"]
