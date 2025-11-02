<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

**Multi-Provider Checkout Platform** - A production-ready cart, order, and payment system showcasing clean architecture, SOLID principles, and extensible payment integration patterns using Strategy and Factory design patterns.

### 🎯 Project Purpose

This project demonstrates a **technical interview-level implementation** of a scalable e-commerce backend, with special focus on **multi-provider payment architecture** - a common real-world challenge.

### ✨ Key Features

**1. Cart Management**
- Auto-creation of carts and users
- Smart quantity merging for duplicate items
- Real-time total calculation
- Status-based modification prevention
- Price snapshots at add-time

**2. Order Processing**
- **Transactional checkout** with rollback support
- Immutable order snapshots (JSONB audit trail)
- Cart lifecycle management (ACTIVE → CHECKED_OUT)
- Order status flow (PENDING → AWAITING_PAYMENT → PAID)

**3. Multi-Provider Payment System** ⭐
- **Strategy Pattern**: Pluggable payment providers
- **Factory Pattern**: Dynamic provider selection
- **Webhook Handling**: Async payment confirmations
- **Multiple Attempts**: Retry and fallback support
- **Audit Trail**: Complete payment history with raw responses

**Supported Providers**:
- **Stripe**: Client-side flow with `clientSecret`
- **PayPal**: Redirect flow with approval URL
- **Manual**: Instant approval for testing/admin

### 🏗️ Architecture

```
┌──────────────┐
│     Cart     │ → Add items, calculate totals
└──────┬───────┘
       │ checkout (transactional)
       ↓
┌──────────────┐
│    Order     │ → Immutable snapshot, AWAITING_PAYMENT
└──────┬───────┘
       │ initiate payment
       ↓
┌──────────────┐
│   Payment    │ → Provider selection via Factory
└──────┬───────┘
       │
       ├─→ Stripe (clientSecret)
       ├─→ PayPal (redirectUrl)
       └─→ Manual (instant)
```

For detailed architecture documentation, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**

### 💡 Technical Highlights

- **SOLID Principles**: Single Responsibility, Open/Closed, Dependency Injection
- **Design Patterns**: Strategy, Factory, Repository, Observer (webhooks)
- **Transaction Safety**: Database transactions for checkout integrity
- **Zod Validation**: Type-safe request validation
- **Swagger Documentation**: Interactive API explorer at `/api/docs`
- **Docker Support**: One-command environment setup
- **TypeScript Strict Mode**: Full type safety
- **E2E Tests**: Complete flow testing

### 🛠️ Tech Stack

- **Framework**: NestJS 11 with TypeScript
- **Database**: PostgreSQL 16 with TypeORM
- **Validation**: Zod schemas with `@anatine/zod-nestjs`
- **API Docs**: Swagger/OpenAPI
- **Containerization**: Docker & docker-compose
- **Testing**: Jest with E2E tests

### 📊 Database Schema

```
User (1) ──────< (M) Cart (1) ──────< (M) CartItem
  │                    │
  │                    │ (1:1)
  │                    ↓
  └──────< (M) Order (1) ──────< (M) Payment
```

**Key Design Decisions**:
- UUID primary keys for all entities
- JSONB for flexible metadata and snapshots
- Multiple payment attempts per order
- Price snapshots for audit trails

See **[docs/ENTITY_RELATIONSHIPS.md](./docs/ENTITY_RELATIONSHIPS.md)** for detailed schema documentation

## Quick Start

Get up and running in 5 simple steps:

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
- **API**: `http://localhost:3000/cart`, `/orders`, `/payments`

### Docker Setup

The project includes `docker-compose.yml` with PostgreSQL 16. To manage the database:

```bash
# Start database (runs in background)
npm run docker:up

# Stop database
npm run docker:down

# View database logs
npm run docker:logs
```

The database is accessible at `localhost:5433` (check `docker-compose.yml` for port mapping).

## Project Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker & Docker Compose** (recommended) or PostgreSQL installed locally

### 1. Clone and Install Dependencies

```bash
$ npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (use `env.example` as template):

```bash
# Copy the example file
$ cp env.example .env
```

The default configuration works with the Docker setup below. Update if using a custom PostgreSQL instance.

### 3. Start the Database

#### Option A: Using Docker (Recommended)

Start PostgreSQL with Docker Compose:

```bash
# Start the database in detached mode
$ docker-compose up -d

