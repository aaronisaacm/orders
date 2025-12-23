import { useMemo } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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

const validationSchema = Yup.object().shape({
    customerName: Yup.string().required('Nombre del Cliente es requerido'),
    items: Yup.array().of(
        Yup.object().shape({
            sku: Yup.string().required('Requerido'),
            description: Yup.string().required('Requerido'),
            quantity: Yup.number().typeError('Numérico').min(1, 'Min 1').required('Requerido'),
            unitPrice: Yup.number().typeError('Numérico').min(0, 'Min 0').required('Requerido'),
        })
    )
});

export const ModalOrder = ({ id, onClose }: ModalOrderProps) => {
    const { orders, setOrders } = useOrderStore();

    const initialValues: { customerName: string; items: OrderItem[] } = useMemo(() => {
        if (id) {
            const order = orders.find((o) => o.id === Number(id));
            if (order) {
                return {
                    customerName: order.customerName,
                    items: order.items ? [...order.items] : []
                };
            }
        }
        return {
            customerName: '',
            items: []
        };
    }, [id, orders]);

    const handleSubmit = async (values: typeof initialValues, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
        try {
            if (id) {
                // Update order
                const existingOrder = orders.find(o => o.id === Number(id));
                if (!existingOrder) return;

                const orderToUpdate: Order = {
                    ...existingOrder,
                    customerName: values.customerName,
                    items: values.items
                };

                await updateOrderAction(orderToUpdate);

                // Update store
                const updatedOrders = orders.map(o => o.id === Number(id) ? orderToUpdate : o);
                setOrders(updatedOrders);

            } else {
                // Create new order
                const newOrderData = {
                    customerName: values.customerName,
                    items: values.items
                };

                const createdOrder = await createOrderAction(newOrderData);

                // Update store
                setOrders([...orders, createdOrder]);
            }
            onClose();
        } catch (error) {
            console.error('Error saving order:', error);
            alert('Error al guardar el pedido');
        } finally {
            setSubmitting(false);
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
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize
                    >
                        {({ values, isSubmitting }) => (
                            <Form className="create-order-form">
                                <div className="form-section">
                                    <label htmlFor="customerName" className="form-label">Nombre del Cliente</label>
                                    <Field
                                        name="customerName"
                                        type="text"
                                        className="form-input"
                                        placeholder="Ej: Juan Pérez"
                                    />
                                    <ErrorMessage name="customerName" component="div" className="error-message" />
                                </div>

                                <div className="items-header">
                                    <h3>Items</h3>
                                </div>

                                <FieldArray name="items">
                                    {({ remove, push }) => (
                                        <div className="items-list">
                                            <div className="items-action-bar" style={{ marginBottom: '10px' }}>
                                                <button
                                                    type="button"
                                                    className="btn-text"
                                                    onClick={() => push({ sku: '', description: '', quantity: 1, unitPrice: 0 })}
                                                >
                                                    + Agregar Item
                                                </button>
                                            </div>

                                            {values.items && values.items.length > 0 ? (
                                                values.items.map((_, index) => (
                                                    <div className="item-row" key={index}>
                                                        <div className="form-group small">
                                                            <Field
                                                                name={`items.${index}.sku`}
                                                                placeholder="SKU"
                                                                className="form-input"
                                                            />
                                                            <ErrorMessage name={`items.${index}.sku`} component="div" className="error-message" />
                                                        </div>
                                                        <div className="form-group medium">
                                                            <Field
                                                                name={`items.${index}.description`}
                                                                placeholder="Descripción"
                                                                className="form-input"
                                                            />
                                                            <ErrorMessage name={`items.${index}.description`} component="div" className="error-message" />
                                                        </div>
                                                        <div className="form-group tiny">
                                                            <Field
                                                                name={`items.${index}.quantity`}
                                                                type="number"
                                                                placeholder="Cant."
                                                                className="form-input"
                                                                min="1"
                                                            />
                                                            <ErrorMessage name={`items.${index}.quantity`} component="div" className="error-message" />
                                                        </div>
                                                        <div className="form-group small">
                                                            <Field
                                                                name={`items.${index}.unitPrice`}
                                                                type="number"
                                                                placeholder="Precio"
                                                                className="form-input"
                                                                min="0"
                                                                step="0.01"
                                                            />
                                                            <ErrorMessage name={`items.${index}.unitPrice`} component="div" className="error-message" />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn-icon"
                                                            onClick={() => remove(index)}
                                                            title="Eliminar item"
                                                        >
                                                            &times;
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-items">No hay items agregados.</p>
                                            )}
                                        </div>
                                    )}
                                </FieldArray>

                                <div className="modal-actions end">
                                    <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                                    <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </div>
        </div>
    );
};

export default ModalOrder;