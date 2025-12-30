# Build stage - matches official ClearML build process
FROM node:20-bookworm-slim AS builder

WORKDIR /opt/open-webapp

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies using npm ci for reproducible builds with package-lock.json
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the Angular app (same as official build)
RUN npm run build

# Production stage - use the official ClearML image as base
# This preserves the update_from_env.py script and nginx configuration
FROM allegroai/clearml:latest

# Clear old files from the base image to ensure our build is served
RUN rm -rf /usr/share/nginx/html/*

# Copy built files to nginx html directory
# Angular 20 outputs to /build/browser directory for production builds
COPY --from=builder /opt/open-webapp/build/browser /usr/share/nginx/html/

# The base image's entrypoint will handle configuration via WEBSERVER__ env vars
