import { useEffect } from 'react'
import './order-list.css'
import type { Order } from '../../models/Order';
import { getOrdersAction } from '../actions/get-orders.action';
import { useAuthStore } from '../../login/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/order.store';

export const OrderList = () => {

    const { isAuthenticated, setIsAuthenticated } = useAuthStore();
    const { orders, setOrders } = useOrderStore();

    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('credentials');
        sessionStorage.removeItem('username');
        setIsAuthenticated(false);
        navigate('/login');
    }

    const navigateToOrderDetails = (orderId: number) => {
        navigate(`/details/${orderId}`);
    }

    const calculateTotal = (order: Order): number => {
        return order.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        getOrdersAction().then((orders) => {
            setOrders(orders);
        });
    }, [isAuthenticated]);

    return (
        <div className="order-list-container">
            <header className="header">
                <div className="header-content">
                    <h1>Lista de Pedidos</h1>
                    <div className="header-actions">
                        <div className="stream-indicator">
                            <span className="stream-dot"></span>
                            <span>Conectado en tiempo real</span>
                        </div>

                        <div className="user-info">
                            <span>Usuario: </span>
                            <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </header>


            <div className="loading">
                <p>Cargando pedidos...</p>
            </div>

            <div className="orders-grid">
                {orders.length > 0 ? (
                    orders.map((order: Order) => (
                        <div className="order-card" onClick={() => navigateToOrderDetails(order.id)} key={order.id}>
                            <div className="order-header">
                                <h2>Pedido #{order.id}</h2>
                                <span className="order-date">{order.createdAt}</span>
                            </div>
                            <div className="order-customer">
                                <strong>Cliente:</strong> {order.customerName}
                            </div>
                            <div className="order-items">
                                <strong>Items:</strong> {order.items.length}
                            </div>
                            <div className="order-total">
                                <strong>Total:</strong> {calculateTotal(order)}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty">
                        <p>No hay pedidos disponibles</p>
                    </div>
                )
                }
            </div>

            <div className="error">
                <p></p>
                <button>Reintentar</button>
            </div>

        </div>

    )
}

export default OrderList;
