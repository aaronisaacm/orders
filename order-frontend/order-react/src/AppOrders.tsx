import { RouterProvider } from 'react-router-dom'
import { AppRouter } from './app.router'
import { QueryClientProvider } from '@tanstack/react-query'
import { QueryClient } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

function AppOrders() {


  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={AppRouter}>
      </RouterProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>

  )
}

export default AppOrders
