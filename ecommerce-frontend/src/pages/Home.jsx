import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, TrendingUp, Shield } from 'lucide-react';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <section className="hero">
                <div className="container">
                    <div className="hero-layout">
                        <div className="hero-content">
                            <span className="hero-kicker">Smart shopping, faster delivery</span>
                            <h1 className="hero-title">
                                Premium Products,
                                <br />
                                <span className="gradient-text">Delivered Fast</span>
                            </h1>
                            <p className="hero-subtitle">
                                Discover curated essentials with trustworthy pricing, secure checkout,
                                and smooth order tracking from cart to doorstep.
                            </p>
                            <div className="hero-buttons">
                                <Link to="/login" className="btn btn-primary btn-large">
                                    Shop Now <ArrowRight size={20} />
                                </Link>
                                <Link to="/products" className="btn btn-outline btn-large">
                                    Browse Catalog
                                </Link>
                            </div>
                            <div className="hero-highlights">
                                <span>24h dispatch</span>
                                <span>Secure payments</span>
                                <span>Easy returns</span>
                            </div>
                        </div>

                        <div className="hero-panel card">
                            <h3>Today on ShopHub</h3>
                            <div className="hero-panel-row">
                                <strong>980+</strong>
                                <span>Active products</span>
                            </div>
                            <div className="hero-panel-row">
                                <strong>4.9/5</strong>
                                <span>Average rating</span>
                            </div>
                            <div className="hero-panel-row">
                                <strong>99.2%</strong>
                                <span>Order success rate</span>
                            </div>
                            <Link to="/products" className="btn btn-secondary btn-large hero-panel-btn">
                                Explore Deals
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="features">
                <div className="container">
                    <div className="grid grid-3">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <ShoppingBag size={32} />
                            </div>
                            <h3>Wide Selection</h3>
                            <p>Thousands of products across multiple categories</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <TrendingUp size={32} />
                            </div>
                            <h3>Best Prices</h3>
                            <p>Competitive pricing with regular discounts and offers</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield size={32} />
                            </div>
                            <h3>Secure Payment</h3>
                            <p>Stripe and M-Pesa integration for safe transactions</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="cta">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Start Shopping?</h2>
                        <p>Join thousands of satisfied customers today</p>
                        <Link to="/register" className="btn btn-secondary btn-large">
                            Create Account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;
