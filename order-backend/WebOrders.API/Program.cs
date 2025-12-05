using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using WebOrders.Service.Interface;
using WebOrders.Service.Services;
using WebOrders.Data.Context;
using WebOrders.Data.Data;
using WebOrders.API.Endpoints;
using WebOrders.API.Mappings;
using WebOrders.API.Authentication;
using WebOrders.API.Middleware;

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

// AutoMapper
builder.Services.AddAutoMapper(typeof(OrderMappingProfile));

// Authentication
builder.Services.AddAuthentication("BasicAuthentication")
    .AddScheme<AuthenticationSchemeOptions, BasicAuthenticationHandler>("BasicAuthentication", null);

// Authorization
builder.Services.AddAuthorization();

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

// Global exception handler (should be registered early in the pipeline)
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OrderDbContext>();
    await SeedData.SeedAsync(context);
}

// Enable CORS (must be before UseRateLimiter)
app.UseCors();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.UseRateLimiter();

// Health endpoint
app.MapHealthChecks("/health");

// Map order endpoints
app.MapOrderEndpoints();

app.Run();