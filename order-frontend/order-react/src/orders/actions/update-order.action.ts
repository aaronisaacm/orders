import axios from "axios";
import type { Order } from "../../models/Order";
import { getAuthHeader } from "../../login/actions/login.action";

const API_URL = 'http://localhost:5146/orders';

export const updateOrderAction = async (order: Order) => {
    const authHeader = getAuthHeader();
    const response = await axios.put<Order>(`${API_URL}/${order.id}`, order, {
        headers: {
            Authorization: authHeader,
            ContentType: 'application/json'
        }
    });
    return response.data;
}
