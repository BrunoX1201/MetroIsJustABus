FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/core-api/package.json backend/core-api/package.json
COPY backend/validation-service/package.json backend/validation-service/package.json
COPY backend/notification-service/package.json backend/notification-service/package.json
RUN npm ci

COPY tsconfig.base.json ./
COPY backend/ backend/
ARG SERVICE
RUN case "$SERVICE" in core-api|validation-service|notification-service) ;; *) exit 1 ;; esac \
    && npm run build --workspace "backend/$SERVICE"

FROM node:24-alpine AS runtime

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/core-api/package.json backend/core-api/package.json
COPY backend/validation-service/package.json backend/validation-service/package.json
COPY backend/notification-service/package.json backend/notification-service/package.json
ARG SERVICE
RUN case "$SERVICE" in core-api|validation-service|notification-service) ;; *) exit 1 ;; esac \
    && npm ci --omit=dev --workspace "backend/$SERVICE" \
    && npm cache clean --force

COPY --from=build /app/backend/${SERVICE}/dist /app/backend/${SERVICE}/dist
ENV NODE_ENV=production HOST=0.0.0.0 SERVICE=${SERVICE}
USER node
CMD ["sh", "-c", "node backend/${SERVICE}/dist/index.js"]
