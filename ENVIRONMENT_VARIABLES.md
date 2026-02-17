# E-Commerce Platform - Environment Variables

## Required Environment Variables

### Database Configuration
```bash
DB_PASSWORD=your_secure_database_password
```

### Security
```bash
# CRITICAL: Must be at least 32 characters, use a secure random string
# Generate with: openssl rand -base64 32
JWT_SECRET=your-secure-256-bit-secret-key-here
```

### Payment Providers

#### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

#### M-Pesa (Optional)
```bash
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
MPESA_ENVIRONMENT=sandbox  # or 'production'
```

### CORS Configuration (Optional)
```bash
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com
```

## Setting Environment Variables

### Windows (PowerShell)
```powershell
$env:JWT_SECRET="your-secret-here"
$env:DB_PASSWORD="your-password"
# ... etc
```

### Windows (Command Prompt)
```cmd
set JWT_SECRET=your-secret-here
set DB_PASSWORD=your-password
```

### Linux/Mac
```bash
export JWT_SECRET="your-secret-here"
export DB_PASSWORD="your-password"
```

### Using .env file (Development Only)
Create a `.env` file in the backend root (already in .gitignore):
```
JWT_SECRET=your-secret-here
DB_PASSWORD=your-password
STRIPE_SECRET_KEY=sk_test_...
```

**⚠️ NEVER commit .env files to version control!**

## Validation

The application will validate critical environment variables on startup:
- **JWT_SECRET**: Must be set and at least 32 characters
- **Stripe/M-Pesa**: Will warn if not configured (non-blocking)

If validation fails, the application will not start.
