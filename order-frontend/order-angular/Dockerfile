# Multi-stage build para Frontend Angular → Nginx
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm ci

# Copiar el resto de los archivos y compilar
COPY . .
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine AS final
WORKDIR /usr/share/nginx/html

# Instalar wget para healthcheck
RUN apk add --no-cache wget

# Copiar archivos compilados
COPY --from=build /app/dist/order-fronend/browser .

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Punto de entrada
CMD ["nginx", "-g", "daemon off;"]

