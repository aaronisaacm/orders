using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using WebOrders.Models;

namespace WebOrders.Context;

public class OrderDbContext : DbContext
{
    public OrderDbContext(DbContextOptions<OrderDbContext> options) : base(options)
    {
    }

    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web)
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };

        modelBuilder.Entity<Order>(entity =>
        {
            entity.Property(o => o.CustomerName).IsRequired();
            entity.Property(o => o.CreatedAt).IsRequired();

            // Map Items as JSON column
            entity.Property(o => o.Items)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, options),
                    v => JsonSerializer.Deserialize<List<OrderItem>>(v, options) ?? new List<OrderItem>(),
                    new ValueComparer<List<OrderItem>>(
                        (c1, c2) => c1!.SequenceEqual(c2!),
                        c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
                        c => c.ToList()))
                .HasColumnType("TEXT");
        });
    }
}


