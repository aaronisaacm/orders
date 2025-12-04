using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using WebOrders.Data.Context;
using WebOrders.Data.Models;
using WebOrders.Service.Interface;

namespace WebOrders.Service.Services;

public class OrderService : IOrderService
{
    private readonly OrderDbContext _db;
    private readonly IMemoryCache _cache;
    private readonly TimeSpan _cacheDuration = TimeSpan.FromSeconds(30);

    private const string AllOrdersCacheKey = "orders_all";

    public OrderService(OrderDbContext db, IMemoryCache cache)
    {
        _db = db;
        _cache = cache;
    }

    public async Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        if (_cache.TryGetValue(AllOrdersCacheKey, out List<Order>? cached) && cached is not null)
        {
            return cached;
        }

        var orders = await _db.Orders.AsNoTracking().ToListAsync(cancellationToken);

        _cache.Set(AllOrdersCacheKey, orders, _cacheDuration);

        return orders;
    }

    public async Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        // Small per-order cache key
        var cacheKey = $"order_{id}";

        if (_cache.TryGetValue(cacheKey, out Order? cached) && cached is not null)
        {
            return cached;
        }

        var order = await _db.Orders.AsNoTracking().FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

        if (order is not null)
        {
            _cache.Set(cacheKey, order, _cacheDuration);
        }

        return order;
    }

    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        order.Id = 0;
        order.CreatedAt = DateTime.UtcNow;

        _db.Orders.Add(order);
        await _db.SaveChangesAsync(cancellationToken);

        InvalidateCache(order.Id);

        return order;
    }

    public async Task<Order?> UpdateAsync(int id, Order update, CancellationToken cancellationToken = default)
    {
        var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        if (existing is null)
        {
            return null;
        }

        existing.CustomerName = update.CustomerName;
        existing.Items = update.Items;

        await _db.SaveChangesAsync(cancellationToken);

        InvalidateCache(id);

        return existing;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var existing = await _db.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
        if (existing is null)
        {
            return false;
        }

        _db.Orders.Remove(existing);
        await _db.SaveChangesAsync(cancellationToken);

        InvalidateCache(id);

        return true;
    }

    public async IAsyncEnumerable<Order> StreamAllAsync([System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken cancellationToken = default)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            var orders = await _db.Orders.AsNoTracking().ToListAsync(cancellationToken);

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
                break;
            }
        }
    }

    private void InvalidateCache(int orderId)
    {
        _cache.Remove(AllOrdersCacheKey);
        _cache.Remove($"order_{orderId}");
    }
}


