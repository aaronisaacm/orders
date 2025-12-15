import type { Order } from "../models/Order";

export const mockOrders: Order[] = [{
    id: 1,
    customerName: "John Doe",
    createdAt: "2021-01-01",
    items: [{
        sku: "1",
        description: "Item 1",
        quantity: 1,
        unitPrice: 100
    }]
},
{
    id: 2,
    customerName: "Jane Doe",
    createdAt: "2021-01-02",
    items: [{
        sku: "2",
        description: "Item 2",
        quantity: 2,
        unitPrice: 200
    }]
},
{
    id: 3,
    customerName: "Jim Doe",
    createdAt: "2021-01-03",
    items: [{
        sku: "3",
        description: "Item 3",
        quantity: 3,
        unitPrice: 300
    }]
},
{
    id: 4,
    customerName: "Jill Doe",
    createdAt: "2021-01-04",
    items: [{
        sku: "4",
        description: "Item 4",
        quantity: 4,
        unitPrice: 400
    }]
},
{
    id: 5,
    customerName: "Jack Doe",
    createdAt: "2021-01-05",
    items: [{
        sku: "5",
        description: "Item 5",
        quantity: 5,
        unitPrice: 500
    }]
}];