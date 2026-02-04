FROM node:18-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./

ARG BUILD_VERSION=5
RUN echo "Build version: $BUILD_VERSION"
RUN rm -rf dist
RUN npm run build

FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
