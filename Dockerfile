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

# Copy backend dependencies and code
COPY package*.json ./
RUN npm install --production

COPY server.js index.js ./

# Copy built frontend
COPY --from=builder /app/client/dist ./client/dist

# Expose port
EXPOSE 3000

# Start server
CMD ["npm", "start"]

