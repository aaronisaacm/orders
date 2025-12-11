using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;

namespace WebOrders.API.Endpoints;

public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this WebApplication app)
    {
        // Login endpoint - validates credentials using Basic Authentication
        // This endpoint does NOT require authorization, it validates the credentials instead
        app.MapPost("/login", (HttpContext context, IConfiguration configuration, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.AuthEndpoints");
            logger.LogInformation("POST /login - Attempting login");

            try
            {
                if (!context.Request.Headers.ContainsKey("Authorization"))
                {
                    logger.LogWarning("POST /login - Missing Authorization Header");
                    return Results.Unauthorized();
                }

                var authHeader = AuthenticationHeaderValue.Parse(context.Request.Headers["Authorization"]);
                if (authHeader.Scheme != "Basic")
                {
                    logger.LogWarning("POST /login - Invalid Authorization Scheme");
                    return Results.Unauthorized();
                }

                var credentialBytes = Convert.FromBase64String(authHeader.Parameter ?? string.Empty);
                var credentials = System.Text.Encoding.UTF8.GetString(credentialBytes).Split(':', 2);
                var username = credentials[0];
                var password = credentials.Length > 1 ? credentials[1] : string.Empty;

                // Get credentials from configuration
                var validUsername = configuration["Authentication:Username"] ?? "admin";
                var validPassword = configuration["Authentication:Password"] ?? "password";

                if (username != validUsername || password != validPassword)
                {
                    logger.LogWarning("POST /login - Invalid credentials for user {Username}", username);
                    return Results.Unauthorized();
                }

                logger.LogInformation("POST /login - Successfully authenticated user {Username}", username);
                return Results.Ok(new { username, message = "Login successful" });
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /login - Error during authentication");
                return Results.Unauthorized();
            }
        });
    }
}

