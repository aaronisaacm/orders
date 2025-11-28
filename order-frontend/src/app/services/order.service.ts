import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';
import { CreateOrderRequest } from '../models/CreateOrderRequest';
import { UpdateOrderRequest } from '../models/UpdateOrderRequest';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = (typeof window !== 'undefined' && (window as any).__API_URL__) 
    ? `${(window as any).__API_URL__}/orders`
    : 'http://localhost:5076/orders';
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  /**
   * Retrieve all orders
   * @returns Observable<Order[]> List of all orders
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl);
  }

  /**
   * Retrieve a specific order by ID
   * @param id The order ID
   * @returns Observable<Order> The order
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`);
  }

  /**
   * Create a new order
   * @param order The order data to create
   * @returns Observable<Order> The created order with generated ID and createdAt
   */
  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order, this.httpOptions);
  }

  /**
   * Update an existing order
   * @param id The order ID to update
   * @param order The updated order data
   * @returns Observable<Order> The updated order
   */
  updateOrder(id: number, order: UpdateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, order, this.httpOptions);
  }

  /**
   * Delete an order by ID
   * @param id The order ID to delete
   * @returns Observable<void>
   */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Stream all orders in real-time using Server-Sent Events (SSE)
   * @returns Observable<Order[]> Stream of orders (updates every 5 seconds)
   */
  streamOrders(): Observable<Order[]> {
    return new Observable<Order[]>(observer => {
      const eventSource = new EventSource(`${this.baseUrl}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Handle both single order and array of orders
          const orders: Order[] = Array.isArray(data) ? data : [data];
          observer.next(orders);
        } catch (error) {
          observer.error(error);
        }
      };

      eventSource.onerror = (error) => {
        observer.error(error);
        eventSource.close();
      };

      // Cleanup function
      return () => {
        eventSource.close();
      };
    });
  }
}

