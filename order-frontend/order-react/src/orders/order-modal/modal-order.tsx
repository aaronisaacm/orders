import { useState, useEffect } from 'react';
import type { Order } from '../../models/Order';
import type { OrderItem } from '../../models/OrderItem';
import { useOrderStore } from '../store/order.store';
import { createOrderAction } from '../actions/create-order.action';
import { updateOrderAction } from '../actions/update-order.action';
import './modal-order.css';

interface ModalOrderProps {
    id?: number;
    onClose: () => void;
}

export const ModalOrder = ({ id, onClose }: ModalOrderProps) => {

    const { orders, setOrders } = useOrderStore();

    const [customerName, setCustomerName] = useState('');
    const [items, setItems] = useState<OrderItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (id) {
            const order = orders.find((o) => o.id === Number(id));
            if (order) {
                setCustomerName(order.customerName);
                setItems(order.items ? [...order.items] : []);
            }
        } else {
            setCustomerName('');
            setItems([]);
        }
    }, [id, orders]);

    const handleAddItem = () => {
        setItems([
            ...items,
            { sku: '', description: '', quantity: 1, unitPrice: 0 }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (id) {
                // Update order
                const existingOrder = orders.find(o => o.id === Number(id));
                if (!existingOrder) return;

                const orderToUpdate: Order = {
                    ...existingOrder,
                    customerName,
                    items
                };

                await updateOrderAction(orderToUpdate);

                // Update store
                const updatedOrders = orders.map(o => o.id === Number(id) ? orderToUpdate : o);
                setOrders(updatedOrders);

            } else {
                // Create new order
                const newOrderData = {
                    customerName,
                    items
                };

                const createdOrder = await createOrderAction(newOrderData as any); // Cast or match type

                // Update store
                setOrders([...orders, createdOrder]);
            }
            onClose();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error al guardar el pedido');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="modal-container">
                <div className="modal-header">
                    <h2 className="modal-title">{id ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-content">
                    <form className="create-order-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <label htmlFor="customerName" className="form-label">Nombre del Cliente</label>
                            <input id="customerName" type="text" className="form-input"
                                placeholder="Ej: Juan Pérez"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                required
                            ></input>
                        </div>

                        <div className="items-header">
                            <h3>Items</h3>
                            <button type="button" className="btn-text" onClick={handleAddItem}>+ Agregar Item</button>
                        </div>

                        <div className="items-list">
                            {items.length > 0 ? (
                                items.map((item, index) => (
                                    <div className="item-row" key={index}>
                                        <div className="form-group small">
                                            <input placeholder="SKU" className="form-input"
                                                value={item.sku}
                                                onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                                                required
                                            ></input>
                                        </div>
                                        <div className="form-group medium">
                                            <input placeholder="Descripción" className="form-input"
                                                value={item.description}
                                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                required
                                            ></input>
                                        </div>
                                        <div className="form-group tiny">
                                            <input type="number" placeholder="Cant." className="form-input" min="1"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                required
                                            ></input>
                                        </div>
                                        <div className="form-group small">
                                            <input type="number" placeholder="Precio" className="form-input" min="0" step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                required
                                            ></input>
                                        </div>
                                        <button type="button" className="btn-icon" onClick={() => handleRemoveItem(index)} title="Eliminar item">
                                            &times;
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="no-items">No hay items agregados.</p>
                            )}
                        </div>

                        <div className="modal-actions end">
                            <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                            <button type="submit" className="btn-primary" disabled={isLoading}>
                                {isLoading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalOrder;