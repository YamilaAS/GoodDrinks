# --- Stage 1: Dependencies & Development / Test ---
FROM node:20-alpine AS dev

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5003

CMD ["node", "src/server.js"]

# --- Stage 2: Production Build ---
FROM dev AS builder

RUN npm prune --omit=dev

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/src ./src

USER node

EXPOSE 5003

CMD ["node", "src/server.js"]