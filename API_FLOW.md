# API Flow Documentation

## Complete Order Flow

### 1. User Selects Quantity
- User clicks +/- buttons on Home page
- Frontend calculates subtotal: `quantity × ₹100`
- User clicks "Order Now"

### 2. Address Collection
- Address form modal opens
- User fills in:
  - Full Name
  - Phone (10 digits)
  - House No/Flat
  - Village/Town
  - City
  - District
  - State
  - Pincode (6 digits)
- Frontend validates all fields
- User clicks "Proceed to Payment"

### 3. Payment Summary
- Payment summary modal shows:
  - Quantity
  - Subtotal
  - Delivery (₹50)
  - GST (3%)
  - Total amount
- User selects payment mode:
  - **COD**: Cash on Delivery
  - **ONLINE**: Razorpay payment

### 4. Order Creation

#### For COD:
```
POST /api/orders/create
Body: {
  quantity: 2,
  address: { fullName, phone, ... },
  paymentMode: "COD"
}

Response: {
  success: true,
  order: {
    id: "uuid",
    quantity: 2,
    totalAmount: 256.00,
    paymentMode: "COD",
    orderStatus: "ORDER_PLACED"
  }
}
```

Backend:
- Validates quantity (1-100)
- Validates address fields
- Validates phone (10 digits) and pincode (6 digits)
- Calculates pricing server-side:
  - Subtotal = quantity × 100
  - GST = subtotal × 0.03
  - Total = subtotal + 50 + GST
- Creates order in database
- Sets paymentStatus = "PENDING"
- Sets orderStatus = "ORDER_PLACED"

#### For Online Payment:
```
POST /api/orders/create
(Same as COD, but paymentMode: "ONLINE")

POST /api/payment/create
Body: {
  orderId: "uuid",
  amount: 25600  // in paise
}

Response: {
  success: true,
  orderId: "razorpay_order_id",
  amount: 25600,
  currency: "INR",
  key: "razorpay_key_id"
}
```

Backend:
- Validates order exists
- Validates amount matches order total
- Creates Razorpay order
- Creates payment record in database
- Returns Razorpay order details

### 5. Payment Processing (Online Only)

Frontend:
- Loads Razorpay checkout script
- Opens Razorpay payment modal
- User completes payment

Razorpay returns:
```javascript
{
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "..."
}
```

### 6. Payment Verification (Online Only)

```
POST /api/payment/verify
Body: {
  razorpay_order_id: "...",
  razorpay_payment_id: "...",
  razorpay_signature: "...",
  orderId: "uuid"
}

Response: {
  success: true,
  message: "Payment verified successfully",
  orderId: "uuid"
}
```

Backend:
- Fetches order from database
- Verifies Razorpay signature using HMAC SHA256
- Updates payment record:
  - razorpayPaymentId
  - razorpaySignature
  - status = "SUCCESS"
- Updates order:
  - paymentStatus = "PAID"

### 7. Order Confirmation

Frontend:
- Shows success message
- Redirects to Orders page after 3 seconds

## Orders Page Flow

### Fetching Orders

```
GET /api/orders

Response: {
  success: true,
  orders: [
    {
      id: "uuid",
      customerName: "John Doe",
      phone: "9876543210",
      quantity: 2,
      subtotal: 200.00,
      deliveryCharge: 50.00,
      gst: 6.00,
      totalAmount: 256.00,
      paymentMode: "COD",
      paymentStatus: "PENDING",
      orderStatus: "ORDER_PLACED",
      createdAt: "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

Backend:
- Fetches all orders from database
- Includes latest payment record
- Orders by createdAt (descending)
- Returns formatted order data

## Order Status Flow

1. **ORDER_PLACED** - Order created, awaiting processing
2. **PROCESSING** - Order is being prepared
3. **SHIPPED** - Order has been shipped
4. **DELIVERED** - Order delivered to customer

(Status updates would typically be done through admin panel - not implemented in this version)

## Payment Status

- **PENDING** - Payment not yet received (COD) or not verified (Online)
- **PAID** - Payment completed and verified
- **FAILED** - Payment failed or verification failed

## Error Handling

All endpoints return consistent error format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common errors:
- 400: Validation errors (invalid input)
- 404: Resource not found (order not found)
- 500: Server errors
- 503: Service unavailable (Razorpay not configured)

## Security Measures

1. **Amount Validation**: All amounts validated on backend
2. **Signature Verification**: Razorpay signatures verified using HMAC SHA256
3. **Input Validation**: All inputs validated and sanitized
4. **Quantity Limits**: Quantity must be 1-100
5. **Phone/Pincode Validation**: Strict format validation
6. **Database Constraints**: Enforced through Prisma schema
