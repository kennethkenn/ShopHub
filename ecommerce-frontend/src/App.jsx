import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import AdminDashboard from './pages/admin/Dashboard';
import Profile from './pages/Profile';
import './App.css';

const getCartStorageKey = (currentUser) => {
    if (currentUser?.id) {
        return `cart_user_${currentUser.id}`;
    }
    if (currentUser?.email) {
        return `cart_user_${currentUser.email.toLowerCase()}`;
    }
    return 'cart_guest';
};

function App() {
    const [user, setUser] = useState(null);
    const [cart, setCart] = useState([]);
    const [toast, setToast] = useState(null);
    const [isHydrating, setIsHydrating] = useState(true);
    const [cartReady, setCartReady] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setIsHydrating(false);
    }, []);

    useEffect(() => {
        if (isHydrating) {
            return;
        }

        const userCartKey = getCartStorageKey(user);
        const userCartRaw = localStorage.getItem(userCartKey);

        if (userCartRaw) {
            try {
                setCart(JSON.parse(userCartRaw));
            } catch {
                localStorage.removeItem(userCartKey);
                setCart([]);
            }
            setCartReady(true);
            return;
        }

        // Move guest cart to account cart on first login if account cart doesn't exist yet.
        if (user) {
            const guestCartRaw = localStorage.getItem('cart_guest');
            if (guestCartRaw) {
                try {
                    const parsedGuestCart = JSON.parse(guestCartRaw);
                    setCart(parsedGuestCart);
                    localStorage.setItem(userCartKey, JSON.stringify(parsedGuestCart));
                    localStorage.removeItem('cart_guest');
                } catch {
                    localStorage.removeItem('cart_guest');
                    setCart([]);
                }
                setCartReady(true);
                return;
            }
        }

        const legacyCartRaw = localStorage.getItem('cart');
        if (legacyCartRaw) {
            try {
                const parsedLegacyCart = JSON.parse(legacyCartRaw);
                setCart(parsedLegacyCart);
                localStorage.setItem(userCartKey, JSON.stringify(parsedLegacyCart));
            } catch {
                setCart([]);
            }
            localStorage.removeItem('cart');
            setCartReady(true);
            return;
        }

        setCart([]);
        setCartReady(true);
    }, [user, isHydrating]);

    useEffect(() => {
        if (!cartReady || isHydrating) {
            return;
        }
        const cartKey = getCartStorageKey(user);
        localStorage.setItem(cartKey, JSON.stringify(cart));
    }, [cart, user, cartReady, isHydrating]);

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
    };

    const addToCart = (product, quantity = 1) => {
        const existingItem = cart.find(item => item.id === product.id);
        let newCart;

        // Validate quantity
        if (quantity > product.stockQuantity) {
            showToast(`Only ${product.stockQuantity} items available in stock`, 'error');
            return;
        }

        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                showToast(`Cannot add more. Only ${product.stockQuantity} items available`, 'error');
                return;
            }
            newCart = cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: newQuantity }
                    : item
            );
        } else {
            newCart = [...cart, { ...product, quantity }];
        }

        setCart(newCart);
        showToast(`${product.name} added to cart`, 'success');
    };

    const removeFromCart = (productId) => {
        const newCart = cart.filter(item => item.id !== productId);
        setCart(newCart);
        showToast('Item removed from cart', 'info');
    };

    const updateCartQuantity = (productId, quantity) => {
        const product = cart.find(item => item.id === productId);

        if (quantity > product.stockQuantity) {
            showToast(`Only ${product.stockQuantity} items available`, 'error');
            return;
        }

        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }

        const newCart = cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
        );
        setCart(newCart);
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem(getCartStorageKey(user));
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <Router>
            <div className="app">
                <Navbar
                    user={user}
                    onLogout={handleLogout}
                    cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
                />
                {toast && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast(null)}
                    />
                )}
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/products" element={<Products addToCart={addToCart} />} />
                        <Route path="/products/:id" element={<ProductDetail addToCart={addToCart} />} />
                        <Route path="/cart" element={
                            <Cart
                                cart={cart}
                                updateQuantity={updateCartQuantity}
                                removeItem={removeFromCart}
                            />
                        } />
                        <Route path="/checkout" element={
                            <ProtectedRoute user={user} isHydrating={isHydrating}>
                                <Checkout cart={cart} clearCart={clearCart} showToast={showToast} />
                            </ProtectedRoute>
                        } />
                        <Route path="/login" element={
                            <PublicRoute user={user} isHydrating={isHydrating}>
                                <Login setUser={setUser} showToast={showToast} />
                            </PublicRoute>
                        } />
                        <Route path="/register" element={
                            <PublicRoute user={user} isHydrating={isHydrating}>
                                <Register setUser={setUser} showToast={showToast} />
                            </PublicRoute>
                        } />
                        <Route path="/orders" element={
                            <ProtectedRoute user={user} isHydrating={isHydrating}>
                                <Orders user={user} />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute user={user} isHydrating={isHydrating}>
                                <Profile user={user} setUser={setUser} showToast={showToast} />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/*" element={
                            <ProtectedRoute user={user} isHydrating={isHydrating} requireAdmin={true}>
                                <AdminDashboard user={user} />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
