# Entity Relationship Diagram

## Overview

This document describes the database schema and entity relationships for the Multi-Provider Checkout Platform.

## Entities

### User
- Primary entity representing a customer
- **Fields**: id (UUID), email (unique), displayName, createdAt, updatedAt
- **Relationships**:
  - One-to-Many with Cart (a user can have multiple carts over time)
  - One-to-Many with Order (a user can have multiple orders)

### Cart
- Represents a shopping cart (temporary state before checkout)
- **Fields**: id (UUID), status, currency, subtotal, total, createdAt, updatedAt
- **Relationships**:
  - Many-to-One with User (each cart belongs to one user)
  - One-to-Many with CartItem (cart contains multiple items)
  - One-to-One with Order (optional, set after checkout)
- **Lifecycle**: ACTIVE → CHECKED_OUT (or ABANDONED)

### CartItem
- Individual items within a cart with pricing snapshot
- **Fields**: id (UUID), productId, name, quantity, unitPrice, subtotal, currency, metadata (JSONB), createdAt, updatedAt
- **Relationships**:
  - Many-to-One with Cart (each item belongs to one cart)
- **Design Note**: Captures price at add-time for consistency

### Order
- Immutable record created from a cart upon checkout
- **Fields**: id (UUID), status, preferredPaymentProvider, totalAmount, subtotal, currency, itemsSnapshot (JSONB), createdAt, updatedAt
- **Relationships**:
  - Many-to-One with User (each order belongs to one user)
  - One-to-One with Cart (references the source cart)
  - One-to-Many with Payment (multiple payment attempts possible)
- **Lifecycle**: PENDING → AWAITING_PAYMENT → PAID (or FAILED/CANCELLED)
- **Design Note**: `itemsSnapshot` stores immutable copy of cart items as JSONB for audit trail

### Payment
- Tracks payment attempts with provider-specific data
- **Fields**: id (UUID), provider, status, amount, currency, externalId, metadata (JSONB), rawResponse (JSONB), createdAt, updatedAt
- **Relationships**:
  - Many-to-One with Order (each payment belongs to one order)
- **Design Note**: 
  - `externalId`: Provider's transaction ID (e.g., Stripe payment intent ID)
  - `rawResponse`: Full provider response for debugging/auditing
  - `metadata`: Additional provider-specific data

## Relationship Flow

```
User (1) ──────< (M) Cart (1) ──────< (M) CartItem
  │                    │
  │                    │ (1:1 after checkout)
  │                    ↓
  └──────< (M) Order (1) ──────< (M) Payment
```

## Key Design Decisions

### 1. Price Snapshots
- **CartItem** captures `unitPrice` and `subtotal` at add-time
- **Order** stores complete `itemsSnapshot` as JSONB
- **Rationale**: Protects against price changes, provides audit trail

### 2. Multiple Payment Attempts
- Order can have multiple Payment records
- **Rationale**: Supports retry logic, payment method changes, refunds

### 3. Soft Cart-Order Relationship
- Cart has optional reference to Order (set after checkout)
- Order has required reference to Cart (source of truth)
- **Rationale**: Maintains cart state for reference while order is independent

### 4. Currency Flexibility
- Currency stored at multiple levels (Cart, CartItem, Order, Payment)
- **Rationale**: Future support for multi-currency carts, currency conversion

### 5. JSONB Fields
- `CartItem.metadata`: Product variants, options, custom data
- `Order.itemsSnapshot`: Immutable order history
- `Payment.metadata`: Provider-specific context
- `Payment.rawResponse`: Full webhook/API response for debugging

## Database Constraints

### Cascading Deletes
- User deletion → cascades to Carts and Orders
- Cart deletion → cascades to CartItems
- Order deletion → cascades to Payments

### Unique Constraints
- User.email (unique index)

### Enums
- `CartStatus`: ACTIVE, CHECKED_OUT, ABANDONED
- `OrderStatus`: PENDING, AWAITING_PAYMENT, PAID, CANCELLED, FAILED
- `PaymentStatus`: PENDING, REQUIRES_ACTION, COMPLETED, FAILED, REFUNDED
- `PaymentProvider`: STRIPE, PAYPAL, MANUAL
- `Currency`: EUR, USD, GBP

## Future Considerations

### Potential Extensions
1. **Product Entity**: Currently uses `productId` string reference
2. **Discount/Coupon System**: Add promotion entities and relationships
3. **Shipping Address**: Extend Order with delivery information
4. **Inventory Tracking**: Add stock management and reservation
5. **Multi-Currency Rates**: Add exchange rate tracking table
6. **Refund Entity**: Separate entity for refund records instead of Payment status