# Check database is running
$ docker-compose ps
```

To stop the database:

```bash
$ docker-compose down

# To stop and remove data volumes
$ docker-compose down -v
```

#### Option B: Using Local PostgreSQL

If you have PostgreSQL installed locally, create a database:

```sql
CREATE DATABASE nothink_checkout;
```

Update your `.env` file with your local PostgreSQL credentials.

### 4. Run Migrations

Once the database is running, apply migrations:

```bash
# Run pending migrations
$ npm run migration:run
```

### 5. Helpful Commands

```bash
# Docker management
$ npm run docker:up          # Start database
$ npm run docker:down        # Stop database
$ npm run docker:logs        # View database logs

# Database migrations
$ npm run migration:generate # Generate new migration from entity changes
$ npm run migration:create   # Create empty migration file
$ npm run migration:run      # Run pending migrations
$ npm run migration:revert   # Revert last migration
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests (includes full checkout flow)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

---

## 🚀 API Usage Examples

### Complete Checkout Flow

#### 1. Add Items to Cart

```bash
# Add first item
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "laptop-001",
    "name": "Gaming Laptop",
    "quantity": 1,
    "unitPrice": "1299.99",
    "currency": "EUR"
  }'

# Add second item with metadata
curl -X POST http://localhost:3000/cart/items \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "mouse-002",
    "name": "Wireless Mouse",
    "quantity": 2,
    "unitPrice": "49.99",
    "currency": "EUR",
    "metadata": {
      "color": "black",
      "warranty": "2years"
    }
  }'
```

#### 2. View Cart

```bash
curl http://localhost:3000/cart
```

#### 3. Update Item Quantity

```bash
# Replace {itemId} with actual UUID from cart response
curl -X PATCH http://localhost:3000/cart/items/{itemId} \
  -H "Content-Type: application/json" \
  -d '{"quantity": 5}'
```

#### 4. Checkout (Create Order)

```bash
curl -X POST http://localhost:3000/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "preferredPaymentProvider": "STRIPE"
  }'
```

**Save the `id` from response as `{orderId}`**

---

### Payment Provider Examples

#### Option A: Stripe Payment Flow

**Step 1: Initiate Stripe Payment**
```bash
curl -X POST http://localhost:3000/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "provider": "STRIPE"
  }'
```

**Response includes:**
- `clientSecret`: Use with Stripe.js on frontend
- `externalId`: Payment intent ID
- `status`: PENDING (awaiting confirmation)

**Step 2: Simulate Stripe Webhook (Success)**
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

**Step 3: Verify Order is Paid**
```bash
curl http://localhost:3000/orders/{orderId}
# status should be "PAID"
```

---

#### Option B: PayPal Payment Flow

**Step 1: Initiate PayPal Payment**
```bash
curl -X POST http://localhost:3000/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "provider": "PAYPAL"
  }'
```

**Response includes:**
- `redirectUrl`: URL to redirect user for PayPal approval
- `externalId`: PayPal order ID
- `status`: REQUIRES_ACTION

**Step 2: Simulate PayPal Webhook (Approved)**
```bash
curl -X POST http://localhost:3000/payments/webhook/paypal \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test-signature" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "PAYPAL-XXX",
      "status": "COMPLETED",
      "amount": {"value": "1299.99"}
    }
  }'
```

---

#### Option C: Manual Payment (Instant)

**For Testing/Admin Approval**
```bash
curl -X POST http://localhost:3000/payments/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "{orderId}",
    "provider": "MANUAL"
  }'
```

**Response**: Instant COMPLETED status, order automatically marked as PAID

---

### Additional Operations

**View All Orders**
```bash
curl http://localhost:3000/orders
```

**View Payment History**
```bash
curl http://localhost:3000/payments/order/{orderId}
```

**Remove Cart Item**
```bash
curl -X DELETE http://localhost:3000/cart/items/{itemId}
```

**Clear Cart**
```bash
curl -X DELETE http://localhost:3000/cart
```

---

## 📖 API Documentation

Interactive Swagger documentation available at:
```
http://localhost:3000/api/docs
```

Features:
- Try-it-out functionality for all endpoints
- Request/response schemas
- Validation examples
- Provider-specific flow documentation

---

## 🎯 Payment Provider Comparison

