# Angular 21 Frontend Production Dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
COPY config.js.template /usr/share/nginx/html/config.js.template
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN apk add --no-cache gettext
EXPOSE 80
CMD ["sh", "-c", "envsubst '${API_URL}' < /usr/share/nginx/html/config.js.template > /usr/share/nginx/html/config.js && exec nginx -g 'daemon off;'"]
