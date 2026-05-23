# syntax=docker/dockerfile:1.7
FROM node:20-alpine

WORKDIR /usr/src/app
ENV NODE_ENV=production \
    PORT=5501 \
    HOST=0.0.0.0

# Install runtime dependencies first so source edits don't bust the layer cache
COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy the application code (everything except what .dockerignore excludes)
COPY . .

EXPOSE 5501

# Lightweight health check so Docker / Container Manager can mark the
# container unhealthy if the API stops responding.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- "http://127.0.0.1:${PORT}/api/config" >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