| Provider | Flow Type | Initial Status | Response Fields | Use Case |
|----------|-----------|----------------|-----------------|----------|
| **STRIPE** | Client-side | PENDING | `clientSecret` | Card payments, 3D Secure |
| **PAYPAL** | Redirect | REQUIRES_ACTION | `redirectUrl` | PayPal balance, guest |
| **MANUAL** | Instant | COMPLETED | - | Testing, admin approval |

### How Each Provider Works

**Stripe**:
1. Backend creates payment intent → `clientSecret`
2. Frontend uses Stripe.js to collect payment
3. Webhook confirms success → Order marked PAID

**PayPal**:
1. Backend creates PayPal order → `redirectUrl`
2. User redirected to PayPal for approval
3. Webhook confirms capture → Order marked PAID

**Manual**:
1. Backend instantly approves payment
2. Order immediately marked PAID
3. Useful for bank transfers, admin orders

---

## 🏗️ Adding New Payment Providers

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed guide on adding providers like Adyen, Square, etc.

**Summary**:
1. Create provider class extending `PaymentProvider`
2. Implement 4 required methods
3. Register in `PaymentProviderFactory`
4. Add to enum

**No changes needed** to controllers, services, or database!

---

## 📝 What Was Implemented

This project delivers a complete **cart-to-order-to-payment** flow with multi-provider payment architecture:

### Core Functionality
- ✅ **Cart Management**: Add, update quantity, remove items with automatic total calculation
- ✅ **Checkout Flow**: Transactional cart-to-order conversion with immutable item snapshots
- ✅ **Order Management**: Status tracking (AWAITING_PAYMENT → PAID/FAILED), order history
- ✅ **Payment Processing**: Three payment providers (Stripe, PayPal, Manual) with Strategy pattern
- ✅ **Webhook Handling**: Async payment confirmations from providers
- ✅ **Payment History**: Track multiple payment attempts per order

### Architecture Highlights
- ✅ **Strategy Pattern**: Pluggable payment providers via abstract interface
- ✅ **Factory Pattern**: Dynamic provider selection at runtime
- ✅ **SOLID Principles**: Clear separation of concerns, dependency injection
- ✅ **Transaction Safety**: Database transactions ensure checkout integrity
- ✅ **Audit Trail**: Immutable order snapshots and complete payment records

### Developer Experience
- ✅ **Swagger Documentation**: Interactive API explorer with request examples
- ✅ **E2E Tests**: Full flow testing (21 test cases covering cart → order → payment)
- ✅ **Demo UI**: Vanilla HTML/JS frontend demonstrating complete flow
- ✅ **Type Safety**: Full TypeScript with Zod validation
- ✅ **Docker Setup**: One-command database environment

### Technical Implementation
- ✅ **Database Schema**: PostgreSQL with UUIDs, JSONB for flexibility
- ✅ **API Endpoints**: RESTful design with proper HTTP status codes
- ✅ **Error Handling**: User-friendly error messages with validation
- ✅ **Code Quality**: ESLint, Prettier, consistent code style

---

## 🚀 Future Features

### Planned Enhancements

**1. Discount & Promotion System**
- Discount codes with validation rules (percentage, fixed amount, free shipping)
- Automatic discount application at checkout
- Discount usage limits and expiration dates
- Promotion campaigns (buy X get Y, seasonal sales)

**2. Product Catalog Integration**
- Product entity with inventory management
- Stock reservation during checkout
- Product variants (size, color, etc.)
- Product recommendations and cross-sell

**3. Advanced Order Management**
- Order cancellation with refund processing
- Partial refunds and exchanges
- Order status notifications (email, SMS)
- Shipping address and delivery tracking

**4. Payment Enhancements**
- Additional providers (Adyen, Square, Klarna, Apple Pay, Google Pay)
- Saved payment methods for returning customers
- Split payments (multiple methods per order)
- Subscription/recurring payments

**5. User & Authentication**
- JWT-based authentication
- User profiles and preferences
- Order history and favorites
- Guest checkout option

**6. Analytics & Reporting**
- Order analytics dashboard
- Payment provider performance metrics
- Revenue reports by provider
- Cart abandonment tracking

**7. Multi-Currency Support**
- Real-time exchange rate conversion
- Currency preference per user
- Multi-currency cart support

**8. Inventory Management**
- Stock level tracking
- Low stock alerts
- Reserved inventory during checkout
- Backorder handling

---

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
