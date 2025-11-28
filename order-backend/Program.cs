using System.Threading.RateLimiting;
using Microsoft.EntityFrameworkCore;
using WebOrders.Services;
using WebOrders.Context;
using WebOrders.Models;
using WebOrders.Data;

var builder = WebApplication.CreateBuilder(args);

// DbContext con SQLite
builder.Services.AddDbContext<OrderDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Orders")
                           ?? "Data Source=/app/data/orders.db";  //"Data Source=orders.db";
    options.UseSqlite(connectionString);
});

// Caching en memoria
builder.Services.AddMemoryCache();

// OrderService
builder.Services.AddScoped<IOrderService, OrderService>();

// CORS - Allow all origins
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.User?.Identity?.Name ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "anon",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0,
                QueueProcessingOrder = QueueProcessingOrder.OldestFirst
            }));

    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
});

// HealthChecks
builder.Services
    .AddHealthChecks()
    .AddSqlite(
        connectionString: builder.Configuration.GetConnectionString("Orders") ?? "Data Source=/app/data/orders.db",
        name: "sqlite");

var app = builder.Build();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    await SeedData.SeedAsync(context);
}

// Enable CORS (must be before UseRateLimiter)
app.UseCors();

app.UseRateLimiter();

// Health endpoint
app.MapHealthChecks("/health");

// Group
var ordersGroup = app.MapGroup("/orders");

ordersGroup.MapGet("/", async (IOrderService service, CancellationToken ct) =>
{
    var orders = await service.GetAllAsync(ct);
    return Results.Ok(orders);
});

ordersGroup.MapGet("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
{
    var order = await service.GetByIdAsync(id, ct);
    return order is not null ? Results.Ok(order) : Results.NotFound();
});

ordersGroup.MapPost("/", async (Order order, IOrderService service, CancellationToken ct) =>
{
    var created = await service.CreateAsync(order, ct);
    return Results.Created($"/orders/{created.Id}", created);
});

ordersGroup.MapPut("/{id:int}", async (int id, Order order, IOrderService service, CancellationToken ct) =>
{
    var updated = await service.UpdateAsync(id, order, ct);
    return updated is not null ? Results.Ok(updated) : Results.NotFound();
});

ordersGroup.MapDelete("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
{
    var deleted = await service.DeleteAsync(id, ct);
    return deleted ? Results.NoContent() : Results.NotFound();
});

// Stream endpoint using IAsyncEnumerable
ordersGroup.MapGet("/stream", (IOrderService service, CancellationToken ct) =>
{
    return service.StreamAllAsync(ct);
});

app.Run();
