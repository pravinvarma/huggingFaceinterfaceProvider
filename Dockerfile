# Multi-stage build for production deployment
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd client && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy backend dependencies and code
COPY package*.json ./
RUN npm install --production

COPY server.js index.js ./

# Copy built frontend from builder stage
COPY --from=builder /app/client/dist ./client/dist

# Expose port (Render uses PORT env variable)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["npm", "start"]

