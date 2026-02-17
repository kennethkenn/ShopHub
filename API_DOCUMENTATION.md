# E-Commerce Backend API Documentation

## Base URL
`http://localhost:8080/api`

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
```
POST /auth/register
POST /auth/login
```

### Products (Public)
```
GET /products?page=0&size=20
GET /products/{id}
GET /products/category/{categoryId}
GET /products/search?query=phone
```

### Orders (Protected)
```
POST /orders - Create order with payment
GET /orders - Get user's orders
GET /orders/{id} - Get order details
```

### Admin - Products
```
POST /admin/products
PUT /admin/products/{id}
DELETE /admin/products/{id}
```

### Admin - Inventory
```
GET /admin/inventory/low-stock?threshold=10
PUT /admin/inventory/{productId}?quantity=100&reason=Restock
```

### Admin - Orders
```
GET /admin/orders
PUT /admin/orders/{id}/status?status=SHIPPED
```

### Payment Callbacks
```
POST /payments/mpesa/callback - M-Pesa callback
```

## Payment Flow

### Stripe
1. Create order with `paymentProvider: "STRIPE"`
2. Receive `clientSecret` in response
3. Use Stripe.js on frontend to complete payment
4. Payment status auto-updates

### M-Pesa
1. Create order with `paymentProvider: "MPESA"` and `phoneNumber`
2. STK Push sent to phone
3. User enters PIN
4. Callback updates payment status

## Sample Requests

### Register
```json
POST /auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+254700000000"
}
```

### Create Order
```json
POST /orders
{
  "items": [
    {"productId": 1, "quantity": 2},
    {"productId": 3, "quantity": 1}
  ],
  "shippingAddress": "123 Main St",
  "shippingCity": "Nairobi",
  "shippingPostalCode": "00100",
  "shippingCountry": "Kenya",
  "paymentProvider": "MPESA",
  "phoneNumber": "+254700000000"
}
```
