# Minted Memories - Complete Project Overview

## 📁 Project Structure

```
FM/
├── backend/                    # Node.js/Express API Server
│   ├── server.js              # Main Express server (all routes)
│   ├── db.js                  # Prisma Client singleton
│   ├── .env                   # Environment variables
│   ├── package.json           # Backend dependencies
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── utils/
│   │   └── otp.js             # OTP generation & verification
│   └── prisma/
│       ├── schema.prisma      # Database schema definition
│       └── migrations/         # Database migration files
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── main.jsx           # React entry point
│   │   ├── App.jsx             # Router configuration
│   │   ├── index.css           # Global styles + Tailwind
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Orders.jsx
│   │   │   ├── Contact.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminOrders.jsx
│   │   ├── components/         # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── OrderSection.jsx
│   │   │   ├── AddressForm.jsx
│   │   │   ├── PaymentSummary.jsx
│   │   │   ├── SignInPopup.jsx
│   │   │   └── ...
│   │   └── context/            # React Context providers
│   │       ├── AuthContext.jsx # User/Admin auth state
│   │       └── CartContext.jsx # Shopping cart state
│   ├── public/                 # Static assets
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies
│
└── Documentation files (README, SETUP, etc.)
```

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Payment Gateway**: Razorpay
- **OTP**: In-memory storage (custom utility)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **State Management**: React Context API

---

## 🗄️ Database Schema (Prisma)

### Models Overview

#### 1. **User** (`users` table)
```prisma
- id: String (CUID, primary key)
- name: String
- phone: String (unique, 10 digits)
- createdAt, updatedAt: DateTime
- Relations: orders (one-to-many)
```

#### 2. **Order** (`orders` table)
```prisma
- id: String (CUID, primary key)
- userId: String? (foreign key, nullable)
- customerName: String
- phone: String
- addressJson: JSON (full address object)
- subtotal: Decimal
- deliveryCharge: Decimal (default: 50)
- gst: Decimal (3%)
- totalAmount: Decimal
- paymentMode: "COD" | "ONLINE"
- paymentStatus: "PENDING" | "PAID" | "FAILED"
- orderStatus: "NEW" | "ACCEPTED" | "REJECTED" | "CANCELLED" | "COMPLETED"
- createdAt, updatedAt: DateTime
- Relations: user (many-to-one), orderItems (one-to-many), payments (one-to-many)
```

#### 3. **OrderItem** (`order_items` table)
```prisma
- id: String (CUID, primary key)
- orderId: String (foreign key)
- photoName: String
- photoUrl: String (LongText, base64 image)
- quantity: Int (1-100)
- pricePerUnit: Decimal (100)
- createdAt, updatedAt: DateTime
- Relations: order (many-to-one)
```

#### 4. **Payment** (`payments` table)
```prisma
- id: String (CUID, primary key)
- orderId: String (foreign key)
- razorpayOrderId: String?
- razorpayPaymentId: String?
- razorpaySignature: String?
- status: "PENDING" | "SUCCESS" | "FAILED"
- createdAt, updatedAt: DateTime
- Relations: order (many-to-one)
```

---

## 🔄 Complete Workflow

### **Flow 1: User Registration/Login (OTP-based)**

```
1. User clicks "Sign In" → SignInPopup opens
   ↓
2. User enters phone number (10 digits)
   ↓
3. Frontend: POST /api/auth/send-otp
   Body: { phone: "9876543210" }
   ↓
4. Backend (server.js:87-156):
   - Validates phone format
   - Calls generateOTP() → 6-digit code
   - Stores in memory: storeOTP(phone, otp) [5-min expiry]
   - Returns: { success: true, otp: "123456" } (dev only)
   ↓
5. User enters OTP + Name (if new user)
   ↓
6. Frontend: POST /api/auth/verify-otp
   Body: { phone, otp, name? }
   ↓
7. Backend (server.js:159-248):
   - Checks if user exists (Prisma)
   - If NEW: Verifies OTP → Creates user → Consumes OTP
   - If EXISTING: Verifies & consumes OTP
   - Generates JWT: jwt.sign({ userId, phone, role: 'user' }, expiresIn: '30d')
   - Returns: { success, token, user }
   ↓
8. Frontend (AuthContext):
   - Stores token in localStorage
   - Sets axios default header: Authorization: Bearer <token>
   - Updates context state: { user, isAuthenticated: true }
```

---

