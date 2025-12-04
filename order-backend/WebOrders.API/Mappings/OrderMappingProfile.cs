using AutoMapper;
using WebOrders.API.Dtos;
using WebOrders.Data.Models;

namespace WebOrders.API.Mappings;

public class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        // Order mappings
        CreateMap<Order, OrderDto>();
        CreateMap<OrderDto, Order>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

        // OrderItem mappings
        CreateMap<OrderItem, OrderItemDto>();
        CreateMap<OrderItemDto, OrderItem>();
    }
}

