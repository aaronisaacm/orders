namespace WebOrders.Data.Models;

public class OrderItem
{
    public string Sku { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}