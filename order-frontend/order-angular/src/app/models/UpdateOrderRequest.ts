import { OrderItem } from "./OrderItem";

export interface UpdateOrderRequest {
    customerName: string;
    items: OrderItem[];
  }