### **Flow 2: Add Photos to Cart (Home Page)**

```
1. User visits Home page (/)
   ↓
2. OrderSection component renders:
   - Upload button (file input)
   - Photo preview area
   - "Your Order" section (below card)
   ↓
3. User selects photo file (JPG/PNG, max 5MB)
   ↓
4. handleFileSelect():
   - Validates file type & size
   - Reads as base64 (FileReader)
   - Sets currentPhoto state
   ↓
5. User enters photo name
   ↓
6. User clicks "Add Photo"
   ↓
7. handleAddPhoto():
   - Creates photo object: { id, photoName, photoUrl (base64), quantity: 1 }
   - Calls CartContext.addItem(photo)
   - CartContext saves to localStorage
   - Photo appears in "Your Order" section below
   ↓
8. User can:
   - Adjust quantity (+/- buttons)
   - Remove photo
   - All changes sync to CartContext & localStorage
```

---

### **Flow 3: Place Order (Cart → Address → Payment)**

```
1. User clicks "Go to Cart" (Home) or navigates to /cart
   ↓
2. Cart page loads:
   - Reads items from CartContext
   - Shows all photos with quantities
   - Displays price summary
   ↓
3. User clicks "Place Order"
   ↓
4. AddressForm modal opens
   ↓
5. User fills address form:
   - Full Name, Phone, House No, Village, City, District, State, Pincode
   - Validation: phone (10 digits), pincode (6 digits)
   ↓
6. User clicks "Proceed to Payment"
   ↓
7. PaymentSummary modal opens
   ↓
8. User selects payment mode:
   
   A) COD (Cash on Delivery):
      ↓
      - User clicks "Place Order"
      ↓
      - Frontend: POST /api/orders/create
        Body: { photos, address, paymentMode: "COD" }
        Headers: Authorization: Bearer <token>
      ↓
      - Backend (server.js:297-440):
        - authenticateUser middleware verifies JWT
        - Validates photos, address, paymentMode
        - Calculates pricing: subtotal, GST (3%), delivery (50), total
        - Creates Order in DB:
          * orderStatus: "NEW"
          * paymentStatus: "PENDING"
          * paymentMode: "COD"
        - Creates OrderItems (one per photo)
        - Returns: { success, order }
      ↓
      - Frontend: Shows OrderSuccessModal
      ↓
      - After 3 seconds: Navigates to /orders
      ↓
      - CartContext.clearCart() → Clears cart & localStorage
   
   B) ONLINE (Razorpay):
      ↓
      - User clicks "Pay Now"
      ↓
      - Frontend: POST /api/orders/create (same as COD)
      ↓
      - Backend creates order (same as COD, but paymentMode: "ONLINE")
      ↓
      - Frontend: POST /api/payment/create
        Body: { orderId, amount: totalAmount * 100 }
      ↓
      - Backend (server.js:936-1043):
        - Validates order exists & belongs to user
        - Creates Razorpay order: razorpay.orders.create()
        - Creates Payment record (status: "PENDING")
        - Returns: { orderId, amount, key: RAZORPAY_KEY_ID }
      ↓
      - Frontend loads Razorpay script
      ↓
      - Opens Razorpay checkout modal
      ↓
      - User completes payment
      ↓
      - Razorpay calls handler with payment response
      ↓
      - Frontend: POST /api/payment/verify
        Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
      ↓
      - Backend (server.js:1046-1155):
        - Verifies HMAC signature
        - Updates Payment: status: "SUCCESS"
        - Updates Order: paymentStatus: "PAID", paymentMode: "ONLINE"
        - Returns: { success }
      ↓
      - Frontend: Shows success → Navigates to /orders
      ↓
      - CartContext.clearCart()
```

---

### **Flow 4: View Orders (User)**

```
1. User navigates to /orders
   ↓
2. Orders page checks authentication (useAuth)
   ↓
3. If not authenticated → Redirects to /
   ↓
4. Frontend: GET /api/orders/user
   Headers: Authorization: Bearer <token>
   ↓
5. Backend (server.js:514-570):
   - authenticateUser middleware extracts userId from JWT
   - Fetches: prisma.order.findMany({ where: { userId } })
   - Includes orderItems
   - Calculates totalQuantity per order
   - Returns: { success, orders: [...] }
   ↓
6. Frontend renders:
   - Order cards with status badges
   - Photo thumbnails
   - Payment info
   - Action buttons:
     * "Pay Now" (for COD orders with PENDING payment)
     * "Cancel Order" (only for NEW orders)
```

