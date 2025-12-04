# Web Orders API

A RESTful API for managing orders and order items built with ASP.NET Core and SQLite. The API provides full CRUD operations for orders, includes caching, rate limiting, health checks, and streaming capabilities.

## Features

- **Full CRUD Operations**: Create, read, update, and delete orders
- **In-Memory Caching**: 30-second cache for improved performance
- **Rate Limiting**: 100 requests per minute per client (IP-based)
- **Health Checks**: Monitor SQLite database connectivity
- **Streaming Support**: Real-time order streaming via Server-Sent Events (SSE)
- **JSON Storage**: Order items stored as JSON in SQLite for flexibility
- **Auto Seeding**: Sample data automatically loaded on first run
- **CORS Enabled**: Cross-origin requests allowed for all origins
- **Docker Support**: Containerized deployment with Docker Compose

## Prerequisites

- [.NET 10.0 SDK](https://dotnet.microsoft.com/download) or later
- Windows, Linux, or macOS

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd order-backend
```

2. Restore dependencies:
```bash
cd WebOrders.API
dotnet restore
```

Or restore all projects:
```bash
dotnet restore
```

### Configuration

The application uses SQLite by default with a connection string defined in `appsettings.json`. The default database file is `orders.db` in the project root.

You can override the connection string via:
- `appsettings.Development.json` (for development)
- Environment variables
- Command line arguments

Example connection string:
```json
{
  "ConnectionStrings": {
    "Orders": "Data Source=orders.db"
  }
}
```

### Running the Application

#### Local Development

Run the application from the `WebOrders.API` directory:
```bash
cd WebOrders.API
dotnet run
```

The API will start on `http://localhost:5000` or `https://localhost:5001` (check your `launchSettings.json` for the exact port).

On first run, the application will:
1. Create the SQLite database if it doesn't exist
2. Run migrations to create the schema
3. Seed the database with sample orders

#### Docker Deployment

For Docker deployment, see the main [README.md](../README.md) in the parent directory for Docker Compose setup instructions.

When running in Docker, the API is available at `http://localhost:8080`.

## API Documentation

### Base URL

**Local Development:**
```
http://localhost:5000
```

**Docker Deployment:**
```
http://localhost:8080
```

### Health Check

#### GET /health

Check the health status of the API and database connection.

**Response:**
```
200 OK - Healthy
503 Service Unavailable - Unhealthy
```

**Example:**
```bash
curl http://localhost:5000/health
```

---

### Orders Endpoints

All order endpoints are prefixed with `/orders`.

#### GET /orders

Retrieve all orders.

**Response:**
- **200 OK**: List of all orders

**Example Request:**
```bash
curl http://localhost:5000/orders
```

**Example Response:**
```json
[
  {
    "id": 1,
    "customerName": "Juan Pérez",
    "createdAt": "2024-11-21T10:00:00Z",
    "items": [
      {
        "sku": "LAP-001",
        "description": "Laptop Dell XPS 15",
        "quantity": 1,
        "unitPrice": 1299.99
      },
      {
        "sku": "MOU-002",
        "description": "Mouse Logitech MX Master 3",
        "quantity": 1,
        "unitPrice": 99.99
      }
    ]
  }
]
```

**Notes:**
- Results are cached for 30 seconds
- Supports rate limiting (100 requests/minute per IP)

---

#### GET /orders/{id}

Retrieve a specific order by ID.

**Parameters:**
- `id` (integer, path, required): The order ID

**Response:**
- **200 OK**: Order found
- **404 Not Found**: Order not found

**Example Request:**
```bash
curl http://localhost:5000/orders/1
```

**Example Response:**
```json
{
  "id": 1,
  "customerName": "Juan Pérez",
  "createdAt": "2024-11-21T10:00:00Z",
  "items": [
    {
      "sku": "LAP-001",
      "description": "Laptop Dell XPS 15",
      "quantity": 1,
      "unitPrice": 1299.99
    }
  ]
}
```

---

#### POST /orders

Create a new order.

**Request Body:**
```json
{
  "customerName": "John Doe",
  "items": [
    {
      "sku": "PROD-001",
      "description": "Product Description",
      "quantity": 2,
      "unitPrice": 49.99
    }
  ]
}
```

**Response:**
- **201 Created**: Order created successfully
  - Location header: `/orders/{id}`
  - Body: Created order with generated ID and `createdAt` timestamp
- **400 Bad Request**: Invalid request data

**Example Request:**
```bash
curl -X POST http://localhost:5000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "John Doe",
    "items": [
      {
        "sku": "PROD-001",
        "description": "Product Description",
        "quantity": 2,
        "unitPrice": 49.99
      }
    ]
  }'
```

**Example Response:**
```json
{
  "id": 6,
  "customerName": "John Doe",
  "createdAt": "2024-11-26T18:30:00Z",
  "items": [
    {
      "sku": "PROD-001",
      "description": "Product Description",
      "quantity": 2,
      "unitPrice": 49.99
    }
  ]
}
```

**Notes:**
- `id` and `createdAt` are automatically set by the server
- Setting `id` in the request body will be ignored (set to 0)

---

#### PUT /orders/{id}

Update an existing order.

**Parameters:**
- `id` (integer, path, required): The order ID to update

**Request Body:**
```json
{
  "customerName": "Updated Customer Name",
  "items": [
    {
      "sku": "PROD-001",
      "description": "Updated Description",
      "quantity": 3,
      "unitPrice": 59.99
    }
  ]
}
```

**Response:**
- **200 OK**: Order updated successfully
- **404 Not Found**: Order not found
- **400 Bad Request**: Invalid request data

**Example Request:**
```bash
curl -X PUT http://localhost:5000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Updated Customer Name",
    "items": [
      {
        "sku": "PROD-001",
        "description": "Updated Description",
        "quantity": 3,
        "unitPrice": 59.99
      }
    ]
  }'
```

**Example Response:**
```json
{
  "id": 1,
  "customerName": "Updated Customer Name",
  "createdAt": "2024-11-21T10:00:00Z",
  "items": [
    {
      "sku": "PROD-001",
      "description": "Updated Description",
      "quantity": 3,
      "unitPrice": 59.99
    }
  ]
}
```

**Notes:**
- Only `customerName` and `items` can be updated
- `id` and `createdAt` remain unchanged
- Cache is invalidated after update

---

#### DELETE /orders/{id}

Delete an order by ID.

**Parameters:**
- `id` (integer, path, required): The order ID to delete

**Response:**
- **204 No Content**: Order deleted successfully
- **404 Not Found**: Order not found

**Example Request:**
```bash
curl -X DELETE http://localhost:5000/orders/1
```

**Notes:**
- Cache is invalidated after deletion

---

#### GET /orders/stream

Stream all orders in real-time using Server-Sent Events (SSE).

**Response:**
- **200 OK**: Stream of orders (text/event-stream content type)
- Connection remains open and sends orders every 5 seconds

**Example Request:**
```bash
curl http://localhost:5000/orders/stream
```

**Response Format:**
The endpoint returns orders as Server-Sent Events, with each order sent as a JSON object in the stream. The stream updates every 5 seconds with all current orders.

**Example Response Stream:**
```
data: {"id":1,"customerName":"Juan Pérez","createdAt":"2024-11-21T10:00:00Z","items":[...]}

data: {"id":2,"customerName":"María García","createdAt":"2024-11-23T10:00:00Z","items":[...]}

...
```

**Notes:**
- The stream sends all orders every 5 seconds
- Use this endpoint for real-time monitoring or dashboards
- Connection can be cancelled by the client
- Suitable for low-frequency updates

---

## Data Models

### Order

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique identifier (auto-generated) |
| `customerName` | string | Name of the customer |
| `createdAt` | datetime (ISO 8601) | Order creation timestamp (UTC) |
| `items` | array | List of order items (stored as JSON) |

### OrderItem

| Field | Type | Description |
|-------|------|-------------|
| `sku` | string | Stock Keeping Unit identifier |
| `description` | string | Item description |
| `quantity` | integer | Quantity ordered |
| `unitPrice` | decimal | Price per unit |

---

## Rate Limiting

The API implements rate limiting with the following configuration:

- **Limit**: 100 requests per minute per client
- **Window**: Fixed 1-minute window
- **Partition Key**: IP address (or authenticated user if available)
- **Response**: `429 Too Many Requests` when limit is exceeded

**Example Rate Limit Response:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

---

## Caching

The API uses in-memory caching for improved performance:

- **GET /orders**: Cached for 30 seconds
- **GET /orders/{id}**: Individual orders cached for 30 seconds
- Cache is automatically invalidated on create, update, or delete operations

---

## Error Responses

### 400 Bad Request
Invalid request data or malformed JSON.

### 404 Not Found
The requested resource (order) was not found.

### 429 Too Many Requests
Rate limit exceeded. Wait before making additional requests.

### 500 Internal Server Error
An unexpected server error occurred.

---

## Technologies Used

- **.NET 10.0**: Runtime and framework
- **ASP.NET Core**: Web framework
- **Entity Framework Core 9.0.1**: ORM and database access
- **SQLite**: Database engine
- **Memory Caching**: Performance optimization
- **Rate Limiting**: API protection
- **Health Checks**: Monitoring and diagnostics
- **CORS**: Cross-origin resource sharing enabled for all origins

---

## Database

The application uses SQLite with Entity Framework Core. The database file (`orders.db`) is created automatically on first run.

### Schema

- **Orders Table**: Stores order metadata
  - `Id`: Primary key (auto-increment)
  - `CustomerName`: Text
  - `CreatedAt`: DateTime
  - `Items`: JSON text (stored as TEXT column)

### Migrations

To create or update the database schema, navigate to the `WebOrders.API` directory and run:

```bash
cd WebOrders.API
dotnet ef migrations add <MigrationName> --project ../WebOrders.Data
dotnet ef database update --project ../WebOrders.Data
```

---

## Docker Deployment

This project includes Docker support for containerized deployment. The Dockerfile uses a multi-stage build to optimize the image size.

### Building the Docker Image

From the `order-backend` directory:

```bash
docker build -t weborders-backend .
```

### Running with Docker Compose

For a complete setup including frontend, see the main [README.md](../README.md) in the parent directory.

The backend service in Docker Compose:
- Exposes port `8080`
- Uses a persistent volume for SQLite database at `/app/data/orders.db`
- Includes health checks
- Automatically seeds data on first run

## Development

### Project Structure

```
order-backend/
├── WebOrders.API/                  # Main API project
│   ├── Program.cs                  # Application entry point
│   ├── appsettings.json            # Configuration
│   ├── appsettings.Development.json
│   └── WebOrders.API.csproj
├── WebOrders.Data/                  # Data access layer
│   ├── Context/
│   │   └── OrderDbContext.cs       # EF Core DbContext
│   ├── Data/
│   │   └── SeedData.cs             # Initial data seeding
│   ├── Migrations/                  # EF Core migrations
│   ├── Models/
│   │   ├── Order.cs                # Order model
│   │   └── OrderItem.cs            # OrderItem model
│   └── WebOrders.Data.csproj
├── WebOrders.Service/               # Business logic layer
│   ├── Interfaces/
│   │   └── IOrderService.cs        # Service interface
│   ├── Services/
│   │   └── OrderService.cs         # Service implementation
│   └── WebOrders.Service.csproj
├── Dockerfile                       # Docker build configuration
└── README.md                        # This file
```

### Testing the API

You can test the API using:

- **cURL** (examples provided above)
- **Postman** or **Insomnia**
- **HTTPie**:
  ```bash
  http GET localhost:5000/orders
  http POST localhost:5000/orders customerName="Test" items:='[{"sku":"TEST","description":"Test Item","quantity":1,"unitPrice":10.00}]'
  ```

---

## License

[Specify your license here]

## Author

[Your name/organization]