import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppOrders from './AppOrders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppOrders />
  </StrictMode>,
)