---

### **Flow 5: Admin Login & Dashboard**

```
1. Admin navigates to /admin/login
   ↓
2. AdminLogin page renders AdminLoginPopup
   ↓
3. Admin enters credentials
   ↓
4. Frontend: POST /api/auth/admin-login
   Body: { username, password }
   ↓
5. Backend (server.js:251-292):
   - Compares with fixed credentials (ADMIN_USERNAME, ADMIN_PASSWORD)
   - Generates JWT: { username, role: 'admin' }, expiresIn: '24h'
   - Returns: { success, token, admin }
   ↓
6. Frontend: AuthContext.loginAdmin(token, admin)
   - Stores adminToken in localStorage
   - Sets axios header
   ↓
7. Redirects to /admin/dashboard
   ↓
8. Dashboard: GET /api/admin/dashboard?range=7
   ↓
9. Backend (server.js:857-1064):
   - authenticateAdmin middleware verifies admin role
   - Applies date filter (default: last 7 days)
   - Calculates stats:
     * totalOrders, newOrders, completedOrders
     * totalRevenue (COMPLETED orders, PAID or COD)
     * totalMagnets (sum from COMPLETED orders)
     * codOrdersCount, onlineOrdersCount
     * codRevenue, onlineRevenue
   - Groups orders by day for chart
   - Returns: { success, stats, dayWiseData }
   ↓
10. Frontend renders:
    - 5 stat cards (Total Orders, New, Completed, Revenue, Magnets)
    - Payment Insights section (4 cards: COD/Online counts & revenue)
    - Bar chart (day-wise orders)
    - Date range filter (top-right)
```

---

### **Flow 6: Admin Manage Orders**

```
1. Admin navigates to /admin/orders
   ↓
2. AdminOrders page loads
   ↓
3. Frontend: GET /api/orders/admin?status=new
   Headers: Authorization: Bearer <adminToken>
   ↓
4. Backend (server.js:573-652):
   - authenticateAdmin middleware verifies admin
   - Filters by status query param
   - Fetches orders with user & orderItems
   - Returns formatted orders
   ↓
5. Frontend renders collapsible order cards:
   - Collapsed: Order ID, date, status, Accept/Reject buttons
   - Expanded: Full details (customer, address, photos, summary)
   ↓
6. Admin actions:
   
   A) Accept Order:
      - Frontend: PATCH /api/orders/:id/admin-action
        Body: { action: "ACCEPT" }
      - Backend updates: orderStatus: "ACCEPTED"
   
   B) Reject Order:
      - Frontend: PATCH /api/orders/:id/admin-action
        Body: { action: "REJECT" }
      - Backend updates: orderStatus: "REJECTED"
   
   C) Mark Completed:
      - Frontend: PATCH /api/orders/:id/status
        Body: { orderStatus: "COMPLETED" }
      - Backend updates order status
      - This triggers revenue calculation (COMPLETED orders)
   
   D) Download Photo:
      - Frontend: GET /api/orders/:orderId/photos/:photoId/download
      - Backend converts base64 to buffer → sends as download
```

---

## 📂 File-by-File Breakdown

### **Backend Files**

#### `server.js` (Main API Server)
- **Lines 1-67**: Imports, config, constants (PRICE_PER_MAGNET, DELIVERY_CHARGE, GST_RATE)
- **Lines 69-77**: Health check endpoints
- **Lines 79-292**: Authentication routes
  - `/api/auth/send-otp`: Generate & store OTP
  - `/api/auth/verify-otp`: Verify OTP, create/login user, return JWT
  - `/api/auth/admin-login`: Admin authentication
- **Lines 294-854**: Order routes
  - `/api/orders/create`: Create order (user auth required)
  - `/api/orders/user`: Get user's orders
  - `/api/orders/admin`: Get all orders (admin auth)
  - `/api/orders/:id/status`: Update order status (admin)
  - `/api/orders/:id/admin-action`: Accept/Reject order (admin)
  - `/api/orders/:id/cancel`: User cancels order
  - `/api/orders/:orderId/photos/:photoId/download`: Download photo (admin)
- **Lines 856-1064**: Admin dashboard
  - `/api/admin/dashboard`: Stats, revenue, magnets, payment insights, date filtering
