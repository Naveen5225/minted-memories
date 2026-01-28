# Authentication Setup Guide

## Environment Variables

Add to `backend/.env`:

```env
# JWT Secret (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Other existing variables...
DATABASE_URL=mysql://username:password@localhost:3306/mintedmemories
RAZORPAY_KEY_ID=...
RAZORPAY_KEY_SECRET=...
PORT=5001
```

## Authentication Flow

### User Authentication (Phone + OTP)

1. **Send OTP**
   - User enters phone number
   - Backend generates 6-digit OTP
   - OTP stored in memory (5 min expiration)
   - In development: OTP returned in response
   - In production: Send via SMS service

2. **Verify OTP**
   - User enters OTP
   - Backend verifies OTP
   - If new user: Requires name input
   - If existing user: Login directly
   - Returns JWT token

3. **JWT Token**
   - Stored in localStorage
   - Included in all API requests
   - Valid for 30 days

### Admin Authentication (Fixed Credentials)

- **Username**: `naveen_0417`
- **Password**: `Naveen@041709`
- Returns JWT token with admin role
- Valid for 24 hours

## Protected Routes

### User Routes (require user authentication):
- `POST /api/orders/create`
- `GET /api/orders/user`
- `POST /api/payment/create`
- `POST /api/payment/verify`

### Admin Routes (require admin authentication):
- `GET /api/admin/dashboard`
- `GET /api/orders/admin`
- `PATCH /api/orders/:id/status`

## Frontend Auth Flow

1. **Sign-In Popup**
   - Triggered when:
     - User clicks "Sign In" → "User"
     - User tries to place order (if not logged in)
   - Steps: Phone → OTP → Name (if new user)

2. **Admin Login**
   - Triggered when:
     - User clicks "Sign In" → "Admin"
   - Username + Password form

3. **Auth Context**
   - Manages user/admin state
   - Stores tokens in localStorage
   - Provides auth methods to components

## Order Placement Flow

1. User adds photos and proceeds to checkout
2. User fills address form
3. User selects payment mode
4. **Auth Check**: If not logged in → Show sign-in popup
5. After login → Continue with order placement
6. Order created with user ID linked

## Production Considerations

1. **OTP Service**: Integrate SMS service (Twilio, etc.)
2. **JWT Secret**: Use strong, random secret
3. **Token Expiration**: Adjust based on security needs
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: Add rate limiting for OTP requests
