import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, MessageSquare } from 'lucide-react';
import api from '../services/api';
import './Orders.css';

function Orders({ user }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders?page=0&size=100');
            console.log(response)
            const items = Array.isArray(response.data?.content) ? response.data.content : [];
            setOrders(items);
        } catch (error) {
            // Error is handled by API interceptor
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return <Clock size={20} color="#f59e0b" />;
            case 'PROCESSING': return <Package size={20} color="#3b82f6" />;
            case 'SHIPPED': return <Package size={20} color="#8b5cf6" />;
            case 'DELIVERED': return <CheckCircle size={20} color="#10b981" />;
            case 'CANCELLED': return <XCircle size={20} color="#ef4444" />;
            default: return <Clock size={20} />;
        }
    };

    if (!user) {
        return (
            <div className="orders-page">
                <div className="container">
                    <p>Please login to view your orders</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="container loading">Loading orders...</div>;
    }

    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className="orders-page">
            <div className="container">
                <h1>My Orders</h1>

                {safeOrders.length === 0 ? (
                    <div className="empty-orders">
                        <Package size={64} color="var(--text-light)" />
                        <h2>No orders yet</h2>
                        <p>Start shopping to see your orders here</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {safeOrders.map(order => (
                            <div key={order.id} className="order-card card">
                                <div className="order-header">
                                    <div>
                                        <h3>Order #{order.orderNumber}</h3>
                                        <p className="order-date">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Date unavailable'}
                                        </p>
                                    </div>
                                    <div className={`order-status status-${String(order.status || '').toLowerCase()}`}>
                                        {getStatusIcon(order.status)}
                                        <span>{order.status}</span>
                                    </div>
                                </div>

                                <div className="order-items">
                                    {(Array.isArray(order.items) ? order.items : []).map(item => (
                                        <div key={item.id} className="order-item">
                                            <img
                                                src={item.product?.images?.[0]?.imageUrl || 'https://via.placeholder.com/60'}
                                                alt={item.product?.name || 'Product'}
                                            />
                                            <div className="item-details">
                                                <p>{item.product?.name || 'Product'}</p>
                                                <span>Qty: {item.quantity}</span>
                                                {order.status === 'DELIVERED' && (
                                                    <Link to={`/products/${item.product?.id}#reviews-section`} className="btn-review">
                                                        <MessageSquare size={14} /> Review
                                                    </Link>
                                                )}
                                            </div>
                                            <span className="item-price">${Number(item.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-footer">
                                    <div className="shipping-info">
                                        <strong>Ship to:</strong>
                                        <p>{order.shippingAddress}, {order.shippingCity}</p>
                                    </div>
                                    <div className="order-total">
                                        <strong>Total:</strong>
                                        <span className="total-amount">${Number(order.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
