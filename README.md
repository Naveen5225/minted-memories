# Minted Memories - E-commerce Website

A complete production-ready e-commerce website for custom photo fridge magnets with PostgreSQL database, order management, and payment integration.

## 🚀 Project Structure

```
FM/
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx              # Hero section
│   │   │   ├── ProductGallery.jsx    # Product gallery
│   │   │   ├── OrderSection.jsx      # Order section with quantity selector
│   │   │   ├── AddressForm.jsx       # Address collection form
│   │   │   └── PaymentSummary.jsx    # Payment summary and selection
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Home page
│   │   │   ├── Orders.jsx            # Orders history page
│   │   │   └── Contact.jsx           # Contact page
│   │   ├── App.jsx                   # Main app with routing
│   │   └── main.jsx                  # Entry point
│   ├── package.json
│   └── vite.config.js
│
├── backend/                           # Node.js + Express Backend
│   ├── prisma/
│   │   └── schema.prisma             # Database schema
│   ├── server.js                     # Express server + API endpoints
│   ├── db.js                         # Prisma client
│   ├── package.json
│   └── .env                          # Environment variables
│
└── README.md                          # This file
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v5.7 or higher, or MariaDB 10.2+)
- npm or yarn
- Razorpay account (for payment integration)

## 🛠️ Setup Instructions

### 1. Database Setup

```bash
# Install MySQL (if not already installed)
# macOS: brew install mysql
# Ubuntu: sudo apt-get install mysql-server
# Windows: Download from https://dev.mysql.com/downloads/mysql/

# Start MySQL service
# macOS: brew services start mysql
# Ubuntu: sudo systemctl start mysql
# Windows: Start MySQL from Services

# Create a new database
mysql -u root -p
CREATE DATABASE mintedmemories;
EXIT;
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Create .env file
touch .env
```

Add the following to `backend/.env`:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/mintedmemories"

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5001
```

Replace:
- `username` with your MySQL username (usually `root`)
- `password` with your MySQL password
- `mintedmemories` with your database name (if different)
- Default MySQL port is `3306`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Razorpay Setup

1. **Create a Razorpay Account**
   - Go to [https://razorpay.com](https://razorpay.com)
   - Sign up for an account
   - Complete KYC verification

2. **Get API Keys**
   - Log in to Razorpay Dashboard
   - Go to Settings → API Keys
   - Generate Test/Live keys
   - Copy `Key ID` and `Key Secret` to your `.env` file

3. **Test Mode vs Live Mode**
   - Use Test keys for development
   - Use Live keys for production
   - Test cards: [Razorpay Test Cards](https://razorpay.com/docs/payments/test-cards/)

## 🚀 Running the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend server will run on `http://localhost:5001`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📁 Database Schema

### Orders Table
- `id` (CUID) - Primary key
- `customerName` - Customer full name
- `phone` - 10 digit phone number
- `addressJson` - JSON object with address details
- `quantity` - Number of magnets
- `subtotal` - Subtotal amount
- `deliveryCharge` - Delivery charge (₹50)
- `gst` - GST amount (3%)
- `totalAmount` - Total payable amount
- `paymentMode` - "COD" or "ONLINE"
- `paymentStatus` - "PENDING", "PAID", "FAILED"
- `orderStatus` - "ORDER_PLACED", "PROCESSING", "SHIPPED", "DELIVERED"
- `createdAt`, `updatedAt` - Timestamps

### Payments Table
- `id` (CUID) - Primary key
- `orderId` - Foreign key to orders
- `razorpayOrderId` - Razorpay order ID
- `razorpayPaymentId` - Razorpay payment ID
- `razorpaySignature` - Payment signature
- `status` - "PENDING", "SUCCESS", "FAILED"
- `createdAt`, `updatedAt` - Timestamps

## 🔄 API Endpoints

### Orders
- `POST /api/orders/create` - Create a new order
  - Body: `{ quantity, address, paymentMode }`
  - Returns: Order details

- `GET /api/orders` - Get all orders
  - Returns: Array of orders

### Payments
- `POST /api/payment/create` - Create Razorpay order
  - Body: `{ orderId, amount }`
  - Returns: Razorpay order details

- `POST /api/payment/verify` - Verify payment
  - Body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }`
  - Returns: Verification status

### Other
- `GET /api/health` - Health check
- `POST /api/contact` - Contact form submission

## 💰 Pricing Structure

- **Price per magnet**: ₹100
- **Delivery charge**: ₹50
- **GST**: 3% on subtotal
- **Total calculation**: `(quantity × 100) + 50 + (subtotal × 0.03)`

All pricing calculations are done on the backend to ensure security.

## 🔒 Security Features

- Amount validation on backend
- Payment signature verification
- Input sanitization and validation
- Phone number validation (10 digits)
- Pincode validation (6 digits)
- Quantity limits (1-100)
- CORS configuration
- Environment variables for secrets

## 📱 Features

- ✅ Quantity selector with +/- buttons
- ✅ Address form with validation
- ✅ Payment summary with GST and delivery charges
- ✅ Cash on Delivery (COD) option
- ✅ Online payment via Razorpay
- ✅ Order history page
- ✅ Order tracking status
- ✅ Responsive design
- ✅ Database persistence
- ✅ Payment verification

## 🧪 Testing Payment

Use Razorpay test cards:
- **Success**: `4111 1111 1111 1111`
- **Failure**: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

## 🚀 Production Deployment

### Frontend

```bash
cd frontend
npm run build
# Deploy the 'dist' folder to your hosting service
```

### Backend

1. Set environment variables on your hosting platform
2. Run database migrations: `npm run prisma:migrate`
3. Use process manager like PM2
4. Configure reverse proxy (nginx)
5. Use HTTPS for secure payment processing

### Database

- Use managed MySQL service (AWS RDS, DigitalOcean, etc.)
- Update `DATABASE_URL` in production environment
- Run migrations before deploying
- Ensure MySQL version 5.7+ for JSON support

## 📝 Environment Variables

### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/mintedmemories
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5001
```

## 🔧 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```

## 📞 Support

For issues or questions:
- Email: support@mintedmemories.in
- Check Razorpay documentation: [https://razorpay.com/docs](https://razorpay.com/docs)
- Check Prisma documentation: [https://www.prisma.io/docs](https://www.prisma.io/docs)

## 📄 License

This project is proprietary software for Minted Memories.

---

**Note**: Make sure to replace placeholder values (like email, WhatsApp number, Instagram handle) with actual values before deploying to production.
