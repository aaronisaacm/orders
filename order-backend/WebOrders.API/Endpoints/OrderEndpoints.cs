using AutoMapper;
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

        ordersGroup.MapGet("/", async (IOrderService service, IMapper mapper, CancellationToken ct) =>
        {
            var orders = await service.GetAllAsync(ct);
            var orderDtos = mapper.Map<List<OrderDto>>(orders);
            return Results.Ok(orderDtos);
        });

        ordersGroup.MapGet("/{id:int}", async (int id, IOrderService service, IMapper mapper, CancellationToken ct) =>
        {
            var order = await service.GetByIdAsync(id, ct);
            if (order is null)
            {
                return Results.NotFound();
            }
            var orderDto = mapper.Map<OrderDto>(order);
            return Results.Ok(orderDto);
        });

        ordersGroup.MapPost("/", async (OrderDto orderDto, IOrderService service, IMapper mapper, CancellationToken ct) =>
        {
            var validationErrors = OrderDtoValidator.ValidateOrderDto(orderDto);
            if (validationErrors.Any())
            {
                return Results.BadRequest(new { errors = validationErrors });
            }
            
            var order = mapper.Map<Order>(orderDto);
            var created = await service.CreateAsync(order, ct);
            var createdDto = mapper.Map<OrderDto>(created);
            return Results.Created($"/orders/{createdDto.Id}", createdDto);
        });

        ordersGroup.MapPut("/{id:int}", async (int id, OrderDto orderDto, IOrderService service, IMapper mapper, CancellationToken ct) =>
        {
            var validationErrors = OrderDtoValidator.ValidateOrderDto(orderDto);
            if (validationErrors.Any())
            {
                return Results.BadRequest(new { errors = validationErrors });
            }
            
            var order = mapper.Map<Order>(orderDto);
            var updated = await service.UpdateAsync(id, order, ct);
            if (updated is null)
            {
                return Results.NotFound();
            }
            var updatedDto = mapper.Map<OrderDto>(updated);
            return Results.Ok(updatedDto);
        });

        ordersGroup.MapDelete("/{id:int}", async (int id, IOrderService service, CancellationToken ct) =>
        {
            var deleted = await service.DeleteAsync(id, ct);
            return deleted ? Results.NoContent() : Results.NotFound();
        });

        // Stream endpoint using IAsyncEnumerable
        ordersGroup.MapGet("/stream", (IOrderService service, IMapper mapper, CancellationToken ct) =>
        {
            return StreamOrders(service, mapper, ct);
        });
    }

    private static async IAsyncEnumerable<OrderDto> StreamOrders(
        IOrderService service,
        IMapper mapper,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct)
    {
        await foreach (var order in service.StreamAllAsync(ct))
        {
            yield return mapper.Map<OrderDto>(order);
        }
    }
}

