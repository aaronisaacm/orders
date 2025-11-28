using WebOrders.Models;

namespace WebOrders.Services;

public interface IOrderService
{
    Task<List<Order>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default);
    Task<Order?> UpdateAsync(int id, Order update, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    IAsyncEnumerable<Order> StreamAllAsync(CancellationToken cancellationToken = default);
}