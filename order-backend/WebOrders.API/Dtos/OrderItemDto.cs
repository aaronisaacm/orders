using System.ComponentModel.DataAnnotations;

namespace WebOrders.API.Dtos;

public class OrderItemDto
{
    [Required(ErrorMessage = "SKU is required")]
    [StringLength(100, ErrorMessage = "SKU cannot exceed 100 characters")]
    public string Sku { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "Description is required")]
    [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
    public string Description { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue, ErrorMessage = "Quantity must be greater than 0")]
    public int Quantity { get; set; }
    
    [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
    public decimal UnitPrice { get; set; }
}