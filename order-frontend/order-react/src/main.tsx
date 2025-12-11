import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { OrderList } from './orders/order-list/order-list.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OrderList />
  </StrictMode>,
)
