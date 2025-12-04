using Microsoft.EntityFrameworkCore;
using WebOrders.Data.Context;
using WebOrders.Data.Models;

namespace WebOrders.Data.Data;

public static class SeedData
{
    public static async Task SeedAsync(OrderDbContext context)
    {
        // Verificar si ya hay datos
        if (await context.Orders.AnyAsync())
        {
            return; // Ya hay datos, no hacer seed
        }

        var orders = new List<Order>
        {
            new Order
            {
                CustomerName = "Juan Pérez",
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Sku = "LAP-001",
                        Description = "Laptop Dell XPS 15",
                        Quantity = 1,
                        UnitPrice = 1299.99m
                    },
                    new OrderItem
                    {
                        Sku = "MOU-002",
                        Description = "Mouse Logitech MX Master 3",
                        Quantity = 1,
                        UnitPrice = 99.99m
                    }
                }
            },
            new Order
            {
                CustomerName = "María García",
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Sku = "PHN-003",
                        Description = "iPhone 15 Pro",
                        Quantity = 2,
                        UnitPrice = 999.00m
                    },
                    new OrderItem
                    {
                        Sku = "CASE-004",
                        Description = "Case protectora transparente",
                        Quantity = 2,
                        UnitPrice = 29.99m
                    }
                }
            },
            new Order
            {
                CustomerName = "Carlos Rodríguez",
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Sku = "TAB-005",
                        Description = "iPad Air 11 pulgadas",
                        Quantity = 1,
                        UnitPrice = 599.00m
                    },
                    new OrderItem
                    {
                        Sku = "PEN-006",
                        Description = "Apple Pencil (2da generación)",
                        Quantity = 1,
                        UnitPrice = 129.00m
                    },
                    new OrderItem
                    {
                        Sku = "KEY-007",
                        Description = "Magic Keyboard para iPad",
                        Quantity = 1,
                        UnitPrice = 299.00m
                    }
                }
            },
            new Order
            {
                CustomerName = "Ana Martínez",
                CreatedAt = DateTime.UtcNow.AddHours(-12),
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Sku = "MON-008",
                        Description = "Monitor LG UltraWide 34 pulgadas",
                        Quantity = 2,
                        UnitPrice = 449.99m
                    }
                }
            },
            new Order
            {
                CustomerName = "Pedro López",
                CreatedAt = DateTime.UtcNow.AddHours(-2),
                Items = new List<OrderItem>
                {
                    new OrderItem
                    {
                        Sku = "KB-009",
                        Description = "Teclado mecánico Keychron K8",
                        Quantity = 1,
                        UnitPrice = 89.99m
                    },
                    new OrderItem
                    {
                        Sku = "MOU-002",
                        Description = "Mouse Logitech MX Master 3",
                        Quantity = 1,
                        UnitPrice = 99.99m
                    },
                    new OrderItem
                    {
                        Sku = "PAD-010",
                        Description = "Mouse pad extendido",
                        Quantity = 1,
                        UnitPrice = 24.99m
                    }
                }
            }
        };

        await context.Orders.AddRangeAsync(orders);
        await context.SaveChangesAsync();
    }
}

