# ================================
# Stage 1: Build dependencies
# ================================
FROM node:20-alpine AS deps

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies only
RUN pnpm install --frozen-lockfile --prod --ignore-scripts

# ================================
# Stage 2: Build application
# ================================
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (including dev for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend and server
RUN pnpm vite build && \
    pnpm tsup server/server.ts --format cjs --platform node --target node20 --outDir dist-server --no-splitting --no-minify --external vite

# ================================
# Stage 3: Production runtime
# ================================
FROM node:20-alpine AS runner

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server
COPY --from=builder /app/index.html ./index.html
COPY --from=builder /app/admin.html ./admin.html
COPY --from=builder /app/docs.html ./docs.html

# Copy production node_modules
COPY --from=deps /app/node_modules ./node_modules

# Copy package.json for reference
COPY --from=builder /app/package.json ./package.json

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "dist-server/server.js"]
