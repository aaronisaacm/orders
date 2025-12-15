import axios from "axios";
import type { Order } from "../../models/Order";
import { getAuthHeader } from "../../login/actions/login.action";

const API_URL = 'http://localhost:5146/orders';

export const getOrdersAction = async () => {
    const authHeader = getAuthHeader();
    const response = await axios.get<Order[]>(API_URL, {
        headers: {
            Authorization: authHeader,
            ContentType: 'application/json'
        }
    });
    const orders = response.data;
    return orders;
}