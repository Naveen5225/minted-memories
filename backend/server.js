import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from './db.js'
import { authenticateUser, authenticateAdmin } from './middleware/auth.js'
import { generateOTP, storeOTP, verifyOTP } from './utils/otp.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5001
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Constants
const PRICE_PER_MAGNET = 100
const DELIVERY_CHARGE = 50
const GST_RATE = 0.03 // 3%

// Fixed Admin Credentials
const ADMIN_USERNAME = 'naveen_0417'
const ADMIN_PASSWORD = 'Naveen@041709'

// CORS configuration - must be before other middleware
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))

// Handle preflight requests
app.options('*', cors())

// Increase JSON payload limit for base64 images
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Initialize Razorpay (only if credentials are available)
let razorpay = null
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  })
  console.log('Razorpay initialized successfully')
} else {
  console.warn('WARNING: Razorpay credentials not found in environment variables!')
  console.warn('Online payment features will not work. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file')
}

// Helper function to calculate pricing
function calculatePricing(totalQuantity) {
  const subtotal = totalQuantity * PRICE_PER_MAGNET
  const gst = subtotal * GST_RATE
  const totalAmount = subtotal + DELIVERY_CHARGE + gst
  
  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    deliveryCharge: DELIVERY_CHARGE,
    gst: parseFloat(gst.toFixed(2)),
    totalAmount: parseFloat(totalAmount.toFixed(2))
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Test endpoint working' })
})

// ==================== AUTHENTICATION ENDPOINTS ====================

// Handle OPTIONS for send-otp (CORS preflight)
app.options('/api/auth/send-otp', cors(), (req, res) => {
  res.sendStatus(200)
})

// Send OTP
app.post('/api/auth/send-otp', cors(), async (req, res) => {
  try {
    console.log('Send OTP request received:', {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body
    })

    const { phone } = req.body

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      })
    }

    // Clean phone number (remove any non-digits)
    const cleanPhone = phone.replace(/\D/g, '')

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      })
    }

    // Generate and store OTP
    let otp
    try {
      otp = generateOTP()
      if (!otp || otp.length !== 6) {
        throw new Error('Invalid OTP generated')
      }
      storeOTP(cleanPhone, otp)
    } catch (otpError) {
      console.error('OTP generation/storage error:', otpError)
      throw new Error('Failed to generate or store OTP')
    }

    // In production, send OTP via SMS service (Twilio, etc.)
    // For now, we'll return it in response (remove in production)
    console.log(`OTP for ${cleanPhone}: ${otp}`)

    console.log(`OTP generated and stored for ${cleanPhone}`)

    res.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove this in production - OTP should only be sent via SMS
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined
    })
  } catch (error) {
    console.error('Error sending OTP:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    // Don't send 403, send 500 for server errors
    const statusCode = error.statusCode || 500
    res.status(statusCode).json({
      success: false,
      message: 'Failed to send OTP. Please try again.',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Verify OTP and create/login user
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body

    if (!phone || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit phone number is required'
      })
    }

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 6-digit OTP is required'
      })
    }

    // Check if user exists first
    let user = await prisma.user.findUnique({
      where: { phone }
    })

    // If new user, verify OTP without consuming it first
    if (!user) {
      // Verify OTP without consuming (consume = false)
      const otpResult = verifyOTP(phone, otp, false)
      if (!otpResult.valid) {
        return res.status(400).json({
          success: false,
          message: otpResult.message,
          requiresName: true
        })
      }

      // OTP is valid, check if name is provided
      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Name is required for new users',
          requiresName: true
        })
      }

      // Create user and consume OTP
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          phone
        }
      })
      
      // Now consume the OTP
      verifyOTP(phone, otp, true)
    } else {
      // Existing user - verify and consume OTP
      const otpResult = verifyOTP(phone, otp, true)
      if (!otpResult.valid) {
        return res.status(400).json({
          success: false,
          message: otpResult.message
        })
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone, role: 'user' },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to verify OTP. Please try again.'
    })
  }
})

// Admin login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      })
    }

    // Verify fixed credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      admin: {
        username
      }
    })
  } catch (error) {
    console.error('Error in admin login:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to login. Please try again.'
    })
  }
})

// ==================== ORDER ENDPOINTS ====================

