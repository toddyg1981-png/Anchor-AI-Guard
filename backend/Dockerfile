FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci
RUN npm run prisma:generate

COPY src ./src
COPY tsconfig.json ./

ARG BUILD_VERSION=3
RUN echo "Build version: $BUILD_VERSION"
RUN rm -rf dist
RUN npm run build
RUN node -e "const fs=require('fs');const c=fs.readFileSync('dist/server.js','utf8');if(c.includes('import ')||c.includes('export ')){console.error('ESM output detected');process.exit(1);}console.log('CJS output detected');"

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

ENV NODE_ENV=production
EXPOSE 3001

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
