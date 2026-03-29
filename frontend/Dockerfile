# Stage 1: Install dependencies
FROM node:20-alpine AS deps
# Install curl here if you want to use it for health checks later
RUN apk add --no-cache curl
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app

# --- CRITICAL FIX START ---
# These ARGs allow Render's "Build Args" to pass through to Next.js
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
# --- CRITICAL FIX END ---

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Only copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Optional: Ping the backend during build to wake it up
# Note: This only happens during DEPLOYMENT.
RUN apk add --no-cache curl && \
    curl -s https://project-aura-1.onrender.com/health || true

CMD ["npm", "start"]