- **Lines 933-1155**: Payment routes
  - `/api/payment/create`: Create Razorpay order
  - `/api/payment/verify`: Verify Razorpay payment signature
- **Lines 1157-1237**: Contact form, error handling, server startup

#### `middleware/auth.js`
- `authenticateUser`: Verifies JWT, extracts userId, sets `req.user`
- `authenticateAdmin`: Verifies JWT and checks `role === 'admin'`

#### `utils/otp.js`
- `generateOTP()`: Returns 6-digit random code
- `storeOTP(phone, otp)`: Stores in Map with 5-min expiry
- `verifyOTP(phone, otp, consume)`: Validates OTP, optionally consumes it
- Auto-cleanup job (runs every 10 minutes)

#### `db.js`
- Exports Prisma Client singleton
- Prevents multiple instances

---

### **Frontend Files**

#### `App.jsx`
- Wraps app in `AuthProvider` and `CartProvider`
- Configures React Router with all routes:
  - `/` → Home
  - `/cart` → Cart
  - `/orders` → Orders
  - `/contact` → Contact
  - `/admin/login` → AdminLogin
  - `/admin/dashboard` → AdminDashboard
  - `/admin/orders` → AdminOrders

#### `context/AuthContext.jsx`
- Manages user/admin authentication state
- Functions: `loginUser`, `loginAdmin`, `logoutUser`, `logoutAdmin`
- Persists tokens in localStorage
- Configures axios default headers

#### `context/CartContext.jsx`
- Manages shopping cart state
- Functions: `addItem`, `removeItem`, `updateQuantity`, `clearCart`
- Persists to localStorage (survives page refresh)
- Single source of truth for cart across Home & Cart pages

#### `pages/Home.jsx`
- Main landing page
- Renders: Navbar, OrderSection, ProductGallery, Footer
- OrderSection handles photo upload & cart management

#### `pages/Cart.jsx`
- Displays all cart items
- Allows quantity editing (buttons or direct input)
- Delete functionality
- Price summary sidebar
- "Place Order" button → Opens AddressForm

#### `pages/Orders.jsx`
- Lists user's orders
- Shows order status, items, payment info
- "Pay Now" for COD orders
- "Cancel Order" only for NEW orders

#### `pages/AdminDashboard.jsx`
- Stats cards (5 cards)
- Payment Insights section (4 cards: COD/Online)
- Date range filter (dropdown + custom range)
- Day-wise order chart
- All stats update dynamically based on filter

#### `pages/AdminOrders.jsx`
- Collapsible order cards
- Tabs: New, Completed, Rejected, Cancelled
- Accept/Reject/Mark Completed actions
- Photo download functionality

#### `components/OrderSection.jsx`
- Hero section with headline & trust badges
- Upload card (right side)
- "Your Order" section (below, shows added photos)
- "Go to Cart" button

#### `components/AddressForm.jsx`
- Modal form for delivery address
- Validates all fields
- On submit → Opens PaymentSummary

#### `components/PaymentSummary.jsx`
- Shows order summary
- Payment mode selection (COD/ONLINE)
- Handles order creation & Razorpay integration
- On success → Calls onSubmit (clears cart)

---

## 🔐 Authentication Flow

### User Authentication
1. **OTP Generation**: Phone → OTP stored in memory (5 min expiry)
2. **OTP Verification**: OTP + Name (if new) → JWT token generated
3. **Token Storage**: localStorage (`userToken`)
4. **API Calls**: Axios automatically includes `Authorization: Bearer <token>`
5. **Middleware**: `authenticateUser` verifies JWT, sets `req.user.userId`

### Admin Authentication
1. **Login**: Username/password → JWT token
2. **Token Storage**: localStorage (`adminToken`)
3. **Middleware**: `authenticateAdmin` verifies JWT + checks `role === 'admin'`

---

## 💰 Pricing Logic

```javascript
PRICE_PER_MAGNET = 100
DELIVERY_CHARGE = 50
GST_RATE = 0.03 (3%)

Calculation:
- subtotal = totalMagnets × PRICE_PER_MAGNET
- gst = subtotal × GST_RATE
- totalAmount = subtotal + DELIVERY_CHARGE + gst
```

---

## 🛒 Cart Management

### State Flow
1. **Home Page**: User adds photos → `CartContext.addItem()`
2. **CartContext**: Updates state + saves to localStorage
3. **Cart Page**: Reads from CartContext, displays items
4. **Order Placed**: `CartContext.clearCart()` → Clears state & localStorage

