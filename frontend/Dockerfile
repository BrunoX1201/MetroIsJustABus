FROM node:24-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/core-api/package.json backend/core-api/package.json
COPY backend/validation-service/package.json backend/validation-service/package.json
COPY backend/notification-service/package.json backend/notification-service/package.json
RUN npm ci

COPY frontend/ frontend/
RUN npm run build --workspace frontend

FROM nginx:stable-alpine
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
