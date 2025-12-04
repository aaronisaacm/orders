# Multi-stage build para Backend .NET 10
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar archivos .csproj de todos los proyectos para restaurar dependencias
COPY WebOrders.API/WebOrders.API.csproj WebOrders.API/
COPY WebOrders.Data/WebOrders.Data.csproj WebOrders.Data/
COPY WebOrders.Service/WebOrders.Service.csproj WebOrders.Service/
RUN dotnet restore WebOrders.API/WebOrders.API.csproj

# Copiar el resto de los archivos y compilar
COPY . ./
RUN dotnet build WebOrders.API/WebOrders.API.csproj -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish WebOrders.API/WebOrders.API.csproj -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Instalar wget para healthcheck
RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*

# Crear directorio para la base de datos
RUN mkdir -p /app/data

# Copiar archivos publicados
COPY --from=publish /app/publish .

# Exponer puerto
EXPOSE 8080

# Healthcheck (usando wget que está disponible en la imagen)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Variables de entorno
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Punto de entrada
ENTRYPOINT ["dotnet", "WebOrders.API.dll"]