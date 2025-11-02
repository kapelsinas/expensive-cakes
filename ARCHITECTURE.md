# System Architecture

## Overview

Multi-Provider Checkout Platform is a scalable e-commerce backend demonstrating clean architecture, SOLID principles, and extensible payment integration patterns.

## Core Components

### 1. Cart Module
**Responsibility**: Manage shopping cart state and item operations

**Key Features**:
- Auto-creation of cart and user
- Smart item quantity merging
- Real-time total calculation
- Status-based modification prevention
- Price snapshot at add-time

**Flow**:
```
User Request → CartController → CartService → CartRepository
                                      ↓
                               Cart + CartItems
```

---

### 2. Order Module
**Responsibility**: Transform carts into immutable orders

**Key Features**:
- **Transactional checkout** (all-or-nothing)
- Immutable `itemsSnapshot` (JSONB audit trail)
- Cart status locking (ACTIVE → CHECKED_OUT)
- Order lifecycle management

**Checkout Flow**:
```
1. Validate cart (active, not empty)
2. BEGIN TRANSACTION
   ├─ Create order with items snapshot
   ├─ Mark cart as CHECKED_OUT
   └─ COMMIT or ROLLBACK
3. Return order (status: AWAITING_PAYMENT)
```

---

### 3. Payment Module ⭐ **Core Architecture**

**Responsibility**: Multi-provider payment orchestration

#### Architecture Pattern: **Strategy + Factory**

```
┌─────────────────────────────────────────────────┐
│           PaymentService (Orchestrator)         │
│  - Initiate payments                            │
│  - Handle webhooks                              │
│  - Update order status                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│       PaymentProviderFactory (Factory)          │
│  Map<PaymentProvider, Provider Instance>        │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│      PaymentProvider (Abstract Strategy)        │
│  - createPaymentIntent()                        │
│  - handleWebhook()                              │
│  - verifyWebhookSignature()                     │
│  - getPaymentStatus()                           │
└──────────────────┬──────────────────────────────┘
                   │
         ┌─────────┴──────────┬──────────────┐
         │                    │              │
         ▼                    ▼              ▼
┌─────────────────┐  ┌──────────────┐  ┌──────────┐
│ StripeProvider  │  │ PayPalProvider│  │  Manual  │
│ - clientSecret  │  │ - redirectUrl │  │ - instant│
│ - pending       │  │ - requires    │  │ - approval│
└─────────────────┘  └──────────────┘  └──────────┘
```

---

## Payment Provider Comparison

| Provider | Flow Type | Status | Response | Use Case |
|----------|-----------|--------|----------|----------|
| **STRIPE** | Client-side confirmation | PENDING | `clientSecret` | Card payments, 3D Secure |
| **PAYPAL** | Redirect flow | REQUIRES_ACTION | `redirectUrl` | PayPal balance, guest checkout |
| **MANUAL** | Instant approval | COMPLETED | Immediate | Testing, manual verification |

---

## Provider Implementation Deep Dive

### Stripe Provider

**Payment Flow**:
1. Backend creates payment intent → returns `clientSecret`
2. Frontend uses Stripe.js with `clientSecret`
3. User completes payment (card details, 3DS)
4. Stripe sends webhook → `payment_intent.succeeded`
5. Backend updates order status → PAID

**Mock Behavior**:
- Generates fake payment intent ID (`pi_xxxx`)
- Returns PENDING status with clientSecret
- Webhook simulation for testing

**Production Integration**:
```typescript
// Replace mock with real Stripe SDK
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async createPaymentIntent(params) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(parseFloat(params.amount) * 100),
    currency: params.currency.toLowerCase(),
    metadata: { orderId: params.orderId },
  });
  
  return {
    externalId: paymentIntent.id,
    status: mapStripeStatus(paymentIntent.status),
    clientSecret: paymentIntent.client_secret,
    ...
  };
}
```

---

### PayPal Provider

**Payment Flow**:
1. Backend creates PayPal order → returns `redirectUrl`
2. User redirected to PayPal
3. User approves payment
4. PayPal redirects back with token
5. Webhook confirms payment → `PAYMENT.CAPTURE.COMPLETED`
6. Backend updates order → PAID

**Mock Behavior**:
- Generates fake PayPal order ID (`PAYPAL-xxx`)
- Returns REQUIRES_ACTION with sandbox URL
- Simulates approve/capture flow

**Production Integration**:
```typescript
// Replace with PayPal SDK
import paypal from '@paypal/checkout-server-sdk';

async createPaymentIntent(params) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: params.currency,
        value: params.amount,
      },
    }],
  });
  
  const order = await client.execute(request);
  const approveLink = order.result.links.find(
    link => link.rel === 'approve'
  );
  
  return {
    externalId: order.result.id,
    status: PaymentStatus.REQUIRES_ACTION,
    redirectUrl: approveLink.href,
    ...
  };
}
```

---

### Manual Provider

**Purpose**: Testing, admin approval, bank transfers

**Flow**:
- Instant approval (no external provider)
- Useful for:
  - Development/testing
  - Manual order verification
  - Bank transfer confirmations
  - Admin-initiated payments

---

## Adding New Providers

### Example: Adding Adyen Provider

#### Step 1: Create Provider Class
```typescript
// src/modules/payment/providers/adyen-payment.provider.ts
@Injectable()
export class AdyenPaymentProvider extends PaymentProvider {
  readonly providerName = PaymentProviderEnum.ADYEN;
  
  async createPaymentIntent(params: CreatePaymentParams) {
    // Adyen-specific logic
    const response = await adyenClient.checkout.payments({
      amount: { value: params.amount, currency: params.currency },
      reference: params.orderId,
      // ...
    });
    
    return {
      externalId: response.pspReference,
      status: mapAdyenStatus(response.resultCode),
      // ...
    };
  }
  
  async handleWebhook(payload: any) {
    // Adyen webhook logic
  }
  
  // Implement other required methods...
}
```

