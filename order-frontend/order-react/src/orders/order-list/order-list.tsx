import React from 'react'
import './order-list.css'

export const OrderList = () => {
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
                            <button className="logout-button">Cerrar Sesión</button>
                        </div>
                    </div>
                </div>
            </header>


            <div className="loading">
                <p>Cargando pedidos...</p>
            </div>


            <div className="error">
                <p></p>
                <button>Reintentar</button>
            </div>


            <div className="empty">
                <p>No hay pedidos disponibles</p>
            </div>


            <div className="orders-grid">
                <a className="order-card" href="#">
                    <div className="order-header">
                        <h2>Pedido #ID</h2>
                        <span className="order-date">FECHA</span>
                    </div>
                    <div className="order-customer">
                        <strong>Cliente:</strong> NOMBRE_CLIENTE
                    </div>
                    <div className="order-items">
                        <strong>Items:</strong> CANTIDAD_ITEMS
                    </div>
                    <div className="order-total">
                        <strong>Total:</strong> TOTAL $
                    </div>
                </a>

            </div>
        </div>

    )
}
