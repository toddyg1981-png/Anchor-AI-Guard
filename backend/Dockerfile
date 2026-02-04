# FORCE FRESH BUILD - Railway clear cache required
FROM node:18-slim AS builder

WORKDIR /app

# Install OpenSSL for Prisma generate
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
COPY backend/prisma ./prisma

# Clean install - no cache
RUN npm cache clean --force
RUN rm -rf node_modules
RUN npm ci

# Generate Prisma for debian-openssl-3.0.x
RUN npx prisma generate

COPY backend/src ./src
COPY backend/tsconfig.json ./

RUN rm -rf dist
RUN npm run build

FROM node:18-slim

# Install OpenSSL for Prisma runtime
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY backend/package.json ./

ENV NODE_ENV=production
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