### Persistence
- Cart survives page refresh (localStorage)
- Shared between Home and Cart pages
- Cleared only after successful order placement

---

## 📊 Revenue Calculation (Admin Dashboard)

### Total Revenue
```sql
SUM(total_amount) WHERE 
  order_status = 'COMPLETED' 
  AND (payment_status = 'PAID' OR payment_mode = 'COD')
```

### Payment Insights
- **COD Revenue**: `SUM(total_amount)` where `order_status = 'COMPLETED'` AND `payment_mode = 'COD'`
- **Online Revenue**: `SUM(total_amount)` where `order_status = 'COMPLETED'` AND `payment_mode = 'ONLINE'`

### Total Magnets Made
```sql
SUM(order_items.quantity) WHERE order_status = 'COMPLETED'
```

---

## 🔄 Order Status Lifecycle

```
NEW
  ↓ (Admin accepts)
ACCEPTED
  ↓ (Admin marks completed)
COMPLETED

OR

NEW
  ↓ (Admin rejects)
REJECTED

OR

NEW
  ↓ (User cancels)
CANCELLED
```

**Cancel Button Visibility**: Only shown when `orderStatus === 'NEW'`

---

## 🌐 API Endpoints Summary

### Authentication
- `POST /api/auth/send-otp` - Generate OTP
- `POST /api/auth/verify-otp` - Verify OTP, get JWT
- `POST /api/auth/admin-login` - Admin login

### Orders (User)
- `POST /api/orders/create` - Create order (auth required)
- `GET /api/orders/user` - Get user's orders (auth required)
- `PATCH /api/orders/:id/cancel` - Cancel order (auth required)

### Orders (Admin)
- `GET /api/orders/admin?status=...` - Get all orders (admin auth)
- `PATCH /api/orders/:id/status` - Update order status (admin)
- `PATCH /api/orders/:id/admin-action` - Accept/Reject (admin)
- `GET /api/orders/:orderId/photos/:photoId/download` - Download photo (admin)

### Payments
- `POST /api/payment/create` - Create Razorpay order (auth required)
- `POST /api/payment/verify` - Verify payment (auth required)

### Admin Dashboard
- `GET /api/admin/dashboard?range=...&startDate=...&endDate=...` - Get stats (admin auth)

### Other
- `GET /api/health` - Health check
- `POST /api/contact` - Contact form submission

---

## 🎨 UI/UX Features

### Design System
- **Primary Colors**: Purple/Indigo gradient (#6366F1 → #8B5CF6)
- **Accent Colors**: Orange (COD), Indigo (Online), Green (Success)
- **Components**: Gradient borders, soft shadows, rounded corners
- **Responsive**: Mobile-first design

### Key UI Components
- **Gradient Borders**: Premium card effect
- **Sticky Elements**: Mobile price bar, navbar
- **Collapsible Cards**: Admin orders (expand/collapse)
- **Empty States**: Friendly placeholders
- **Loading States**: Spinners and skeletons
- **Icons**: Cart badge, user avatar, social links

---

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="mysql://user:password@localhost:3306/mintedmemories"
RAZORPAY_KEY_ID="your_key_id"
RAZORPAY_KEY_SECRET="your_key_secret"
JWT_SECRET="your-secret-key"
PORT=5001
NODE_ENV=development
```

### Frontend (Vite Config)
- Dev server: `localhost:3000`
- API proxy: `/api/*` → `http://localhost:5001`

---

## 🚀 Development Workflow

### Starting the Project
```bash
# Backend
cd backend
npm install
npm run dev  # Runs on port 5001

# Frontend
cd frontend
npm install
npm run dev  # Runs on port 3000
```

### Database Setup
```bash
cd backend
npx prisma migrate dev  # Run migrations
npx prisma generate     # Generate Prisma Client
```

---

## 📝 Key Business Rules

1. **OTP Expiry**: 5 minutes
2. **JWT Expiry**: 30 days (user), 24 hours (admin)
3. **Photo Limits**: Max 5MB, JPG/PNG only
4. **Quantity Limits**: 1-100 per photo
5. **Order Cancellation**: Only allowed for NEW orders
6. **Revenue Calculation**: Only COMPLETED orders count
7. **Cart Persistence**: Survives page refresh until order placed

---

This is a complete, production-ready e-commerce system for custom fridge magnets with user authentication, cart management, payment processing, and comprehensive admin features.
