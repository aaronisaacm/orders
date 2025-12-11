import React from 'react'
import './order-details.css'

export const OrderDetails = () => {
    return (
        <div className="order-detail-container">

  // Loading
            <div className="loading">
                <p>Cargando pedido...</p>
            </div>

  // Error
            <div className="error">
                <p>// mensaje de error </p>
                <a href="/orders" className="back-button">Volver a la lista</a>
            </div>

  // Order Detail
            <div className="order-detail">
                <header className="detail-header">
                    <a href="/orders" className="back-link">← Volver a la lista</a>
                    <h1>Pedido #ID_DEL_PEDIDO</h1>
                </header>

                <div className="order-info">
                    <div className="info-section">
                        <h2>Información del Cliente</h2>
                        <p><strong>Nombre:</strong> NOMBRE_DEL_CLIENTE</p>
                        <p><strong>Fecha de creación:</strong> FECHA_DEL_PEDIDO</p>
                    </div>

                    <div className="items-section">
                        <h2>Items del Pedido</h2>

        // No items
                        <p className="no-items">No hay items en este pedido</p>

        // Items table
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
            // Repetir esta fila por cada item
                                <tr>
                                    <td>SKU_ITEM</td>
                                    <td>DESCRIPCIÓN_ITEM</td>
                                    <td>CANTIDAD</td>
                                    <td>PRECIO_UNITARIO €</td>
                                    <td>TOTAL_ITEM $</td>
                                </tr>
                            </tbody>

                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan={4}><strong>Total del Pedido</strong></td>
                                    <td><strong>TOTAL_PEDIDO $</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>

    )
}
