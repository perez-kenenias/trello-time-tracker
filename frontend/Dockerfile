# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage - use nginx to serve static files
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html

# nginx config: SPA routing + cache headers (no-cache en index.html, immutable en /static)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
