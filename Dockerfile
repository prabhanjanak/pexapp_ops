# ==============================================================================
# SANKARA EYE HOSPITAL - PROJECT PATIENT EXPERIENCE (PPE)
# PRODUCTION DOCKERFILE
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
COPY pxapp/package.json ./pxapp/

# Configure npm for network resilience & install dependencies
RUN npm config set fetch-retries 5 \
    && npm config set fetch-retry-mintimeout 20000 \
    && npm config set fetch-retry-maxtimeout 120000 \
    && npm install --no-audit --no-fund \
    && cd pxapp && npm install --no-audit --no-fund

# Copy application source code
COPY . .

# Build production Vite frontend assets
RUN cd pxapp && npm run build

# Expose internal application port
EXPOSE 3000

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3000

# Start unified Express server & SPA handler
WORKDIR /app/pxapp
CMD ["npm", "run", "start"]
