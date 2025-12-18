import { useEffect, useState } from 'react'
import './order-list.css'
import type { Order } from '../../models/Order';
import { getOrdersAction } from '../actions/get-orders.action';
import { useAuthStore } from '../../login/store/auth.store';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '../store/order.store';
import { ModalOrder } from '../order-modal/modal-order';
import { deleteOrderAction } from '../actions/delete-order.action';


export const OrderList = () => {

    const { isAuthenticated, setIsAuthenticated } = useAuthStore();
    const { orders, setOrders } = useOrderStore();
    const [id, setId] = useState<number | undefined>(undefined);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        sessionStorage.removeItem('credentials');
        sessionStorage.removeItem('username');
        setIsAuthenticated(false);
        navigate('/login');
    }

    const navigateToOrderDetails = (_orderId: number) => {
        navigate(`/details/${_orderId}`);
    }

    const calculateTotal = (order: Order): number => {
        return order.items.reduce((total, item) => total + (item.quantity * item.unitPrice), 0);
    }

    const openCreateModal = (orderId?: number, event?: React.MouseEvent) => {
        event?.stopPropagation();
        setId(orderId);
        setIsModalOpen(true);
    }

    const deleteOrder = (orderId: number, event?: React.MouseEvent) => {
        event?.stopPropagation();
        setIsLoading(true);
        deleteOrderAction(orderId).then(() => {
            const updatedOrders = orders.filter((order: Order) => order.id !== orderId);
            setOrders(updatedOrders);
            setIsLoading(false);
        });
    }

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        getOrdersAction().then((orders) => {
            setOrders(orders);
            setIsLoading(false);
        });
    }, [isAuthenticated]);

    return (
        <div className="order-list-container">
            <header className="header">
                <div className="header-content">
                    <h1>Lista de Pedidos</h1>
                    <div className="header-actions">
                        <button className="new-order-button" onClick={() => openCreateModal(undefined)}>
                            <i className="fa fa-plus"></i> Nuevo Pedido
                        </button>
                        <div className="stream-indicator">
                            <span className="stream-dot"></span>
                            <span>Conectado en tiempo real</span>
                        </div>

                        <div className="user-info">
                            <span className="stream-indicator">Usuario: {sessionStorage.getItem('username')} </span>
                            <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </header>


            {isLoading && (
                <div className="loading">
                    <p>Cargando pedidos...</p>
                </div>
            )}

            <div className="orders-grid">
                {orders.length > 0 ? (
                    orders.map((order: Order) => (
                        <div className="order-card" onClick={() => navigateToOrderDetails(order.id)} key={order.id}>
                            <div className='card-actions'>
                                <button className="icon-btn edit-btn" onClick={(event) => openCreateModal(order.id, event)} title="Editar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path
                                            d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z" />
                                    </svg>
                                </button>
                                <button className="icon-btn delete-btn" onClick={(event) => deleteOrder(order.id, event)} title="Eliminar">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path
                                            d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z" />
                                        <path
                                            d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z" />
                                    </svg>
                                </button>
                            </div>
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

            {isModalOpen && (
                <ModalOrder onClose={() => setIsModalOpen(false)} id={id} />
            )}

        </div>

    )
}

export default OrderList;
