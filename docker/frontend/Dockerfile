# Stage 1: Build Angular app
FROM node:22 AS build-stage

WORKDIR /app

# Copy package files first
COPY book-network-ui/package*.json ./

RUN npm install

# Copy the Angular project source code
COPY book-network-ui/ ./

# Temporarily modify angular.json to disable SSR and build
RUN sed -i 's/"outputMode": "server"/"outputMode": "static"/g' angular.json && \
    sed -i '/"ssr": {/,/}/d' angular.json && \
    npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom Nginx config
COPY book-network-ui/nginx.conf /etc/nginx/nginx.conf

# Copy built Angular app
COPY --from=build-stage /app/dist/book-network-ui/browser /usr/share/nginx/html

EXPOSE 80