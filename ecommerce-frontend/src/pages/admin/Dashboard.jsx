import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, Users, BarChart3, Star, TrendingUp, MessageSquare } from 'lucide-react';
import api, { getDashboardStats, getPendingReviews, approveReview, deleteReview } from '../../services/api';
import './Dashboard.css';

function SalesGraph({ salesSeries }) {
    const maxValue = Math.max(...salesSeries.map((item) => item.total), 1);

    return (
        <div className="sales-card card">
            <div className="sales-header">
                <h2>7-Day Sales</h2>
                <span className="sales-total">
                    ${salesSeries.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                </span>
            </div>
            <div className="sales-bars">
                {salesSeries.map((item) => (
                    <div className="sales-bar-column" key={item.key}>
                        <div className="sales-value">${item.total.toFixed(0)}</div>
                        <div className="sales-bar-track">
                            <div
                                className="sales-bar-fill"
                                style={{ height: `${Math.max((item.total / maxValue) * 100, item.total > 0 ? 8 : 0)}%` }}
                            />
                        </div>
                        <div className="sales-label">{item.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardHome({ stats, salesSeries, onExport, canManageUsers }) {
    return (
        <div className="dashboard-home">
            <h1>Dashboard Overview</h1>
            <div className="stats-grid">
                <div className="stat-card card">
                    <div className="stat-icon stat-icon-products">
                        <Package size={32} color="var(--primary)" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Products</span>
                        <span className="stat-value">{stats.totalProducts}</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon stat-icon-orders">
                        <ShoppingBag size={32} color="var(--secondary)" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{stats.totalOrders}</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon stat-icon-low-stock">
                        <Package size={32} color="var(--primary-dark)" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active / Low Stock</span>
                        <span className="stat-value">{stats.activeProducts} / {stats.lowStockProducts}</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon stat-icon-pending">
                        <ShoppingBag size={32} color="var(--secondary)" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Orders</span>
                        <span className="stat-value">{stats.pendingOrders}</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                        <MessageSquare size={32} color="#ca8a04" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Pending Reviews</span>
                        <span className="stat-value">{stats.pendingReviewsCount || 0}</span>
                        <Link to="/admin/reviews" className="stat-link">Manage →</Link>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                        <Star size={32} color="#ca8a04" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Avg Rating</span>
                        <span className="stat-value">{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</span>
                    </div>
                </div>
                <div className="stat-card card">
                    <div className="stat-icon" style={{ background: 'rgba(22, 163, 74, 0.1)' }}>
                        <TrendingUp size={32} color="#16a34a" />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Success Rate</span>
                        <span className="stat-value">{stats.orderSuccessRate}%</span>
                    </div>
                </div>
            </div>

            <div className="admin-section card">
                <h2>Quick Actions</h2>
                <div className="quick-actions">
                    <Link to="/admin/products" className="btn btn-primary">Manage Products</Link>
                    <Link to="/admin/orders" className="btn btn-outline">View Orders</Link>
                    {canManageUsers && <Link to="/admin/users" className="btn btn-outline">Manage Users</Link>}
                    <button className="btn btn-outline" onClick={onExport}>Export Stats JSON</button>
                </div>
            </div>

            <SalesGraph salesSeries={salesSeries} />
        </div>
    );
}

function ProductManagement({ products, categories, loading, canDeleteProducts, onRefresh, onCreate, onUpdate, onDelete }) {
    const emptyForm = {
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        categoryId: '',
        active: true,
        imageUrlsText: ''
    };
    const [editingProductId, setEditingProductId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    const startCreate = () => {
        setEditingProductId(null);
        setForm(emptyForm);
    };

    const startEdit = (product) => {
        setEditingProductId(product.id);
        setForm({
            name: product.name || '',
            description: product.description || '',
            price: product.price ?? '',
            stockQuantity: product.stockQuantity ?? 0,
            categoryId: product.category?.id ?? '',
            active: Boolean(product.active),
            imageUrlsText: (product.images || []).map((img) => img.imageUrl).join('\n')
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const payload = {
            name: form.name.trim(),
            description: form.description.trim(),
            price: Number(form.price),
            stockQuantity: Number(form.stockQuantity),
            categoryId: form.categoryId ? Number(form.categoryId) : null,
            active: Boolean(form.active),
            imageUrls: form.imageUrlsText
                .split('\n')
                .map((value) => value.trim())
                .filter(Boolean)
        };

        try {
            if (editingProductId) {
                await onUpdate(editingProductId, payload);
            } else {
                await onCreate(payload);
            }
            startCreate();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="admin-page-grid">
            <form className="admin-section card admin-product-form" onSubmit={handleSubmit}>
                <h2>{editingProductId ? 'Edit Product' : 'Create Product'}</h2>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        rows="4"
                        value={form.description}
                        onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Price</label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Stock</label>
                        <input
                            type="number"
                            min="0"
                            value={form.stockQuantity}
                            onChange={(e) => setForm((prev) => ({ ...prev, stockQuantity: e.target.value }))}
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select
                        value={form.categoryId}
                        onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                    >
                        <option value="">No category</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Image URLs (one per line)</label>
                    <textarea
                        rows="4"
                        value={form.imageUrlsText}
                        onChange={(e) => setForm((prev) => ({ ...prev, imageUrlsText: e.target.value }))}
                    />
                </div>
                <div className="form-checkbox">
                    <input
                        id="product-active"
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                    />
                    <label htmlFor="product-active">Active product</label>
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                    </button>
                    {editingProductId && (
                        <button type="button" className="btn btn-outline" onClick={startCreate}>
                            Cancel Edit
                        </button>
                    )}
                </div>
            </form>

            <div className="admin-section card">
                <div className="admin-section-header">
                    <h2>Products</h2>
                    <button className="btn btn-outline" onClick={onRefresh}>Refresh</button>
                </div>
                {loading ? (
                    <p>Loading products...</p>
                ) : products.length === 0 ? (
                    <p>No products found.</p>
                ) : (
                    <div className="admin-list">
                        {products.map((product) => (
                            <div key={product.id} className="admin-row">
                                <div>
                                    <strong>{product.name}</strong>
                                    <p>{product.category?.name || 'No category'} | ID: {product.id}</p>
                                </div>
                                <div className="admin-row-meta">
                                    <span>${Number(product.price).toFixed(2)}</span>
                                    <span>Stock: {product.stockQuantity}</span>
                                    <span className={product.active ? 'status-ok' : 'status-muted'}>
                                        {product.active ? 'Active' : 'Inactive'}
                                    </span>
                                    <button className="btn btn-outline" onClick={() => startEdit(product)}>
                                        Edit
                                    </button>
                                    {canDeleteProducts && (
                                        <button className="btn btn-danger" onClick={() => onDelete(product.id)}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderManagement({ orders, loading, onRefresh, onStatusUpdate }) {
    const [statusByOrder, setStatusByOrder] = useState({});
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

    return (
        <div className="admin-section card">
            <div className="admin-section-header">
                <h2>Order Management</h2>
                <button className="btn btn-outline" onClick={onRefresh}>Refresh</button>
            </div>
            {loading ? (
                <p>Loading orders...</p>
            ) : orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                <div className="admin-list">
                    {orders.map((order) => (
                        <div key={order.id} className="admin-row">
                            <div>
                                <strong>{order.orderNumber}</strong>
                                <p>{new Date(order.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="admin-row-meta">
                                <span>{order.status}</span>
                                <span>${Number(order.totalAmount || 0).toFixed(2)}</span>
                                <select
                                    value={statusByOrder[order.id] || order.status}
                                    onChange={(e) => setStatusByOrder((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                >
                                    {statuses.map((status) => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => onStatusUpdate(order.id, statusByOrder[order.id] || order.status)}
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function ReviewManagement({ reviews, loading, onRefresh, onApprove, onDelete }) {
    return (
        <div className="admin-section card">
            <div className="admin-section-header">
                <h2>Review Management</h2>
                <button className="btn btn-outline" onClick={onRefresh}>Refresh</button>
            </div>
            {loading ? (
                <p>Loading reviews...</p>
            ) : reviews.length === 0 ? (
                <p>No pending reviews found.</p>
            ) : (
                <div className="admin-list">
                    {reviews.map((review) => (
                        <div key={review.id} className="admin-row">
                            <div className="review-admin-body">
                                <div className="review-admin-header">
                                    <strong>{review.user?.firstName} {review.user?.lastName}</strong>
                                    <span className="review-admin-product">on {review.product?.name}</span>
                                    <div className="stars">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={14}
                                                fill={i < review.rating ? '#fbbf24' : 'none'}
                                                color="#fbbf24"
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="review-admin-comment">"{review.comment}"</p>
                                <span className="review-admin-date">{new Date(review.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="admin-row-meta">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => onApprove(review.id)}
                                >
                                    Approve
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => onDelete(review.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function UserManagement({ users, loading, onRefresh, onUpdateUser, currentUserId }) {
    const [draft, setDraft] = useState({});
    const roles = ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'];

    return (
        <div className="admin-section card">
            <div className="admin-section-header">
                <h2>User Management</h2>
                <button className="btn btn-outline" onClick={onRefresh}>Refresh</button>
            </div>
            {loading ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <div className="admin-list">
                    {users.map((account) => {
                        const accountDraft = draft[account.id] || {
                            role: account.role,
                            enabled: account.enabled
                        };

                        return (
                            <div key={account.id} className="admin-row">
                                <div>
                                    <strong>{account.firstName} {account.lastName}</strong>
                                    <p>{account.email}</p>
                                </div>
                                <div className="admin-row-meta">
                                    <select
                                        value={accountDraft.role}
                                        onChange={(e) => setDraft((prev) => ({
                                            ...prev,
                                            [account.id]: { ...accountDraft, role: e.target.value }
                                        }))}
                                    >
                                        {roles.map((role) => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={String(accountDraft.enabled)}
                                        onChange={(e) => setDraft((prev) => ({
                                            ...prev,
                                            [account.id]: { ...accountDraft, enabled: e.target.value === 'true' }
                                        }))}
                                        disabled={account.role === 'SUPER_ADMIN'}
                                    >
                                        <option value="true">Enabled</option>
                                        <option value="false">Disabled</option>
                                    </select>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => onUpdateUser(account.id, accountDraft)}
                                        disabled={currentUserId === account.id && accountDraft.enabled === false}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Dashboard({ user }) {
    const location = useLocation();
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalOrders: 0,
        activeProducts: 0,
        lowStockProducts: 0,
        pendingOrders: 0,
        averageRating: 0.0,
        orderSuccessRate: 0.0
    });
    const [salesSeries, setSalesSeries] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);

    useEffect(() => {
        fetchStats();
        fetchProducts();
        fetchOrders();
        if (isSuperAdmin) {
            fetchUsers();
        }
        fetchReviews();
        fetchCategories();
    }, [isSuperAdmin]);

    const fetchStats = async () => {
        try {
            // Get all consolidated stats from the new endpoint
            const statsData = await getDashboardStats();
            setStats(statsData);

            // Still need to get all orders to build the sales series for now
            // Future optimization: move sales series data to the dashboard stats endpoint
            const pendingOrdersRes = await api.get('/admin/orders?page=0&size=120');
            const allOrders = pendingOrdersRes.data.content || [];
            setSalesSeries(buildSalesSeries(allOrders));
        } catch (error) {
            // handled globally
        }
    };

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);
            const response = await api.get('/admin/products?page=0&size=50');
            setProducts(response.data.content || []);
        } catch (error) {
            setProducts([]);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchOrders = async () => {
        try {
            setLoadingOrders(true);
            const response = await api.get('/admin/orders?page=0&size=20');
            setOrders(response.data.content || []);
        } catch (error) {
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const response = await api.get('/admin/users?page=0&size=100');
            setUsers(response.data.content || []);
        } catch (error) {
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const response = await getPendingReviews(0, 50);
            setPendingReviews(response.content || []);
        } catch (error) {
            setPendingReviews([]);
        } finally {
            setLoadingReviews(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data || []);
        } catch (error) {
            setCategories([]);
        }
    };

    const createProduct = async (payload) => {
        await api.post('/admin/products', payload);
        await Promise.all([fetchProducts(), fetchStats()]);
    };

    const updateProduct = async (productId, payload) => {
        await api.put(`/admin/products/${productId}`, payload);
        await Promise.all([fetchProducts(), fetchStats()]);
    };

    const deleteProduct = async (productId) => {
        if (!window.confirm('Delete this product? This action cannot be undone.')) {
            return;
        }
        await api.delete(`/admin/products/${productId}`);
        await Promise.all([fetchProducts(), fetchStats()]);
    };

    const updateOrderStatus = async (orderId, status) => {
        await api.put(`/admin/orders/${orderId}/status?status=${status}`);
        await Promise.all([fetchOrders(), fetchStats()]);
    };

    const updateUser = async (userId, payload) => {
        await api.put(`/admin/users/${userId}`, payload);
        fetchUsers();
    };

    const handleApproveReview = async (reviewId) => {
        await approveReview(reviewId);
        await Promise.all([fetchReviews(), fetchStats()]);
    };

    const handleDeleteReview = async (reviewId) => {
        if (!window.confirm('Delete this review?')) return;
        await deleteReview(reviewId);
        await Promise.all([fetchReviews(), fetchStats()]);
    };

    const exportStats = () => {
        const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'admin-stats.json';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
        return (
            <div className="admin-dashboard">
                <div className="container">
                    <h1>Access Denied</h1>
                    <p>You don't have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <h2>Admin Panel</h2>
                    <nav className="admin-nav">
                        <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>
                            <BarChart3 size={20} />
                            Dashboard
                        </Link>
                        <Link to="/admin/products" className={location.pathname === '/admin/products' ? 'active' : ''}>
                            <Package size={20} />
                            Products
                        </Link>
                        <Link to="/admin/orders" className={location.pathname === '/admin/orders' ? 'active' : ''}>
                            <ShoppingBag size={20} />
                            Orders
                        </Link>
                        <Link to="/admin/reviews" className={location.pathname === '/admin/reviews' ? 'active' : ''}>
                            <MessageSquare size={20} />
                            Reviews
                            {stats.pendingReviewsCount > 0 && <span className="nav-badge">{stats.pendingReviewsCount}</span>}
                        </Link>
                        {isSuperAdmin && (
                            <Link to="/admin/users" className={location.pathname === '/admin/users' ? 'active' : ''}>
                                <Users size={20} />
                                Users
                            </Link>
                        )}
                    </nav>
                </aside>

                <main className="admin-content">
                    <Routes>
                        <Route index element={<DashboardHome stats={stats} salesSeries={salesSeries} onExport={exportStats} canManageUsers={isSuperAdmin} />} />
                        <Route
                            path="products"
                            element={
                                <ProductManagement
                                    products={products}
                                    categories={categories}
                                    loading={loadingProducts}
                                    canDeleteProducts={isSuperAdmin}
                                    onRefresh={fetchProducts}
                                    onCreate={createProduct}
                                    onUpdate={updateProduct}
                                    onDelete={deleteProduct}
                                />
                            }
                        />
                        <Route
                            path="orders"
                            element={
                                <OrderManagement
                                    orders={orders}
                                    loading={loadingOrders}
                                    onRefresh={fetchOrders}
                                    onStatusUpdate={updateOrderStatus}
                                />
                            }
                        />
                        <Route
                            path="reviews"
                            element={
                                <ReviewManagement
                                    reviews={pendingReviews}
                                    loading={loadingReviews}
                                    onRefresh={fetchReviews}
                                    onApprove={handleApproveReview}
                                    onDelete={handleDeleteReview}
                                />
                            }
                        />
                        {isSuperAdmin && (
                            <Route
                                path="users"
                                element={
                                    <UserManagement
                                        users={users}
                                        loading={loadingUsers}
                                        onRefresh={fetchUsers}
                                        onUpdateUser={updateUser}
                                        currentUserId={user.id}
                                    />
                                }
                            />
                        )}
                        {!isSuperAdmin && (
                            <Route path="users" element={<div className="admin-section card"><h2>Access Denied</h2><p>Only SUPER_ADMIN can manage users.</p></div>} />
                        )}
                    </Routes>
                </main>
            </div>
        </div>
    );
}

function buildSalesSeries(orders) {
    const today = new Date();
    const points = [];

    for (let i = 6; i >= 0; i--) {
        const day = new Date(today);
        day.setHours(0, 0, 0, 0);
        day.setDate(today.getDate() - i);

        const nextDay = new Date(day);
        nextDay.setDate(day.getDate() + 1);

        const total = orders
            .filter((order) => {
                const createdAt = new Date(order.createdAt);
                return createdAt >= day && createdAt < nextDay;
            })
            .reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);

        points.push({
            key: day.toISOString(),
            label: day.toLocaleDateString('en-US', { weekday: 'short' }),
            total
        });
    }

    return points;
}

export default Dashboard;
