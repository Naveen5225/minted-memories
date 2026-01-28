# Project Structure

```
FM/
├── frontend/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero.jsx              # Hero section with CTA
│   │   │   ├── ProductGallery.jsx    # Sample product images grid
│   │   │   └── OrderSection.jsx      # Image upload + payment integration
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Home + Order page
│   │   │   └── Contact.jsx           # Contact form page
│   │   ├── App.jsx                   # Main app with routing
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind CSS imports
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   ├── vite.config.js                # Vite configuration
│   ├── tailwind.config.js            # Tailwind CSS configuration
│   ├── postcss.config.js             # PostCSS configuration
│   └── .gitignore                    # Frontend gitignore
│
├── backend/                           # Node.js + Express Backend
│   ├── server.js                     # Express server + API endpoints
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables (create this)
│   └── .gitignore                    # Backend gitignore
│
├── README.md                          # Main documentation
├── SETUP.md                           # Quick setup guide
├── PROJECT_STRUCTURE.md               # This file
└── .gitignore                         # Root gitignore
```

## Key Files Explained

### Frontend

- **`src/pages/Home.jsx`**: Main landing page combining hero, gallery, and order section
- **`src/pages/Contact.jsx`**: Contact form with validation
- **`src/components/OrderSection.jsx`**: 
  - Image upload with preview
  - Price calculation (photos × ₹100)
  - Razorpay payment integration
  - Payment verification

### Backend

- **`server.js`**: 
  - `/api/create-order`: Creates Razorpay order
  - `/api/verify-payment`: Verifies payment signature
  - `/api/contact`: Handles contact form submissions
  - Amount validation and security checks

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/create-order` | POST | Create Razorpay order |
| `/api/verify-payment` | POST | Verify payment signature |
| `/api/contact` | POST | Submit contact form |

## Payment Flow

1. User uploads photos → Frontend validates (type, size)
2. Frontend calculates total → `photos × ₹100`
3. User clicks "Buy Now" → Frontend calls `/api/create-order`
4. Backend validates amount → Creates Razorpay order
5. Razorpay modal opens → User completes payment
6. Frontend receives payment response → Calls `/api/verify-payment`
7. Backend verifies signature → Returns success
8. Frontend shows success message
