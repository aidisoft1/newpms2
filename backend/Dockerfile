# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
# build typescript at runtime using ts-node-dev or we can pre-build
RUN npm install ts-node-dev typescript @types/node --save-dev
ENV NODE_ENV=production
ENV PORT=4000
# wait-port script (tiny) to ensure db is reachable is handled inside prismaClient retry
CMD ["node","node_modules/ts-node-dev/bin/ts-node-dev.js","--exit-child","--transpile-only","src/index.ts"]
