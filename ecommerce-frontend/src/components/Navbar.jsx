import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import './Navbar.css';

function Navbar({ user, cartCount, onLogout }) {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        onLogout?.();
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">
                    <ShoppingCart size={32} />
                    <span>ShopHub</span>
                </Link>

                <form onSubmit={handleSearch} className="nav-search">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>

                <div className="nav-links">
                    <Link to="/products" className="nav-link">Products</Link>

                    {user ? (
                        <>
                            <Link to="/orders" className="nav-link">Orders</Link>
                            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                                <Link to="/admin" className="nav-link">Admin</Link>
                            )}
                            <Link to="/cart" className="nav-link cart-link">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            <div className="user-menu">
                                <User size={20} />
                                <span>{user.firstName}</span>
                                <div className="dropdown">
                                    <Link to="/profile" className="dropdown-item">
                                        <User size={16} />
                                        Profile
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <LogOut size={16} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/cart" className="nav-link cart-link">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                            </Link>
                            <Link to="/login" className="btn btn-outline">Login</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
