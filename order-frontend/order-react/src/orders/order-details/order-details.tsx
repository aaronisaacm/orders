import { useEffect } from 'react';
import './order-details.css'
import { useAuthStore } from '../../login/store/auth.store';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrderStore } from '../store/order.store';
import type { Order } from '../../models/Order';
import type { OrderItem } from '../../models/OrderItem';

export const OrderDetails = () => {

    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();

    const navigateToOrders = () => {
        navigate('/orders');
    }

    const { orders } = useOrderStore();

    const params = useParams<{ orderId: string }>();
    const orderId = params.orderId;
    const order = orders.find((order: Order) => order.id == Number(orderId));

    useEffect(() => {
        if (!order) {
            navigate('/orders');
            return;
        }
    }, [order]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
    }, [isAuthenticated]);

    return (
        <div className="order-detail-container">
            {/* Order Detail */}
            <div className="order-detail">
                <header className="detail-header">
                    <button onClick={navigateToOrders}>← Volver a la lista</button>
                    <h1>Pedido #{order?.id}</h1>
                </header>

                <div className="order-info">
                    <div className="info-section">
                        <h2>Información del Cliente</h2>
                        <p><strong>Nombre:</strong> {order?.customerName}</p>
                        <p><strong>Fecha de creación:</strong> {order?.createdAt}</p>
                    </div>

                    <div className="items-section">
                        <h2>Items del Pedido</h2>
                        {order?.items && order.items.length > 0 ? (
                            <table className="items-table">
                                <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>Descripción</th>
                                        <th>Cantidad</th>
                                        <th>Precio Unitario</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.items.map((item: OrderItem) => (
                                        <tr key={item.sku}>
                                            <td>{item.sku}</td>
                                            <td>{item.description}</td>
                                            <td>{item.quantity}</td>
                                            <td>$ {item.unitPrice}</td>
                                            <td>$ {item.quantity * item.unitPrice}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="total-row">
                                        <td colSpan={4}><strong>Total del Pedido</strong></td>
                                        <td><strong>$ {order.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        ) : (
                            <p className="no-items">No hay items en este pedido</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetails;
