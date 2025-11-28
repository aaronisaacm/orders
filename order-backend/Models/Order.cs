namespace WebOrders.Models;

public class Order
{
    public int Id { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Stored as JSON in the database
    public List<OrderItem> Items { get; set; } = new();
}