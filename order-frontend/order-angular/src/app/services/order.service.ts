import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';
import { CreateOrderRequest } from '../models/CreateOrderRequest';
import { UpdateOrderRequest } from '../models/UpdateOrderRequest';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = (typeof window !== 'undefined' && (window as any).__API_URL__) 
    ? `${(window as any).__API_URL__}/orders`
    : 'http://localhost:5146/orders';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Get HTTP options with authentication headers
   */
  private getHttpOptions(): { headers: HttpHeaders } {
    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json'
    };

    const authHeader = this.authService.getAuthHeader();
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    return {
      headers: new HttpHeaders(headers)
    };
  }

  /**
   * Retrieve all orders
   * @returns Observable<Order[]> List of all orders
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl, this.getHttpOptions());
  }

  /**
   * Retrieve a specific order by ID
   * @param id The order ID
   * @returns Observable<Order> The order
   */
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${id}`, this.getHttpOptions());
  }

  /**
   * Create a new order
   * @param order The order data to create
   * @returns Observable<Order> The created order with generated ID and createdAt
   */
  createOrder(order: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, order, this.getHttpOptions());
  }

  /**
   * Update an existing order
   * @param id The order ID to update
   * @param order The updated order data
   * @returns Observable<Order> The updated order
   */
  updateOrder(id: number, order: UpdateOrderRequest): Observable<Order> {
    return this.http.put<Order>(`${this.baseUrl}/${id}`, order, this.getHttpOptions());
  }

  /**
   * Delete an order by ID
   * @param id The order ID to delete
   * @returns Observable<void>
   */
  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, this.getHttpOptions());
  }

  /**
   * Stream all orders in real-time using Server-Sent Events (SSE)
   * @returns Observable<Order[]> Stream of orders (updates every 5 seconds)
   */
  streamOrders(): Observable<Order[]> {
    return new Observable<Order[]>(observer => {
      const httpOptions = this.getHttpOptions();
      
      // Convert HttpHeaders to plain object for fetch
      const headers: { [key: string]: string } = {};
      httpOptions.headers.keys().forEach(key => {
        const value = httpOptions.headers.get(key);
        if (value) {
          headers[key] = value;
        }
      });
      
      // Add Accept header for SSE
      headers['Accept'] = 'text/event-stream';

      let abortController: AbortController | null = new AbortController();
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

      fetch(`${this.baseUrl}/stream`, {
        method: 'GET',
        headers: headers,
        signal: abortController.signal
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('ReadableStream not supported');
        }

        reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = (): Promise<void> => {
          if (!reader) {
            return Promise.resolve();
          }

          return reader.read().then(({ done, value }) => {
            if (done) {
              observer.complete();
              return Promise.resolve();
            }

            // Decode the chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines (SSE format: "data: {...}\n\n")
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonData = line.substring(6); // Remove "data: " prefix
                  const data = JSON.parse(jsonData);
                  // Handle both single order and array of orders
                  const orders: Order[] = Array.isArray(data) ? data : [data];
                  observer.next(orders);
                } catch (error) {
                  console.error('Error parsing SSE data:', error);
                  observer.error(error);
                }
              }
            }

            // Continue reading
            return processStream();
          });
        };

        return processStream();
      })
      .catch(error => {
        if (error.name !== 'AbortError') {
          observer.error(error);
        }
      });

      // Cleanup function
      return () => {
        if (abortController) {
          abortController.abort();
          abortController = null;
        }
        if (reader) {
          reader.cancel();
          reader = null;
        }
      };
    });
  }
}

