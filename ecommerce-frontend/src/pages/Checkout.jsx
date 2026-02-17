import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone } from 'lucide-react';
import api from '../services/api';
import './Checkout.css';

function Checkout({ cart, clearCart, showToast }) {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('STRIPE');
    const [loading, setLoading] = useState(false);
    const [paymentResult, setPaymentResult] = useState(null);
    const [formData, setFormData] = useState({
        shippingAddress: '',
        shippingCity: '',
        shippingPostalCode: '',
        shippingCountry: 'Kenya',
        phoneNumber: ''
    });

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 0;
    const total = subtotal + shipping;

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/cart');
        }
    }, [cart.length, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (paymentMethod === 'MPESA' && !/^\+?[\d\s-()]+$/.test(formData.phoneNumber)) {
            showToast('Please enter a valid phone number for M-Pesa', 'error');
            return;
        }

        setLoading(true);

        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity
                })),
                ...formData,
                paymentProvider: paymentMethod
            };

            const response = await api.post('/orders', orderData);
            const payment = response.data?.payment || null;
            setPaymentResult(payment);

            if (paymentMethod === 'STRIPE') {
                if (payment?.mode === 'demo') {
                    showToast('Order created. Stripe is running in demo mode.', 'info');
                } else {
                    showToast('Order created. Continue in Stripe checkout.', 'success');
                }
            } else {
                showToast(payment?.message || `STK Push sent to ${formData.phoneNumber}. Check your phone.`, 'success');
            }

            clearCart();
            setTimeout(() => navigate('/orders'), 300);
        } catch (error) {
            showToast(error.response?.data?.message || 'Order creation failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return null;
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>
                <p className="checkout-subtitle">Secure checkout with card or mobile money</p>

                <div className="checkout-layout">
                    <form onSubmit={handleSubmit} className="checkout-form">
                        <div className="form-section card">
                            <h2>Shipping Information</h2>

                            <div className="form-group">
                                <label>Address *</label>
                                <input
                                    type="text"
                                    placeholder="123 Main Street"
                                    value={formData.shippingAddress}
                                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        placeholder="Nairobi"
                                        value={formData.shippingCity}
                                        onChange={(e) => setFormData({ ...formData, shippingCity: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Postal Code</label>
                                    <input
                                        type="text"
                                        placeholder="00100"
                                        value={formData.shippingPostalCode}
                                        onChange={(e) => setFormData({ ...formData, shippingPostalCode: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Country *</label>
                                <input
                                    type="text"
                                    value={formData.shippingCountry}
                                    onChange={(e) => setFormData({ ...formData, shippingCountry: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-section card">
                            <h2>Payment Method</h2>

                            <div className="payment-methods">
                                <label className={`payment-option ${paymentMethod === 'STRIPE' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value="STRIPE"
                                        checked={paymentMethod === 'STRIPE'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <CreditCard size={24} />
                                    <span>Credit/Debit Card</span>
                                    <small>Visa, Mastercard, AMEX</small>
                                </label>

                                <label className={`payment-option ${paymentMethod === 'MPESA' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        value="MPESA"
                                        checked={paymentMethod === 'MPESA'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <Smartphone size={24} />
                                    <span>M-Pesa</span>
                                    <small>Instant STK push</small>
                                </label>
                            </div>

                            {paymentMethod === 'MPESA' && (
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input
                                        type="tel"
                                        placeholder="+254700000000"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        <button type="submit" className="btn btn-primary btn-full btn-large" disabled={loading}>
                            {loading ? 'Processing...' : `Place Order - $${total.toFixed(2)}`}
                        </button>
                        {paymentResult && (
                            <div className="payment-note card">
                                <strong>Payment Initiated</strong>
                                <p>
                                    {paymentMethod === 'STRIPE'
                                        ? 'Your order was created and payment is pending confirmation.'
                                        : paymentResult.message || 'STK push sent to your phone.'}
                                </p>
                            </div>
                        )}
                    </form>

                    <div className="order-summary card">
                        <h2>Order Summary</h2>

                        {cart.map(item => (
                            <div key={item.id} className="summary-item">
                                <img src={item.images?.[0]?.imageUrl || 'https://via.placeholder.com/60'} alt={item.name} />
                                <div className="item-info">
                                    <p>{item.name}</p>
                                    <span>Qty: {item.quantity}</span>
                                </div>
                                <span className="item-price">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}

                        <div className="summary-divider"></div>

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
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;
