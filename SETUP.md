# Quick Setup Guide

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- Razorpay account

## Step 1: Database Setup

```bash
# Create database
mysql -u root -p
CREATE DATABASE mintedmemories;
EXIT;
```

## Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Create .env file
cat > .env << EOF
DATABASE_URL="mysql://username:password@localhost:3306/mintedmemories"
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
PORT=5001
EOF

# Edit .env with your actual credentials
```

## Step 3: Frontend Setup

```bash
cd frontend
npm install
```

## Step 4: Run Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

## Getting Razorpay Credentials

1. Sign up at https://razorpay.com
2. Complete KYC verification
3. Go to Settings → API Keys
4. Generate Test/Live keys
5. Copy Key ID and Key Secret to `.env` file

## Database Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio
```
