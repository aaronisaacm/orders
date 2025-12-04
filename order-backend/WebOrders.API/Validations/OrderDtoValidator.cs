using System.ComponentModel.DataAnnotations;
using WebOrders.API.Dtos;

namespace WebOrders.API.Validations;

public static class OrderDtoValidator
{
    public static List<object> ValidateOrderDto(OrderDto orderDto)
    {
        var errors = new List<object>();
        var validationResults = new List<ValidationResult>();
        var validationContext = new ValidationContext(orderDto);
        
        // Validate the main OrderDto object
        if (!Validator.TryValidateObject(orderDto, validationContext, validationResults, true))
        {
            errors.AddRange(validationResults.Select(r => new 
            { 
                ErrorMessage = r.ErrorMessage, 
                MemberNames = r.MemberNames 
            }));
        }
        
        // Validate nested OrderItemDto objects
        if (orderDto.Items != null)
        {
            for (int i = 0; i < orderDto.Items.Count; i++)
            {
                var item = orderDto.Items[i];
                var itemValidationResults = new List<ValidationResult>();
                var itemValidationContext = new ValidationContext(item)
                {
                    DisplayName = $"Items[{i}]"
                };
                
                if (!Validator.TryValidateObject(item, itemValidationContext, itemValidationResults, true))
                {
                    errors.AddRange(itemValidationResults.Select(r => new 
                    { 
                        ErrorMessage = r.ErrorMessage, 
                        MemberNames = r.MemberNames.Select(mn => $"Items[{i}].{mn}").ToArray()
                    }));
                }
            }
        }
        
        return errors;
    }
}

