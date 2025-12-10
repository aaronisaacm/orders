import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/Order';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit {
  private orderService = inject(OrderService);
  private route = inject(ActivatedRoute);

  // Signals
  order = signal<Order | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(parseInt(orderId, 10));
    } else {
      this.error.set('ID de pedido no válido');
      this.loading.set(false);
    }
  }

  loadOrder(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Error al cargar el pedido');
        this.loading.set(false);
        console.error('Error loading order:', err);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString('es-ES');
  }

  calculateItemTotal(item: { quantity: number; unitPrice: number }): number {
    return item.quantity * item.unitPrice;
  }

  calculateOrderTotal(): number {
    const currentOrder = this.order();
    if (!currentOrder) return 0;
    return currentOrder.items.reduce((total, item) => total + this.calculateItemTotal(item), 0);
  }
}

