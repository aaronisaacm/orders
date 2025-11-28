# Docker Setup - WebOrders

This project is containerized using Docker and Docker Compose.

## Architecture

- **Backend**: .NET 10.0 (ASP.NET Core)
- **Frontend**: Angular 20.3 served with Nginx
- **Database**: SQLite (persisted in Docker volume)

## Requirements

- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- Minimum 2GB of RAM available

## Usage

### Build and run all services

```bash
docker-compose up --build
```

### Run in background

```bash
docker-compose up -d --build
```

### View logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### Stop services

```bash
docker-compose down
```

### Stop and remove volumes (includes database)

```bash
docker-compose down -v
```

## Access

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Backend Healthcheck**: http://localhost:8080/health
- **Frontend Healthcheck**: http://localhost/health

## Structure

```
.
├── docker-compose.yml          # Service orchestration
├── order-bancked/
│   ├── Dockerfile              # Multi-stage build .NET 10
│   └── .dockerignore
└── order-fronend/
    ├── Dockerfile              # Multi-stage build Angular → Nginx
    ├── nginx.conf              # Nginx configuration
    └── .dockerignore
```

## Features

✅ Multi-stage builds to optimize image size
✅ Healthchecks configured for both services
✅ Internal network between services (`app-network`)
✅ Persistent volume for SQLite (`sqlite-data`)
✅ Reverse proxy in Nginx for backend API
✅ Automatic container restart

## Volumes

- `sqlite-data`: Stores the SQLite database (`/app/data/orders.db`)

## Network

Services communicate through the internal network `app-network`:
- Frontend → Backend: `http://backend:8080`
- The frontend exposes the backend through the `/api/*` proxy

## Troubleshooting

### Backend does not start

1. Check the logs: `docker-compose logs backend`
2. Make sure port 8080 is not in use
3. Verify that the SQLite volume has correct permissions

### Frontend does not connect to backend

1. Verify that the backend is healthy: `docker-compose ps`
2. Check Nginx logs: `docker-compose logs frontend`
3. Verify the proxy configuration in `nginx.conf`

### Rebuild from scratch

```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```
