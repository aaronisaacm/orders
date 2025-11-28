import { OrderItem } from "./OrderItem";

export interface CreateOrderRequest {
    customerName: string;
    items: OrderItem[];
  }