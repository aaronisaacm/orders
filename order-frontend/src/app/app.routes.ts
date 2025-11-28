import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'orders',
    pathMatch: 'full'
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent)
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./components/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
  }
];
