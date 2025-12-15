import { createBrowserRouter } from "react-router-dom";
import { OrderList } from "./orders/order-list/order-list";
import { OrderDetails } from "./orders/order-details/order-details";
import { Login } from "./login/login";

export const AppRouter = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/orders",
        element: <OrderList />
    },
    {
        path: "/details/:orderId",
        element: <OrderDetails />
    },
    {
        path: "/login",
        element: <Login />
    }
])