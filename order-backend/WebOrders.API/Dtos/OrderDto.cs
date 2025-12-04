using System.ComponentModel.DataAnnotations;

namespace WebOrders.API.Dtos;

public class OrderDto
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Customer name is required")]
    [StringLength(200, ErrorMessage = "Customer name cannot exceed 200 characters")]
    public string CustomerName { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    [Required(ErrorMessage = "Order items are required")]
    [MinLength(1, ErrorMessage = "Order must contain at least one item")]
    public List<OrderItemDto> Items { get; set; } = new();
}