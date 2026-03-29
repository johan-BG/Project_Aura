# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# Use --legacy-peer-deps to handle the react-identicons conflict
RUN npm install --legacy-peer-deps

# Stage 2: Rebuild the source code
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Set build-time env if needed (e.g., your Backend URL)
ENV NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
RUN npm run build

# Stage 3: Production server
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

# Only copy necessary files for a smaller image
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN npm run build

EXPOSE 3000

RUN curl -s https://project-aura-1.onrender.com/health || true
# Next.js production server
CMD ["npm", "start"]