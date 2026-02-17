import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, ShoppingCart, MessageSquare, ShieldCheck, Send } from 'lucide-react';
import api, { checkProductPurchase, submitReview } from '../services/api';
import './ProductDetail.css';

function ProductDetail({ addToCart }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProduct();
        checkPurchaseStatus();
    }, [id]);

    useEffect(() => {
        if (!loading && window.location.hash === '#reviews-section') {
            const element = document.getElementById('reviews-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [loading]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            // Handled globally
        } finally {
            setLoading(false);
        }
    };

    const checkPurchaseStatus = async () => {
        try {
            const purchased = await checkProductPurchase(id);
            setHasPurchased(purchased);
        } catch (error) {
            setHasPurchased(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await submitReview({
                productId: Number(id),
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            setReviewForm({ rating: 5, comment: '' });
            fetchProduct(); // Refresh reviews
            alert("Review submitted! Thank you for your feedback.");
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="container loading">Loading...</div>;
    if (!product) return <div className="container">Product not found</div>;

    const currentUser = JSON.parse(localStorage.getItem('user'));
    const alreadyReviewed = product.reviews?.some(r => r.user?.email && r.user?.email === currentUser?.email);

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="product-detail-layout">
                    <div className="product-images">
                        <div className="gallery-container">
                            {product.images?.length > 1 && (
                                <div className="image-thumbnails-sidebar">
                                    {product.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail-wrapper ${selectedImage === idx ? 'active' : ''}`}
                                            onClick={() => setSelectedImage(idx)}
                                        >
                                            <img
                                                src={img.imageUrl}
                                                alt={`${product.name} ${idx + 1}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="main-image">
                                <img
                                    src={product.images?.[selectedImage]?.imageUrl || 'https://via.placeholder.com/500'}
                                    alt={product.name}
                                    key={selectedImage} // Force re-animation on image change
                                />
                            </div>
                        </div>
                    </div>

                    <div className="product-details">
                        <h1>{product.name}</h1>

                        <div className="product-rating">
                            <div className="stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={20}
                                        fill={i < Math.round(product.averageRating || 0) ? '#fbbf24' : 'none'}
                                        color="#fbbf24"
                                    />
                                ))}
                            </div>
                            <span className="review-count">{product.reviews?.length || 0} reviews</span>
                        </div>

                        <div className="product-price">
                            ${product.price}
                        </div>

                        <p className="product-description">{product.description}</p>

                        <div className="product-stock">
                            {product.stockQuantity > 0 ? (
                                <span className="in-stock">✓ In Stock ({product.stockQuantity} available)</span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        <div className="product-actions">
                            <div className="quantity-selector">
                                <label>Quantity:</label>
                                <input
                                    type="number"
                                    min="1"
                                    max={product.stockQuantity}
                                    value={quantity}
                                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-large"
                                onClick={() => addToCart(product, quantity)}
                                disabled={product.stockQuantity === 0}
                            >
                                <ShoppingCart size={20} />
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                <div className="product-extra-info" id="reviews-section">
                    <div className="reviews-section">
                        <div className="section-header">
                            <h2>Customer Reviews</h2>
                            {hasPurchased && !alreadyReviewed && (
                                <span className="verified-badge">
                                    <ShieldCheck size={16} /> Verified Purchaser
                                </span>
                            )}
                        </div>

                        {hasPurchased && !alreadyReviewed && (
                            <div className="review-form-card card">
                                <h3>Leave a Review</h3>
                                <form onSubmit={handleReviewSubmit}>
                                    <div className="rating-selector">
                                        <span>Your Rating:</span>
                                        <div className="stars">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    className="star-btn"
                                                >
                                                    <Star
                                                        size={24}
                                                        fill={star <= reviewForm.rating ? '#fbbf24' : 'none'}
                                                        color="#fbbf24"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <textarea
                                            placeholder="Write your review here..."
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            required
                                            rows="4"
                                        ></textarea>
                                    </div>
                                    {error && <div className="error-message">{error}</div>}
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : (
                                            <>
                                                <Send size={18} /> Submit Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="reviews-list">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review) => (
                                    <div key={review.id} className="review-item card">
                                        <div className="review-header">
                                            <div className="reviewer-info">
                                                <strong>{review.user?.firstName} {review.user?.lastName?.charAt(0)}.</strong>
                                                {review.verifiedPurchase && (
                                                    <span className="verified-text">
                                                        <ShieldCheck size={12} /> Verified Purchase
                                                    </span>
                                                )}
                                            </div>
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
                                        <p className="review-comment">{review.comment}</p>
                                        <span className="review-date">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-reviews">
                                    <MessageSquare size={48} />
                                    <p>No reviews yet. Be the first to review this product!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail;