// Create order (requires authentication)
app.post('/api/orders/create', authenticateUser, async (req, res) => {
  try {
    const { photos, address, paymentMode } = req.body
    const userId = req.user.userId

    // Validate photos array
    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one photo is required'
      })
    }

    // Validate each photo and ensure orderType exists
    let totalQuantity = 0
    for (const photo of photos) {
      if (!photo.photoName || !photo.photoUrl || !photo.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Each photo must have photoName, photoUrl, and quantity'
        })
      }

      // CRITICAL: Validate orderType exists on each item
      if (!photo.orderType || !['MAGNET', 'POLAROID'].includes(photo.orderType)) {
        return res.status(400).json({
          success: false,
          message: 'Each photo must have a valid orderType (MAGNET or POLAROID)'
        })
      }

      if (photo.quantity < 1 || photo.quantity > 100) {
        return res.status(400).json({
          success: false,
          message: 'Quantity for each photo must be between 1 and 100'
        })
      }

      // Validate polaroidType ONLY if orderType is POLAROID
      if (photo.orderType === 'POLAROID' && !photo.polaroidType) {
        return res.status(400).json({
          success: false,
          message: 'Polaroid type is required for Polaroid orders'
        })
      }

      totalQuantity += photo.quantity
    }

    // Normalize order items - preserve orderType per item
    const normalizedItems = photos.map(photo => {
      const itemOrderType = photo.orderType || 'MAGNET' // Fallback for safety
      
      return {
        photoName: photo.photoName,
        photoUrl: photo.photoUrl,
        quantity: photo.quantity,
        pricePerUnit: PRICE_PER_MAGNET,
        orderType: itemOrderType, // REQUIRED: Each item has its own orderType
        polaroidType: itemOrderType === 'POLAROID' ? (photo.polaroidType || null) : null,
        caption: itemOrderType === 'POLAROID' ? (photo.caption || null) : null
      }
    })

    // Validate address
    const requiredFields = ['fullName', 'phone', 'houseNo', 'village', 'city', 'district', 'state', 'pincode']
    for (const field of requiredFields) {
      if (!address || !address[field]) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`
        })
      }
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(address.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      })
    }

    // Validate pincode (6 digits)
    if (!/^\d{6}$/.test(address.pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must be exactly 6 digits'
      })
    }

    // Validate payment mode
    if (!['COD', 'ONLINE'].includes(paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Payment mode must be COD or ONLINE'
      })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    // Determine order-level type for informational purposes
    const uniqueOrderTypes = [...new Set(normalizedItems.map(item => item.orderType))]
    const orderLevelType = uniqueOrderTypes.length === 1 
      ? uniqueOrderTypes[0] 
      : 'MIXED' // Mixed order contains both MAGNET and POLAROID

    // Calculate pricing based on total quantity
    const pricing = calculatePricing(totalQuantity)

    // Handle COD and ONLINE differently
    if (paymentMode === 'COD') {
      // COD: Create order directly, no Razorpay
      try {
        const order = await prisma.order.create({
          data: {
            user: {
              connect: {
                id: userId
              }
            },
            customerName: address.fullName,
            phone: address.phone,
            addressJson: address,
            subtotal: pricing.subtotal,
            deliveryCharge: pricing.deliveryCharge,
            gst: pricing.gst,
            totalAmount: pricing.totalAmount,
            paymentMode: 'COD',
            paymentStatus: 'PENDING',
            orderStatus: 'NEW',
            orderType: orderLevelType, // Order-level type is now informational only (MAGNET, POLAROID, or MIXED)
            orderItems: {
              create: normalizedItems
            }
          },
          include: {
            orderItems: true
          }
        })

        return res.json({
          success: true,
          message: 'Order placed successfully',
          order: {
            id: order.id,
            orderId: order.id, // For frontend compatibility
            totalQuantity: totalQuantity,
            totalAmount: parseFloat(order.totalAmount),
            paymentMode: order.paymentMode,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map(item => ({
              id: item.id,
              photoName: item.photoName,
              quantity: item.quantity,
              pricePerUnit: parseFloat(item.pricePerUnit)
            }))
          }
        })
      } catch (dbError) {
        console.error('Database error creating COD order:', dbError)
        console.error('Error stack:', dbError.stack)
        return res.status(500).json({
          success: false,
          message: 'Failed to create order. Please try again.',
          error: process.env.NODE_ENV !== 'production' ? dbError.message : undefined
        })
      }
    } else {
      // ONLINE: Create order, then proceed with Razorpay
      try {
        const order = await prisma.order.create({
          data: {
            user: {
              connect: {
                id: userId
              }
            },
            customerName: address.fullName,
            phone: address.phone,
            addressJson: address,
            subtotal: pricing.subtotal,
            deliveryCharge: pricing.deliveryCharge,
            gst: pricing.gst,
            totalAmount: pricing.totalAmount,
            paymentMode: 'ONLINE',
            paymentStatus: 'PENDING',
            orderStatus: 'NEW',
            orderType: orderLevelType, // Order-level type is now informational only (MAGNET, POLAROID, or MIXED)
            orderItems: {
              create: normalizedItems
            }
          },
          include: {
            orderItems: true
          }
        })

        return res.json({
          success: true,
          order: {
            id: order.id,
            totalQuantity: totalQuantity,
            totalAmount: parseFloat(order.totalAmount),
            paymentMode: order.paymentMode,
            orderStatus: order.orderStatus,
            createdAt: order.createdAt,
            orderItems: order.orderItems.map(item => ({
              id: item.id,
              photoName: item.photoName,
              quantity: item.quantity,
              pricePerUnit: parseFloat(item.pricePerUnit)
            }))
          }
        })
      } catch (dbError) {
        console.error('Database error creating ONLINE order:', dbError)
        console.error('Error stack:', dbError.stack)
        return res.status(500).json({
          success: false,
          message: 'Failed to create order. Please try again.',
          error: process.env.NODE_ENV !== 'production' ? dbError.message : undefined
        })
      }
    }
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    })
    res.status(500).json({
      success: false,
      message: 'Failed to create order. Please try again.',
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined
    })
  }
})

// Get user orders
app.get('/api/orders/user', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.userId

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        orderItems: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    const formattedOrders = orders.map(order => {
      const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      
      // Calculate magnet and polaroid counts based on each item's orderType
      let magnetCount = 0
      let polaroidCount = 0
      
      // Safety check: ensure orderItems exists
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
          const itemOrderType = item.orderType || 'MAGNET'
          if (itemOrderType === 'POLAROID') {
            polaroidCount += item.quantity
          } else {
            magnetCount += item.quantity
          }
        })
      }
      
      return {
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          photoName: item.photoName,
          photoUrl: item.photoUrl,
          quantity: item.quantity,
          pricePerUnit: parseFloat(item.pricePerUnit),
          orderType: item.orderType || 'MAGNET', // REQUIRED: Use item's own orderType
          polaroidType: item.polaroidType || null,
          caption: item.caption || null
        })),
        totalQuantity: totalQuantity,
        magnetCount: magnetCount,
        polaroidCount: polaroidCount,
        subtotal: parseFloat(order.subtotal),
        deliveryCharge: parseFloat(order.deliveryCharge),
        gst: parseFloat(order.gst),
        totalAmount: parseFloat(order.totalAmount),
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        orderType: order.orderType || 'MAGNET',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

    res.json({
      success: true,
      orders: formattedOrders
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders. Please try again.'
    })
  }
})

// Get admin orders
app.get('/api/orders/admin', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query

    const whereClause = {}
    if (status === 'new') {
      whereClause.orderStatus = { 
        notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] 
      }
    } else if (status === 'completed') {
      whereClause.orderStatus = 'COMPLETED'
    } else if (status === 'rejected') {
      whereClause.orderStatus = 'REJECTED'
    } else if (status === 'cancelled') {
      whereClause.orderStatus = 'CANCELLED'
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true
          }
        },
        orderItems: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    const formattedOrders = orders.map(order => {
      const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
      
      // Calculate magnet and polaroid counts based on each item's orderType
      let magnetCount = 0
      let polaroidCount = 0
      
      // Safety check: ensure orderItems exists
      if (order.orderItems && order.orderItems.length > 0) {
        order.orderItems.forEach(item => {
          const itemOrderType = item.orderType || 'MAGNET'
          if (itemOrderType === 'POLAROID') {
            polaroidCount += item.quantity
          } else {
            magnetCount += item.quantity
          }
        })
      }
      
      return {
        id: order.id,
        userId: order.userId,
        customerName: order.customerName,
        phone: order.phone,
        address: order.addressJson,
        user: order.user,
        orderItems: order.orderItems.map(item => ({
          id: item.id,
          photoName: item.photoName,
          photoUrl: item.photoUrl,
          quantity: item.quantity,
          pricePerUnit: parseFloat(item.pricePerUnit),
          orderType: item.orderType || 'MAGNET', // REQUIRED: Use item's own orderType
          polaroidType: item.polaroidType || null,
          caption: item.caption || null
        })),
        totalQuantity: totalQuantity,
        magnetCount: magnetCount,
        polaroidCount: polaroidCount,
        subtotal: parseFloat(order.subtotal),
        deliveryCharge: parseFloat(order.deliveryCharge),
        gst: parseFloat(order.gst),
        totalAmount: parseFloat(order.totalAmount),
        paymentMode: order.paymentMode,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        orderType: order.orderType || 'MAGNET',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    })

    res.json({
      success: true,
      orders: formattedOrders
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders. Please try again.'
    })
  }
})

// Update order status (admin only)
app.patch('/api/orders/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { orderStatus } = req.body

    if (!orderStatus) {
      return res.status(400).json({
        success: false,
        message: 'Order status is required'
      })
    }

    const validStatuses = ['NEW', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { orderStatus },
      include: {
        orderItems: true
      }
    })

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: {
        id: order.id,
        orderStatus: order.orderStatus
      }
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update order status. Please try again.'
    })
  }
})

// Admin action: Accept or Reject order
app.patch('/api/orders/:id/admin-action', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { action } = req.body

    if (!action || !['ACCEPT', 'REJECT'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Action must be ACCEPT or REJECT'
      })
    }

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED'

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { orderStatus: newStatus },
      include: {
        orderItems: true
      }
    })

    res.json({
      success: true,
      message: `Order ${action === 'ACCEPT' ? 'accepted' : 'rejected'} successfully`,
      order: {
        id: updatedOrder.id,
        orderStatus: updatedOrder.orderStatus
      }
    })
  } catch (error) {
    console.error('Error processing admin action:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process action. Please try again.'
    })
  }
})

// User cancel order
app.patch('/api/orders/:id/cancel', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const order = await prisma.order.findUnique({
      where: { id }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Verify order belongs to user
    if (order.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order'
      })
    }

    // Check if order can be cancelled
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled'
      })
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { orderStatus: 'CANCELLED' },
      include: {
        orderItems: true
      }
    })

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: {
        id: updatedOrder.id,
        orderStatus: updatedOrder.orderStatus
      }
    })
  } catch (error) {
    console.error('Error cancelling order:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order. Please try again.'
    })
  }
})

// Download photo (admin only)
app.get('/api/orders/:orderId/photos/:photoId/download', authenticateAdmin, async (req, res) => {
  try {
    const { orderId, photoId } = req.params

    const orderItem = await prisma.orderItem.findFirst({
      where: {
        id: photoId,
        orderId: orderId
      }
    })

    if (!orderItem) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      })
    }

    // Check if photoUrl is base64
    if (orderItem.photoUrl.startsWith('data:image')) {
      // Extract base64 data
      const base64Data = orderItem.photoUrl.split(',')[1]
      const mimeMatch = orderItem.photoUrl.match(/data:image\/(\w+);base64/)
      const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : 'image/jpeg'
      const extension = mimeType.split('/')[1] || 'jpg'
      
      const buffer = Buffer.from(base64Data, 'base64')
      
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `attachment; filename="${orderItem.photoName.replace(/[^a-zA-Z0-9.-]/g, '_')}.${extension}"`)
      res.setHeader('Content-Length', buffer.length)
      
      return res.send(buffer)
    } else {
      // If it's a URL, redirect or handle accordingly
      return res.redirect(orderItem.photoUrl)
    }
  } catch (error) {
    console.error('Error downloading photo:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to download photo. Please try again.'
    })
  }
})

// Get admin dashboard stats
app.get('/api/admin/dashboard', authenticateAdmin, async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query

    // Build date filter based on range parameter
    let dateFilter = {}
    let defaultRange = true

    if (range === 'today') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      dateFilter = {
        gte: today,
        lt: tomorrow
      }
      defaultRange = false
    } else if (range === '7' || (!range && !startDate && !endDate)) {
      // Default to last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      dateFilter = {
        gte: sevenDaysAgo
      }
    } else if (range === '30') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      thirtyDaysAgo.setHours(0, 0, 0, 0)
      dateFilter = {
        gte: thirtyDaysAgo
      }
      defaultRange = false
    } else if (range === 'full') {
      // No date filter - all data
      dateFilter = {}
      defaultRange = false
    } else if (startDate && endDate) {
      // Custom date range
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilter = {
        gte: start,
        lte: end
      }
      defaultRange = false
    } else {
      // Default to last 7 days if invalid range
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      sevenDaysAgo.setHours(0, 0, 0, 0)
      dateFilter = {
        gte: sevenDaysAgo
      }
    }

    // Build where clause for all queries
    const baseWhere = Object.keys(dateFilter).length > 0 ? { createdAt: dateFilter } : {}

    // Get counts with date filter
    const totalOrders = await prisma.order.count({
      where: baseWhere
    })
    const newOrders = await prisma.order.count({
      where: {
        ...baseWhere,
        orderStatus: { notIn: ['COMPLETED', 'REJECTED', 'CANCELLED'] }
      }
    })
    const completedOrders = await prisma.order.count({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED'
      }
    })

    // Calculate total revenue (COMPLETED orders only - PAID or COD)
    // Revenue includes: COMPLETED orders where (payment_status = 'PAID' OR payment_mode = 'COD')
    const revenueData = await prisma.order.aggregate({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED',
        OR: [
          { paymentStatus: 'PAID' },
          { paymentMode: 'COD' }
        ]
      },
      _sum: {
        totalAmount: true
      }
    })

    const totalRevenue = parseFloat(revenueData._sum.totalAmount || 0)

    // Calculate total magnets made (sum of quantities from COMPLETED orders)
    const completedOrdersWithItems = await prisma.order.findMany({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED'
      },
      include: {
        orderItems: true
      }
    })

    const totalMagnets = completedOrdersWithItems.reduce((sum, order) => {
      const orderQuantity = order.orderItems.reduce((itemSum, item) => itemSum + item.quantity, 0)
      return sum + orderQuantity
    }, 0)

    // Payment Insights - COD vs Online (COMPLETED orders only)
    const codOrdersCount = await prisma.order.count({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED',
        paymentMode: 'COD'
      }
    })

    const onlineOrdersCount = await prisma.order.count({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED',
        paymentMode: 'ONLINE'
      }
    })

    const codRevenueData = await prisma.order.aggregate({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED',
        paymentMode: 'COD'
      },
      _sum: {
        totalAmount: true
      }
    })

    const onlineRevenueData = await prisma.order.aggregate({
      where: {
        ...baseWhere,
        orderStatus: 'COMPLETED',
        paymentMode: 'ONLINE'
      },
      _sum: {
        totalAmount: true
      }
    })

    const codRevenue = parseFloat(codRevenueData._sum.totalAmount || 0)
    const onlineRevenue = parseFloat(onlineRevenueData._sum.totalAmount || 0)

    // Get day-wise order count based on date filter
    let dayWiseOrders = []
    let dateRange = []

    if (range === 'today') {
      // Single day
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateRange = [{ date: today, label: 'Today' }]
    } else if (range === 'full' || (startDate && endDate)) {
      // Custom range or full - need to determine date range
      let start, end
      if (startDate && endDate) {
        start = new Date(startDate)
        start.setHours(0, 0, 0, 0)
        end = new Date(endDate)
        end.setHours(23, 59, 59, 999)
      } else {
        // Full range - get all orders and determine min/max dates
        const allOrders = await prisma.order.findMany({
          select: { createdAt: true },
          orderBy: { createdAt: 'asc' }
        })
        if (allOrders.length > 0) {
          start = new Date(allOrders[0].createdAt)
          start.setHours(0, 0, 0, 0)
          end = new Date(allOrders[allOrders.length - 1].createdAt)
          end.setHours(23, 59, 59, 999)
        } else {
          start = new Date()
          end = new Date()
        }
      }

      // Generate date range
      const current = new Date(start)
      while (current <= end) {
        dateRange.push({ date: new Date(current), label: current.toISOString().split('T')[0] })
        current.setDate(current.getDate() + 1)
      }
    } else {
      // Default 7 days or 30 days
      const days = range === '30' ? 30 : 7
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        date.setHours(0, 0, 0, 0)
        dateRange.push({ date, label: date.toISOString().split('T')[0] })
      }
    }

    // Get orders grouped by date
    if (dateRange.length > 0) {
      dayWiseOrders = await prisma.order.groupBy({
        by: ['createdAt'],
        where: baseWhere,
        _count: {
          id: true
        }
      })
    }

    // Format day-wise data
    const dayWiseData = dateRange.map(({ date, label }) => {
      const count = dayWiseOrders.filter(order => {
        const orderDate = new Date(order.createdAt)
        orderDate.setHours(0, 0, 0, 0)
        return orderDate.getTime() === date.getTime()
      }).reduce((sum, order) => sum + order._count.id, 0)

      return {
        date: label,
        count
      }
    })

    res.json({
      success: true,
      stats: {
        totalOrders,
        newOrders,
        completedOrders,
        totalRevenue: totalRevenue.toFixed(2),
        totalMagnets,
        codOrdersCount,
        onlineOrdersCount,
        codRevenue: codRevenue.toFixed(2),
        onlineRevenue: onlineRevenue.toFixed(2)
      },
      dayWiseData
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats. Please try again.'
    })
  }
})

// ==================== PAYMENT ENDPOINTS ====================

// Create Razorpay payment order
app.post('/api/payment/create', authenticateUser, async (req, res) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        success: false,
        message: 'Online payment service not configured. Please contact support.'
      })
    }

    const { orderId, amount } = req.body

    // Validate input
    if (!orderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and amount are required'
      })
    }

    // Fetch order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: true
      }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Verify order belongs to user
    if (order.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      })
    }

    // Validate amount matches order total
    const expectedAmount = parseFloat(order.totalAmount) * 100 // Convert to paise
    if (Math.abs(amount - expectedAmount) > 1) {
      return res.status(400).json({
        success: false,
        message: 'Amount mismatch with order total'
      })
    }

    // Allow payment for COD orders (Pay Now feature) or ONLINE orders
    if (!['COD', 'ONLINE'].includes(order.paymentMode)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment mode'
      })
    }

    // Check if COD order is already paid
    if (order.paymentMode === 'COD' && order.paymentStatus === 'PAID') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      })
    }

    // Calculate total quantity for description
    const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const orderTypeLabel = (order.orderType === 'POLAROID') ? 'Polaroid Print(s)' : 'Fridge Magnet(s)'

    // Create Razorpay order
    const razorpayOptions = {
      amount: Math.round(expectedAmount),
      currency: 'INR',
      receipt: `order_${order.id}`,
      notes: {
        orderId: order.id,
        totalQuantity: totalQuantity.toString(),
        description: `${totalQuantity} Custom Photo ${orderTypeLabel}`
      }
    }

    const razorpayOrder = await razorpay.orders.create(razorpayOptions)

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING'
      }
    })

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    })
  } catch (error) {
    console.error('Error creating payment order:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order. Please try again.'
    })
  }
})

// Verify payment
app.post('/api/payment/verify', authenticateUser, async (req, res) => {
  try {
    if (!razorpay || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact support.'
      })
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'All payment details are required'
      })
    }

    // Fetch order and payment
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true }
    })

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    // Verify order belongs to user
    if (order.userId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this order'
      })
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (generatedSignature !== razorpay_signature) {
      await prisma.payment.updateMany({
        where: {
          orderId: orderId,
          razorpayOrderId: razorpay_order_id
        },
        data: {
          status: 'FAILED'
        }
      })

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      })
    }

    // Payment verified successfully
    await prisma.payment.updateMany({
      where: {
        orderId: orderId,
        razorpayOrderId: razorpay_order_id
      },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'SUCCESS'
      }
    })

    // Update order payment status and mode (for COD orders converting to ONLINE)
    const updateData = {
      paymentStatus: 'PAID'
    }
    
    // If order was COD, convert to ONLINE
    if (order.paymentMode === 'COD') {
      updateData.paymentMode = 'ONLINE'
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData
    })

    res.json({
      success: true,
      message: 'Payment verified successfully',
      orderId: order.id
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({
      success: false,
      message: 'Payment verification failed. Please contact support.'
    })
  }
})

// Contact form submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      })
    }

    console.log('Contact form submission:', { name, email, message })

    res.json({
      success: true,
      message: 'Message received. We will get back to you soon!'
    })
  } catch (error) {
    console.error('Error processing contact form:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again.'
    })
  }
})

// ==================== EVENT BOOKING ENDPOINTS ====================

// Book event (public endpoint)
app.post('/api/events/book', async (req, res) => {
  try {
    const { eventType, eventDate, timeSlot, location, expectedGuests, contactName, contactPhone, notes } = req.body

    // Validate required fields
    if (!eventType || !eventDate || !timeSlot || !location || !expectedGuests || !contactName || !contactPhone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      })
    }

    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(contactPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      })
    }

    // Validate event date is in the future
    const eventDateObj = new Date(eventDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (eventDateObj < today) {
      return res.status(400).json({
        success: false,
        message: 'Event date must be in the future'
      })
    }

    // Validate expected guests is positive
    if (expectedGuests < 1) {
      return res.status(400).json({
        success: false,
        message: 'Expected guests must be at least 1'
      })
    }

    // Create event booking
    const booking = await prisma.eventBooking.create({
      data: {
        eventType,
        eventDate: eventDateObj,
        timeSlot,
        location: location.trim(),
        expectedGuests: parseInt(expectedGuests),
        contactName: contactName.trim(),
        contactPhone: contactPhone.trim(),
        notes: notes ? notes.trim() : null,
        status: 'NEW'
      }
    })

    res.json({
      success: true,
      message: 'Booking request received. We\'ll contact you shortly.',
      booking: {
        id: booking.id,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        timeSlot: booking.timeSlot
      }
    })
  } catch (error) {
    console.error('Error creating event booking:', error)
    // Provide more specific error message
    let errorMessage = 'Failed to submit booking request. Please try again.'
    if (error.code === 'P2003' || error.message?.includes('Foreign key constraint')) {
      errorMessage = 'Database error: Please ensure all required tables exist. Run database migrations.'
    } else if (error.message?.includes('doesn\'t exist') || error.message?.includes('Unknown table')) {
      errorMessage = 'Database error: EventBooking table not found. Please run: npx prisma migrate dev'
    } else if (error.message) {
      errorMessage = error.message
    }
    res.status(500).json({
      success: false,
      message: errorMessage
    })
  }
})

// Get admin notification counts (new orders + new events)
app.get('/api/admin/notifications', authenticateAdmin, async (req, res) => {
  try {
    // Count new orders (status = "NEW")
    const newOrdersCount = await prisma.order.count({
      where: {
        orderStatus: 'NEW'
      }
    })

    // Count new event bookings (status = "NEW")
    const newEventsCount = await prisma.eventBooking.count({
      where: {
        status: 'NEW'
      }
    })

    res.json({
      success: true,
      newOrdersCount,
      newEventsCount
    })
  } catch (error) {
    console.error('Error fetching admin notifications:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification counts'
    })
  }
})

// Get all event bookings (admin only)
app.get('/api/admin/events', authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.query

    const whereClause = {}
    if (status && ['NEW', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      whereClause.status = status.toUpperCase()
    }

    const bookings = await prisma.eventBooking.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc' // Latest bookings first (like orders)
      }
    })

    res.json({
      success: true,
      bookings: bookings.map(booking => ({
        id: booking.id,
        eventType: booking.eventType,
        eventDate: booking.eventDate,
        timeSlot: booking.timeSlot,
        location: booking.location,
        expectedGuests: booking.expectedGuests,
        contactName: booking.contactName,
        contactPhone: booking.contactPhone,
        notes: booking.notes,
        status: booking.status,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt
      }))
    })
  } catch (error) {
    console.error('Error fetching event bookings:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event bookings. Please try again.'
    })
  }
})

// Update event booking status (admin only)
app.patch('/api/admin/events/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be CONFIRMED or CANCELLED'
      })
    }

    const booking = await prisma.eventBooking.findUnique({
      where: { id }
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Event booking not found'
      })
    }

    const updatedBooking = await prisma.eventBooking.update({
      where: { id },
      data: { status }
    })

    res.json({
      success: true,
      message: `Event booking ${status.toLowerCase()} successfully`,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status
      }
    })
  } catch (error) {
    console.error('Error updating event booking status:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update event booking status. Please try again.'
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})

// Handle port already in use error
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use!`)
    console.error(`\nTo fix this, run one of these commands:`)
    console.error(`  1. Kill the process: kill -9 $(lsof -ti:${PORT})`)
    console.error(`  2. Or use a different port by setting PORT in .env file`)
    process.exit(1)
  } else {
    throw err
  }
})
