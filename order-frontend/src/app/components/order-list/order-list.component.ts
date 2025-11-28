import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/Order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnDestroy {
  private orderService = inject(OrderService);
  private streamSubscription?: Subscription;
  private reconnectTimeout?: ReturnType<typeof setTimeout>;
  private isDestroyed = false;
  private retryCount = 0;
  private readonly maxRetries = 5;

  // Signals 
  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  isStreaming = signal<boolean>(false);

  constructor() {
    this.loadOrders();
    this.connectToStream();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    this.disconnectFromStream();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar los pedidos');
        this.loading.set(false);
        console.error('Error loading orders:', err);
      }
    });
  }

  connectToStream(): void {
    this.isStreaming.set(true);
    this.streamSubscription = this.orderService.streamOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
        this.loading.set(false);
        this.error.set(null);
        // Reset retry count on successful connection
        this.retryCount = 0;
      },
      error: (err) => {
        this.isStreaming.set(false);
        console.error('Stream error:', err);
        
        // Only retry if we haven't exceeded max retries
        if (this.retryCount < this.maxRetries && !this.isDestroyed) {
          this.retryCount++;
          this.error.set(`Error en la conexión en tiempo real (Intento ${this.retryCount}/${this.maxRetries})`);
          
          this.reconnectTimeout = setTimeout(() => {
            if (!this.isDestroyed) {
              this.connectToStream();
            }
          }, 5000);
        } else {
          // Max retries reached
          this.error.set('Error en la conexión en tiempo real. Se agotaron los intentos de reconexión.');
          this.isStreaming.set(false);
        }
      }
    });
  }

  disconnectFromStream(): void {
    if (this.streamSubscription) {
      this.streamSubscription.unsubscribe();
      this.isStreaming.set(false);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }

  calculateTotal(order: Order): number {
    return order.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
  }
}

