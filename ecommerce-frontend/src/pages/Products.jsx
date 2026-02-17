import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import api from '../services/api';
import Spinner from '../components/Spinner';
import './Products.css';

function Products({ addToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [categories, setCategories] = useState([]);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const categoryId = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'featured';

    useEffect(() => {
        fetchProducts();
    }, [page, searchQuery, categoryId]);

    useEffect(() => {
        setPage(0);
    }, [searchQuery, categoryId]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            let url = `/products?page=${page}&size=12`;

            if (searchQuery) {
                url = `/products/search?query=${encodeURIComponent(searchQuery)}&page=${page}&size=12`;
            } else if (categoryId) {
                url = `/products/category/${categoryId}?page=${page}&size=12`;
            }

            const response = await api.get(url);
            setProducts(response.data.content || []);
            setTotalPages(response.data.totalPages || 0);
        } catch (error) {
            // Error is handled by API interceptor
            setProducts([]);
        } finally {
            setLoading(false);
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

    const updateFilter = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        setSearchParams(next);
    };

    const sortedProducts = [...products]
        .filter((product) => !categoryId || String(product.category?.id) === String(categoryId))
        .sort((a, b) => {
            if (sort === 'price-asc') return Number(a.price) - Number(b.price);
            if (sort === 'price-desc') return Number(b.price) - Number(a.price);
            if (sort === 'name-asc') return a.name.localeCompare(b.name);
            if (sort === 'name-desc') return b.name.localeCompare(a.name);
            return 0;
        });
    const leafCategoryIds = new Set(categories.map((candidate) => candidate.parent?.id).filter(Boolean));
    const selectableCategories = categories.filter((category) => !leafCategoryIds.has(category.id));

    if (loading) {
        return <Spinner fullPage />;
    }

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>{searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}</h1>
                    <p>{searchQuery && sortedProducts.length > 0 ? `Found ${sortedProducts.length} results` : 'Browse our complete catalog'}</p>
                </div>

                <div className="products-toolbar">
                    <select value={categoryId} onChange={(e) => updateFilter('category', e.target.value)}>
                        <option value="">All Categories</option>
                        {selectableCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.parent ? `${category.parent.name} / ${category.name}` : category.name}
                            </option>
                        ))}
                    </select>
                    <select value={sort} onChange={(e) => updateFilter('sort', e.target.value)}>
                        <option value="featured">Featured</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="name-asc">Name: A-Z</option>
                        <option value="name-desc">Name: Z-A</option>
                    </select>
                </div>

                {sortedProducts.length === 0 ? (
                    <div className="empty-state">
                        <h2>No products found</h2>
                        <p>{searchQuery ? 'Try adjusting your search terms' : 'Check back later for new products'}</p>
                    </div>
                ) : (
                    <div className="grid grid-4">
                        {sortedProducts.map(product => (
                            <div key={product.id} className="product-card card">
                                <Link to={`/products/${product.id}`} className="product-image">
                                    <img
                                        src={product.images?.[0]?.imageUrl || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                    />
                                </Link>
                                <div className="product-info">
                                    <Link to={`/products/${product.id}`}>
                                        <h3>{product.name}</h3>
                                    </Link>
                                    <p className="product-price">${Number(product.price).toFixed(2)}</p>
                                    <p className="product-stock">
                                        {product.stockQuantity > 0 ?
                                            `${product.stockQuantity} in stock` :
                                            'Out of stock'
                                        }
                                    </p>
                                    <button
                                        className="btn btn-primary btn-add-cart"
                                        onClick={() => addToCart(product)}
                                        disabled={product.stockQuantity === 0}
                                    >
                                        <Plus size={18} />
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="btn btn-outline"
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Previous
                        </button>
                        <span className="page-info">Page {page + 1} of {totalPages}</span>
                        <button
                            className="btn btn-outline"
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Products;
