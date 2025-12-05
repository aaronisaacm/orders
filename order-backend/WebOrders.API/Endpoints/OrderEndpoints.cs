using AutoMapper;
using Microsoft.Extensions.Logging;
using WebOrders.Service.Interface;
using WebOrders.API.Dtos;
using WebOrders.API.Validations;
using WebOrders.Data.Models;

namespace WebOrders.API.Endpoints;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this WebApplication app)
    {
        var ordersGroup = app.MapGroup("/orders")
            .RequireAuthorization();

        ordersGroup.MapGet("/", async (IOrderService service, IMapper mapper, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("GET /orders - Retrieving all orders");
            try
            {
                var orders = await service.GetAllAsync(ct);
                var orderDtos = mapper.Map<List<OrderDto>>(orders);
                logger.LogInformation("GET /orders - Successfully retrieved {Count} orders", orderDtos.Count);
                return Results.Ok(orderDtos);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /orders - Error retrieving orders");
                throw;
            }
        });

        ordersGroup.MapGet("/{id:int}", async (int id, IOrderService service, IMapper mapper, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("GET /orders/{OrderId} - Retrieving order", id);
            try
            {
                var order = await service.GetByIdAsync(id, ct);
                if (order is null)
                {
                    logger.LogWarning("GET /orders/{OrderId} - Order not found", id);
                    return Results.NotFound();
                }
                var orderDto = mapper.Map<OrderDto>(order);
                logger.LogInformation("GET /orders/{OrderId} - Successfully retrieved order", id);
                return Results.Ok(orderDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "GET /orders/{OrderId} - Error retrieving order", id);
                throw;
            }
        });

        ordersGroup.MapPost("/", async (OrderDto orderDto, IOrderService service, IMapper mapper, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("POST /orders - Creating new order for customer {CustomerName}", orderDto.CustomerName);
            try
            {
                var validationErrors = OrderDtoValidator.ValidateOrderDto(orderDto);
                if (validationErrors.Any())
                {
                    logger.LogWarning("POST /orders - Validation failed with {ErrorCount} errors", validationErrors.Count);
                    return Results.BadRequest(new { errors = validationErrors });
                }
                
                var order = mapper.Map<Order>(orderDto);
                var created = await service.CreateAsync(order, ct);
                var createdDto = mapper.Map<OrderDto>(created);
                logger.LogInformation("POST /orders - Successfully created order with ID {OrderId}", createdDto.Id);
                return Results.Created($"/orders/{createdDto.Id}", createdDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "POST /orders - Error creating order");
                throw;
            }
        });

        ordersGroup.MapPut("/{id:int}", async (int id, OrderDto orderDto, IOrderService service, IMapper mapper, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("PUT /orders/{OrderId} - Updating order", id);
            try
            {
                var validationErrors = OrderDtoValidator.ValidateOrderDto(orderDto);
                if (validationErrors.Any())
                {
                    logger.LogWarning("PUT /orders/{OrderId} - Validation failed with {ErrorCount} errors", id, validationErrors.Count);
                    return Results.BadRequest(new { errors = validationErrors });
                }
                
                var order = mapper.Map<Order>(orderDto);
                var updated = await service.UpdateAsync(id, order, ct);
                if (updated is null)
                {
                    logger.LogWarning("PUT /orders/{OrderId} - Order not found", id);
                    return Results.NotFound();
                }
                var updatedDto = mapper.Map<OrderDto>(updated);
                logger.LogInformation("PUT /orders/{OrderId} - Successfully updated order", id);
                return Results.Ok(updatedDto);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "PUT /orders/{OrderId} - Error updating order", id);
                throw;
            }
        });

        ordersGroup.MapDelete("/{id:int}", async (int id, IOrderService service, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("DELETE /orders/{OrderId} - Deleting order", id);
            try
            {
                var deleted = await service.DeleteAsync(id, ct);
                if (deleted)
                {
                    logger.LogInformation("DELETE /orders/{OrderId} - Successfully deleted order", id);
                    return Results.NoContent();
                }
                else
                {
                    logger.LogWarning("DELETE /orders/{OrderId} - Order not found", id);
                    return Results.NotFound();
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "DELETE /orders/{OrderId} - Error deleting order", id);
                throw;
            }
        });

        // Stream endpoint using IAsyncEnumerable
        ordersGroup.MapGet("/stream", (IOrderService service, IMapper mapper, ILoggerFactory loggerFactory, CancellationToken ct) =>
        {
            var logger = loggerFactory.CreateLogger("WebOrders.API.Endpoints.OrderEndpoints");
            logger.LogInformation("GET /orders/stream - Starting order stream");
            return StreamOrders(service, mapper, logger, ct);
        });
    }

    private static async IAsyncEnumerable<OrderDto> StreamOrders(
        IOrderService service,
        IMapper mapper,
        ILogger logger,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        await foreach (var order in service.StreamAllAsync(ct))
        {
            yield return mapper.Map<OrderDto>(order);
        }
        logger.LogInformation("GET /orders/stream - Order stream completed");
    }
}

