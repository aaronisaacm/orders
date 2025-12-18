import axios from "axios";
import type { Order } from "../../models/Order";
import { getAuthHeader } from "../../login/actions/login.action";

const API_URL = 'http://localhost:5146/orders';

export const createOrderAction = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    const authHeader = getAuthHeader();
    const response = await axios.post<Order>(API_URL, order, {
        headers: {
            Authorization: authHeader,
            ContentType: 'application/json'
        }
    });
    return response.data;
}