#### Step 2: Add to Factory
```typescript
// payment.module.ts
@Module({
  providers: [
    // ... existing providers
    AdyenPaymentProvider,
  ],
})

// payment-provider.factory.ts
constructor(
  // ... existing providers
  private readonly adyenProvider: AdyenPaymentProvider,
) {
  this.providers = new Map([
    // ... existing
    [PaymentProviderEnum.ADYEN, this.adyenProvider],
  ]);
}
```

#### Step 3: Add Enum Value
```typescript
// common/enums/payment-provider.enum.ts
export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PAYPAL = 'PAYPAL',
  MANUAL = 'MANUAL',
  ADYEN = 'ADYEN',  // Add new provider
}
```

**That's it!** No changes needed to:
- Controllers
- Services
- Existing providers
- Database schema

---

## Design Patterns

### 1. **Strategy Pattern**
Each provider implements `PaymentProvider` interface differently

**Benefits**:
- Runtime provider selection
- Easy to add/remove providers
- Isolated provider logic
- Testable in isolation

### 2. **Factory Pattern**
`PaymentProviderFactory` manages provider instances

**Benefits**:
- Centralized provider registration
- Dependency injection friendly
- Type-safe provider selection

### 3. **Repository Pattern**
TypeORM repositories abstract database operations

**Benefits**:
- Database agnostic
- Testable with mocks
- Transaction support

### 4. **Observer Pattern**
Webhooks notify system of external events

**Benefits**:
- Async payment confirmation
- Decoupled from provider
- Reliable status updates

---

## Database Schema

### Key Relationships
```
User (1) ──────< (M) Cart (1) ──────< (M) CartItem
  │                    │
  │                    │ (1:1)
  │                    ↓
  └──────< (M) Order (1) ──────< (M) Payment
```

### Design Decisions

#### Price Snapshots
- **CartItem.unitPrice**: Captured at add-time
- **Order.itemsSnapshot**: JSONB immutable copy
- **Why**: Protects against price changes, audit trail

#### Multiple Payments
- Order → Many Payments
- **Why**: Supports retries, refunds, partial payments

#### JSONB Fields
- **CartItem.metadata**: Product variants, custom data
- **Order.itemsSnapshot**: Full order history
- **Payment.rawResponse**: Provider debugging
- **Why**: Flexibility without schema changes

---

## Security Considerations

### Production Checklist

1. **Webhook Signature Verification**
   ```typescript
   // Currently mocked - implement real verification
   verifyWebhookSignature(signature: string, payload: string) {
     // Stripe example:
     return stripe.webhooks.constructEvent(
       payload, signature, webhookSecret
     );
   }
   ```

2. **Authentication/Authorization**
   - Current: Mock `@CurrentUser()` decorator
   - Production: JWT, OAuth, Session-based auth

3. **Rate Limiting**
   - Add `@nestjs/throttler` for payment endpoints

4. **Idempotency**
   - Add idempotency keys for payment creation
   - Prevent duplicate charges

5. **PCI Compliance**
   - Never store card details
   - Use tokenization (Stripe Elements, PayPal SDK)

---

## Extensibility Points

### Future Enhancements

1. **Discount System**
   - Add `Coupon` entity
   - Apply discounts at checkout
   - Store discount info in `Order.itemsSnapshot`

2. **Inventory Management**
   - Check stock before checkout
   - Reserve items during payment
   - Release on failure/timeout

3. **Multi-Currency**
   - Exchange rate table
   - Currency conversion service
   - Display prices in user currency

4. **Subscription Payments**
   - Recurring payment support
   - Subscription entity and lifecycle
   - Provider-specific subscription handling

5. **Partial Refunds**
   - Refund entity separate from Payment
   - Refund workflow
   - Provider refund API integration

6. **Payment Retry Logic**
   - Exponential backoff
   - Max retry configuration
   - Automatic payment method switching

---

## Testing Strategy

### Unit Tests
- **Service layer**: Mock repositories
- **Provider logic**: Test each provider independently
- **Factory**: Test provider selection

### Integration Tests
- **Full flow**: Cart → Order → Payment
- **Transaction rollback**: Test failure scenarios
- **Webhook handling**: Simulate provider callbacks

### E2E Tests
- **API endpoints**: Full request/response cycle
- **Multiple providers**: Test each provider flow
- **Error scenarios**: Invalid data, timeouts

---

## Performance Considerations

1. **Database Indexes**
   - `User.email` (unique)
   - `Cart.userId + status` (composite)
   - `Order.userId + createdAt` (composite)
   - `Payment.externalId` (fast webhook lookup)

2. **Caching** (future)
   - Redis for active carts
   - Product price caching
   - Exchange rates

3. **Async Processing** (future)
   - Queue payment webhooks
   - Background order processing
   - Email notifications

---

## Deployment

### Environment Variables
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nothink_checkout

# Providers (production)
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_SECRET=xxx

# App
NODE_ENV=production
PORT=3000
```

### Docker Deployment
```bash
docker-compose up -d
npm run migration:run
npm run start:prod
```

### Railway/Heroku Deployment
1. Add DATABASE_URL to env
2. Run migrations automatically on deploy
3. Enable webhooks with public URL

---

## Conclusion

This architecture demonstrates:
- ✅ Clean, maintainable code
- ✅ SOLID principles in practice
- ✅ Extensible design patterns
- ✅ Production-ready structure
- ✅ Multi-provider flexibility
- ✅ Transaction safety
- ✅ Audit trail capabilities

**Ready for scaling** to real payment providers with minimal code changes.

