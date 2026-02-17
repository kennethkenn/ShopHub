import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import './Cart.css';

function Cart({ cart, updateQuantity, removeItem }) {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    if (cart.length === 0) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="empty-cart">
                        <h2>Your cart is empty</h2>
                        <p>Add some products to get started</p>
                        <Link to="/products" className="btn btn-primary">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <div className="container">
                <h1>Shopping Cart</h1>

                <div className="cart-layout">
                    <div className="cart-items">
                        {cart.map(item => (
                            <div key={item.id} className="cart-item card">
                                <img
                                    src={item.images?.[0]?.imageUrl || 'https://via.placeholder.com/100'}
                                    alt={item.name}
                                    className="cart-item-image"
                                />
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p className="cart-item-price">${item.price}</p>
                                </div>
                                <div className="cart-item-quantity">
                                    <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>
                                        <Minus size={16} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <div className="cart-item-total">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </div>
                                <button
                                    className="cart-item-remove"
                                    onClick={() => removeItem(item.id)}
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-summary card">
                        <h2>Order Summary</h2>
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Shipping (calculated at payment)</span>
                            <span>${shipping.toFixed(2)}</span>
                        </div>
                        <div className="summary-divider"></div>
                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <Link to="/checkout" className="btn btn-primary btn-full">
                            Proceed to Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;
