import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/Order';
import { Subscription } from 'rxjs';
import { ModalComponent } from '../modal/modal.component';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CreateOrderRequest } from '../../models/CreateOrderRequest';
import { UpdateOrderRequest } from '../../models/UpdateOrderRequest';



@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ModalComponent, ReactiveFormsModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnDestroy {
  private orderService = inject(OrderService);

  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

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

  isModalOpen = signal<boolean>(false);
  modalMode = signal<'create' | 'edit' | 'delete'>('create');
  selectedOrder = signal<Order | null>(null);
  orderForm: FormGroup;

  constructor() {
    this.orderForm = this.fb.group({
      customerName: ['', [Validators.required, Validators.minLength(3)]],
      items: this.fb.array([])
    });

    this.loadOrders();
    this.connectToStream();
  }

  get items(): FormArray {
    return this.orderForm.get('items') as FormArray;
  }

  addItem(): void {
    const itemGroup = this.fb.group({
      sku: ['', Validators.required],
      description: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]]
    });
    this.items.push(itemGroup);
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.orderForm.reset();
    this.items.clear();
    this.addItem(); // Add one initial item
    this.isModalOpen.set(true);
  }

  openEditModal(order: Order, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.modalMode.set('edit');
    this.selectedOrder.set(order);

    // Reset form
    this.orderForm.reset();
    this.items.clear();

    // Patch Values
    this.orderForm.patchValue({
      customerName: order.customerName
    });

    // Re-create items form array
    order.items.forEach(item => {
      const itemGroup = this.fb.group({
        sku: [item.sku, Validators.required],
        description: [item.description, Validators.required],
        quantity: [item.quantity, [Validators.required, Validators.min(1)]],
        unitPrice: [item.unitPrice, [Validators.required, Validators.min(0.01)]]
      });
      this.items.push(itemGroup);
    });

    this.isModalOpen.set(true);
  }

  openDeleteModal(order: Order, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.modalMode.set('delete');
    this.selectedOrder.set(order);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedOrder.set(null);
  }

  submitOrder(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const formValue = this.orderForm.value;
    const mode = this.modalMode();

    if (mode === 'create') {
      const request: CreateOrderRequest = {
        customerName: formValue.customerName,
        items: formValue.items
      };

      this.loading.set(true);
      this.orderService.createOrder(request).subscribe({
        next: (newOrder) => {
          this.orders.update(orders => [...orders, newOrder]);
          this.loading.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating order:', err);
          this.error.set('Failed to create order');
          this.loading.set(false);
        }
      });
    } else if (mode === 'edit') {
      const orderId = this.selectedOrder()?.id;
      if (!orderId) return;

      const request: UpdateOrderRequest = {
        customerName: formValue.customerName,
        items: formValue.items
      };

      this.loading.set(true);
      this.orderService.updateOrder(orderId, request).subscribe({
        next: (updatedOrder) => {
          this.orders.update(orders =>
            orders.map(o => o.id === updatedOrder.id ? updatedOrder : o)
          );
          this.loading.set(false);
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating order:', err);
          this.error.set('Failed to update order');
          this.loading.set(false);
        }
      });
    }
  }

  confirmDelete(): void {
    const order = this.selectedOrder();
    if (!order) return;

    this.loading.set(true);
    this.orderService.deleteOrder(order.id).subscribe({
      next: () => {
        this.orders.update(orders => orders.filter(o => o.id !== order.id));
        this.loading.set(false);
        this.closeModal();
      },
      error: (err) => {
        console.error('Error deleting order:', err);
        this.error.set('Failed to delete order');
        this.loading.set(false);
      }
    });
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

  logout(): void {
    this.authService.logout();
  }

  getUsername(): string | null {
    return this.authService.username();
  }

  // Public handlers for HTML that can also handle event stopping
  editOrder(order: Order, event?: Event): void {
    this.openEditModal(order, event);
  }

  deleteOrder(order: Order, event?: Event): void {
    this.openDeleteModal(order, event);
  }

}

