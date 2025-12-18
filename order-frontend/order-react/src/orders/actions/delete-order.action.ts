import axios from "axios";
import type { Order } from "../../models/Order";
import { getAuthHeader } from "../../login/actions/login.action";

const API_URL = 'http://localhost:5146/orders';

export const deleteOrderAction = async (orderId: number) => {
    const authHeader = getAuthHeader();
    const response = await axios.delete<Order>(`${API_URL}/${orderId}`, {
        headers: {
            Authorization: authHeader,
            ContentType: 'application/json'
        }
    });
    return response.data;
}