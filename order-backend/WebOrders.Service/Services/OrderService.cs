using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using WebOrders.Data.Context;
using WebOrders.Data.Models;
using WebOrders.Service.Interface;

namespace WebOrders.Service.Services;

public class OrderService : IOrderService
{
    private readonly OrderDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly ILogger<OrderService> _logger;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromSeconds(30);

    private const string AllOrdersCacheKey = "orders_all";

    public OrderService(OrderDbContext db, IMemoryCache cache, ILogger<OrderService> logger)
    {
        _db = db;
        _cache = cache;
        _logger = logger;
    }

    public async Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting all orders");

        if (_cache.TryGetValue(AllOrdersCacheKey, out List<Order>? cached) && cached is not null)
        {
            _logger.LogDebug("Retrieved {Count} orders from cache", cached.Count);
            return cached;
        }

        var orders = await _db.Orders.AsNoTracking().ToListAsync(cancellationToken);
        _logger.LogInformation("Retrieved {Count} orders from database", orders.Count);

        _cache.Set(AllOrdersCacheKey, orders, _cacheDuration);

        return orders;
    }

    public async Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Getting order with ID {OrderId}", id);

        // Small per-order cache key
        var cacheKey = $"order_{id}";

        if (_cache.TryGetValue(cacheKey, out Order? cached) && cached is not null)
        {
            _logger.LogDebug("Retrieved order {OrderId} from cache", id);
            return cached;
        }

        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is not null)
        {
            _logger.LogInformation("Retrieved order {OrderId} from database", id);
            _cache.Set(cacheKey, order, _cacheDuration);
        }
        else
        {
            _logger.LogWarning("Order with ID {OrderId} not found", id);
        }

        return order;
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Creating new order for customer {CustomerName}", order.CustomerName);

        order.Id = 0;
        order.CreatedAt = DateTime.UtcNow;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully created order with ID {OrderId} for customer {CustomerName}", order.Id, order.CustomerName);

        InvalidateCache(order.Id);

        return order;
    }

    public async Task<Order?> UpdateAsync(int id, Order update, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Updating order with ID {OrderId}", id);

        var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        if (existing is null)
        {
            _logger.LogWarning("Order with ID {OrderId} not found for update", id);
            return null;
        }

        existing.CustomerName = update.CustomerName;
        existing.Items = update.Items;

        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully updated order with ID {OrderId}", id);

        InvalidateCache(id);

        return existing;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Deleting order with ID {OrderId}", id);

        var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        if (existing is null)
        {
            _logger.LogWarning("Order with ID {OrderId} not found for deletion", id);
            return false;
        }

        _db.Orders.Remove(existing);
        await _db.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Successfully deleted order with ID {OrderId}", id);

        InvalidateCache(id);

        return true;
    }

    public async IAsyncEnumerable<Order> StreamAllAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Starting order stream");

        while (!cancellationToken.IsCancellationRequested)
        {
            var orders = await _db.Orders.AsNoTracking().ToListAsync(cancellationToken);
            _logger.LogDebug("Streaming {Count} orders", orders.Count);

            foreach (var order in orders)
            {
                yield return order;
            }

            try
            {
                await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Order stream cancelled");
                break;
            }
        }

        _logger.LogInformation("Order stream ended");
    }

    private void InvalidateCache(int orderId)
    {
        _logger.LogDebug("Invalidating cache for order {OrderId}", orderId);
        _cache.Remove(AllOrdersCacheKey);
        _cache.Remove($"order_{orderId}");
    }
}


