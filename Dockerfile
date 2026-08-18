# ==============================================================================
# SANKARA EYE HOSPITAL - PROJECT PATIENT EXPERIENCE (PPE)
# PRODUCTION DOCKERFILE
# ==============================================================================

FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json ./
COPY pxapp/package.json ./pxapp/

# Install dependencies for both root and pxapp
RUN npm install && cd pxapp && npm install

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
