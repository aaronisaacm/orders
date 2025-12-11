import type { OrderItem } from "./OrderItem";

export interface Order {
  id: number;
  customerName: string;
  createdAt: string;
  items: OrderItem[];
}