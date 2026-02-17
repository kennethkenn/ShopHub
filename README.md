# E-Commerce Platform - Modern & Premium Shopping Experience

A full-stack, state-of-the-art e-commerce platform built with Spring Boot and React, featuring a high-contrast premium design system, real-time analytics, and integrated review management.

## 📸 Screenshots

````carousel
![Home Page - Hero Section](file:///d:/Projects/Ecommerce/screenshots/home.png)
<!-- slide -->
![Product Catalog](file:///d:/Projects/Ecommerce/screenshots/products.png)
<!-- slide -->
![Product Details - Gallery View](file:///d:/Projects/Ecommerce/screenshots/product_details.png)
<!-- slide -->
![Admin Dashboard - Real-time Stats](file:///d:/Projects/Ecommerce/screenshots/orders.png)
````

## ✨ Core Features

- 💎 **Premium UI**: Modern, glassmorphic design system with a curated high-contrast palette.
- 📊 **Real-time Admin Dashboard**: Advanced statistics, sales trends, and inventory tracking.
- 🛡️ **Review Management**: Moderated customer review system with verified purchase tracking.
- 🖼️ **Dynamic Gallery**: Responsive, side-by-side product image gallery with smooth transitions.
- 🔗 **Multilingual Payments**: Integrated support for Stripe and M-Pesa.
- 🚀 **Performance Optimized**: Lazy loading, unified API calls, and efficient state management.

## Quick Start

### Backend Setup
1. **Install PostgreSQL**
   ```bash
   # Create database
   CREATE DATABASE ecommerce_db;
   CREATE USER ecommerce_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE ecommerce_db TO ecommerce_user;
   ```

2. **Set Environment Variables**
   ```bash
   set DB_PASSWORD=your_password
   set JWT_SECRET=your-256-bit-secret-key-base64-encoded
   set STRIPE_SECRET_KEY=sk_test_your_stripe_key
   set MPESA_CONSUMER_KEY=your_mpesa_key
   set MPESA_CONSUMER_SECRET=your_mpesa_secret
   ```

3. **Run Backend**
   ```bash
   cd ecommerce-backend
   mvn spring-boot:run
   ```
   Backend starts on http://localhost:8080

### Frontend Setup
1. **Install Dependencies**
   ```bash
   cd ecommerce-frontend
   npm install
   ```

2. **Run Frontend**
   ```bash
   npm run dev
   ```
   Frontend starts on http://localhost:5173

## Default Credentials
- **Admin**: admin@ecommerce.com / admin123
- **Demo Customer**: demo@example.com / admin123

## Testing Checklist

### ✅ Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] JWT token stored
- [ ] Protected routes work

### ✅ Product Catalog
- [ ] View all products
- [ ] Product pagination
- [ ] Product detail view
- [ ] Add to cart

### ✅ Shopping Cart
- [ ] Add products
- [ ] Update quantities
- [ ] Remove items
- [ ] Cart persistence

### ✅ Checkout & Orders
- [ ] Complete checkout form
- [ ] Select payment method
- [ ] Create order
- [ ] View order history

### ✅ Admin Dashboard
- [ ] View statistics
- [ ] Access restricted to admins
- [ ] Quick actions work

## Project Structure
```
D:\Projects\Ecommerce\
├── ecommerce-backend\          # Spring Boot API
│   ├── src\main\java\com\ecommerce\
│   │   ├── model\              # JPA entities
│   │   ├── repository\         # Data access
│   │   ├── service\            # Business logic
│   │   ├── controller\         # REST endpoints
│   │   ├── security\           # JWT & auth
│   │   └── config\             # Configuration
│   └── src\main\resources\
│       ├── application.yml     # App config
│       └── db\migration\       # Flyway scripts
│
└── ecommerce-frontend\         # React UI
    ├── src\
    │   ├── components\         # Reusable components
    │   ├── pages\              # Route pages
    │   ├── services\           # API client
    │   └── App.jsx             # Main app
    └── package.json

```

## API Endpoints
See `API_DOCUMENTATION.md` for complete list.

## Next Steps
1. Configure real Stripe/M-Pesa credentials
2. Add product images
3. Test payment flows
4. Deploy to production
