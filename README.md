<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

**Multi-Provider Checkout Platform** - A production-ready cart, order, and payment system demonstrating clean architecture, SOLID principles, and extensible payment integration using Strategy and Factory design patterns.

### 🎯 Project Purpose

Technical interview demonstration of a scalable e-commerce backend focusing on **multi-provider payment architecture** - a common real-world challenge.

---

## ✨ What Was Implemented

### Core Features

**1. Shopping Cart**
- Add, update quantity, and remove items
- Automatic total calculation
- Prevents duplicate items (merges quantities)
- Price snapshots (captures price when item is added)

**2. Checkout & Orders**
- **Checkout Process**: When user checks out, cart is converted to an order atomically (all-or-nothing). If anything fails, the entire operation rolls back.
- Orders store an immutable snapshot of cart items (even if prices change later)
- Order status tracking: `AWAITING_PAYMENT` → `PAID` or `FAILED`

**3. Multi-Provider Payment System** ⭐
- **How it works**: Payment providers (Stripe, PayPal, Manual) are implemented using the Strategy pattern - each provider has the same interface but different behavior
- **Factory Pattern**: The system automatically selects the right provider based on user choice
- **Webhooks**: Payment providers send async notifications when payment completes
- **Multiple attempts**: If one payment fails, user can try again with same or different provider
- **Complete audit trail**: Every payment attempt is stored with full provider response

**Supported Providers:**
- **Stripe**: Returns `clientSecret` for frontend payment form
- **PayPal**: Returns `redirectUrl` to send user to PayPal approval page
- **Manual**: Instant approval (useful for testing/admin overrides)

### Architecture Highlights

**Design Patterns:**
- **Strategy Pattern**: Each payment provider implements the same interface, making it easy to add new providers without changing existing code
- **Factory Pattern**: One factory class manages all providers, selecting the right one dynamically
- **Repository Pattern**: Database operations are abstracted through TypeORM repositories

**Why These Patterns?**
- **Strategy**: Lets you swap payment providers without touching business logic
- **Factory**: Centralizes provider selection - add new provider in one place

**Data Safety:**
- **Transactional Checkout**: Uses database transactions - either everything succeeds (cart becomes order, cart marked as checked out) or nothing happens (rollback prevents partial data)
- **Immutable Snapshots**: Order items are saved as JSONB snapshot - even if original product changes price, the order shows what was paid
- **UUIDs**: All IDs are UUIDs (not sequential numbers) - better for distributed systems

### Tech Stack

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL 16 with TypeORM
- **Validation**: Zod schemas
- **API Docs**: Swagger at `/api/docs`
- **Containerization**: Docker & docker-compose
- **Testing**: Jest with 21 E2E tests

### Database Schema

```
User (1) ──────< (M) Cart (1) ──────< (M) CartItem
  │                    │
  │                    │ (1:1 after checkout)
  │                    ↓
  └──────< (M) Order (1) ──────< (M) Payment
```

**Key Design Decisions:**
- UUID primary keys for all entities
- JSONB for flexible metadata and order snapshots
- Multiple payment attempts per order (retry support)
- Price snapshots at cart item level for audit trail

See **[docs/ENTITY_RELATIONSHIPS.md](./docs/ENTITY_RELATIONSHIPS.md)** for detailed schema documentation

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp env.example .env

# 3. Start PostgreSQL database with Docker
npm run docker:up

# 4. Run database migrations
npm run migration:run

# 5. Start the application
npm run start:dev
```

The application will be available at:
- **Main UI**: `http://localhost:3000` (demo frontend)
- **API Docs**: `http://localhost:3000/api/docs` (Swagger)

### Docker Commands

```bash
npm run docker:up          # Start database
npm run docker:down        # Stop database
npm run docker:logs        # View database logs
```

The database is accessible at `localhost:5433` (check `docker-compose.yml` for port mapping).

---

## 🚀 Future Enhancements

**1. Discount & Promotion System**
- Discount codes with percentage or fixed amount discounts
- Automatic application at checkout
- Usage limits and expiration dates

**2. Product Catalog**
- Product entity with inventory tracking
- Stock reservation during checkout
- Product variants (size, color, etc.)

**3. Advanced Payments**
- Additional providers (Apple Pay, Google Pay, Klarna)
- Saved payment methods for returning customers
- Split payments (combine multiple payment methods)

**4. User Features**
- JWT authentication
- User profiles and order history
- Guest checkout option

---

## 📖 API Usage Examples

### Complete Checkout Flow

#### 1. Add Items to Cart

```bash
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "laptop-001",
    "name": "Gaming Laptop",
    "quantity": 1,
    "unitPrice": "1299.99",
    "currency": "EUR"
  }'
```

#### 2. View Cart

```bash
curl http://localhost:3000/cart
```

#### 3. Checkout (Create Order)

```bash
curl -X POST http://localhost:3000/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{"preferredPaymentProvider": "STRIPE"}'
```

**Save the `id` from response as `{orderId}`**

#### 4. Initiate Payment

```bash
curl -X POST http://localhost:3000/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "provider": "STRIPE"
  }'
```

#### 5. Simulate Payment Webhook (Stripe)

```bash
curl -X POST http://localhost:3000/payments/webhook/stripe \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test-signature" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_xxx",
        "status": "succeeded",
        "amount": 129999
      }
    }
  }'
```

#### 6. Verify Order Status

```bash
curl http://localhost:3000/orders/{orderId}
# status should be "PAID"
```

---

## 🎯 Payment Provider Comparison

| Provider | Flow Type | Response | How It Works |
|---------|-----------|----------|--------------|
| **STRIPE** | Client-side | `clientSecret` | Frontend collects card details, backend confirms via webhook |
| **PAYPAL** | Redirect | `redirectUrl` | User redirected to PayPal, returns with approval, backend confirms via webhook |
| **MANUAL** | Instant | - | Immediate approval (for testing/admin) |

---

## 🏗️ Adding New Payment Providers

**How to add a new provider (e.g., Apple Pay):**

1. Create new file `src/modules/payment/providers/apple-pay.provider.ts`
2. Extend `PaymentProvider` abstract class
3. Implement 4 methods: `createPaymentIntent`, `handleWebhook`, `verifyWebhookSignature`, `getPaymentStatus`
4. Register in `PaymentProviderFactory`
5. Add to `PaymentProvider` enum

**No changes needed** to controllers, services, or database! This is the power of the Strategy pattern.

---

## 🧪 Testing

```bash
# Run E2E tests (full checkout flow)
npm run test:e2e

# Unit tests
npm run test

# Test coverage
npm run test:cov
```

---

## 📚 Additional Documentation

- **Entity Relationships**: See [docs/ENTITY_RELATIONSHIPS.md](./docs/ENTITY_RELATIONSHIPS.md)
- **API Documentation**: Interactive Swagger at `http://localhost:3000/api/docs`

---

## License

MIT licensed.
