FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
ARG VITE_NHOST_SUBDOMAIN
ARG VITE_NHOST_REGION
ENV VITE_NHOST_SUBDOMAIN=$VITE_NHOST_SUBDOMAIN
ENV VITE_NHOST_REGION=$VITE_NHOST_REGION
RUN npm run build

FROM nginx:1.27-alpine
COPY infra/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/ /usr/share/nginx/html/
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
