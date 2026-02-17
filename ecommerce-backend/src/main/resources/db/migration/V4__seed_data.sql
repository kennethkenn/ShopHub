-- Add sample categories
INSERT INTO categories (name, description, parent_id) VALUES
    ('Electronics', 'Electronic devices and accessories', NULL),
    ('Clothing', 'Fashion and apparel', NULL),
    ('Home & Garden', 'Home improvement and garden supplies', NULL),
    ('Sports & Outdoors', 'Sports equipment and outdoor gear', NULL),
    ('Books', 'Books and reading materials', NULL);

-- Add sub-categories
INSERT INTO categories (name, description, parent_id) VALUES
    ('Smartphones', 'Mobile phones and accessories', 1),
    ('Laptops', 'Laptop computers and accessories', 1),
    ('Men''s Clothing', 'Clothing for men', 2),
    ('Women''s Clothing', 'Clothing for women', 2);

-- Add sample products
INSERT INTO products (name, description, price, stock_quantity, category_id, active) VALUES
    ('iPhone 15 Pro', 'Latest iPhone with advanced camera system and A17 chip', 999.99, 50, 6, TRUE),
    ('Samsung Galaxy S24', 'Premium Android smartphone with AI features', 899.99, 45, 6, TRUE),
    ('MacBook Pro 14"', 'Powerful laptop for professionals with M3 chip', 1999.99, 30, 7, TRUE),
    ('Dell XPS 15', 'High-performance Windows laptop', 1599.99, 25, 7, TRUE),
    ('Men''s Cotton T-Shirt', 'Comfortable cotton t-shirt in multiple colors', 29.99, 200, 8, TRUE),
    ('Women''s Summer Dress', 'Elegant summer dress for any occasion', 59.99, 150, 9, TRUE),
    ('Running Shoes', 'Professional running shoes with excellent cushioning', 89.99, 100, 4, TRUE),
    ('Yoga Mat', 'Non-slip yoga mat for home workouts', 34.99, 80, 4, TRUE);

-- Add product images
INSERT INTO product_images (product_id, image_url, is_primary, display_order) VALUES
    (1, 'https://via.placeholder.com/400x400?text=iPhone+15+Pro', TRUE, 1),
    (2, 'https://via.placeholder.com/400x400?text=Galaxy+S24', TRUE, 1),
    (3, 'https://via.placeholder.com/400x400?text=MacBook+Pro', TRUE, 1),
    (4, 'https://via.placeholder.com/400x400?text=Dell+XPS+15', TRUE, 1),
    (5, 'https://via.placeholder.com/400x400?text=Cotton+T-Shirt', TRUE, 1),
    (6, 'https://via.placeholder.com/400x400?text=Summer+Dress', TRUE, 1),
    (7, 'https://via.placeholder.com/400x400?text=Running+Shoes', TRUE, 1),
    (8, 'https://via.placeholder.com/400x400?text=Yoga+Mat', TRUE, 1);

-- Add demo admin user (password: admin123 - BCrypt hashed)
INSERT INTO users (email, password, first_name, last_name, phone, role, enabled) VALUES
    ('admin@ecommerce.com', '$2a$10$MqqLUv2Es9U8XDAHhx/WLu0oyvJNb5u./e.DJUtxFlDsKN3InoZYC', 'Admin', 'User', '+254700000000', 'SUPER_ADMIN', TRUE),
    ('demo@example.com', '$2a$10$MqqLUv2Es9U8XDAHhx/WLu0oyvJNb5u./e.DJUtxFlDsKN3InoZYC', 'Demo', 'Customer', '+254700000001', 'CUSTOMER', TRUE);
