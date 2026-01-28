import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import ConfirmationModal from '../components/ConfirmationModal'

function Orders() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingPayment, setProcessingPayment] = useState(null)
  const [cancelling, setCancelling] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
      return
    }
    fetchOrders()
  }, [isAuthenticated, navigate])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/orders/user')
      if (response.data.success) {
        setOrders(response.data.orders)
      } else {
        setError('Failed to fetch orders')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePayNow = async (order) => {
    try {
      setProcessingPayment(order.id)
      
      // Create Razorpay payment order
      const paymentResponse = await axios.post('/api/payment/create', {
        orderId: order.id,
        amount: Math.round(order.totalAmount * 100) // Convert to paise
      })

      if (!paymentResponse.data.success) {
        throw new Error(paymentResponse.data.message || 'Failed to create payment order')
      }

      const { orderId: razorpayOrderId, amount, key } = paymentResponse.data

      // Load Razorpay script if not already loaded
      const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
          if (window.Razorpay) {
            resolve()
            return
          }

          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Razorpay script'))
          document.body.appendChild(script)
        })
      }

      await loadRazorpayScript()

      const totalQuantity = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

      const options = {
        key: key,
        amount: amount,
        currency: 'INR',
        name: 'Minted Memories',
        description: `${totalQuantity} Custom Photo Fridge Magnet(s)`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id
            })

            if (verifyResponse.data.success) {
              // Refresh orders to show updated payment status
              fetchOrders()
              alert('Payment successful! Your order has been paid.')
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          } catch (err) {
            alert(err.response?.data?.message || 'Payment verification failed. Please contact support.')
          } finally {
            setProcessingPayment(null)
          }
        },
        prefill: {
          name: order.customerName,
          contact: order.phone,
          email: ''
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(null)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to initiate payment. Please try again.')
      setProcessingPayment(null)
    }
  }

  const handleCancel = async () => {
    if (!selectedOrderId) return
    
    try {
      setCancelling(selectedOrderId)
      const response = await axios.patch(`/api/orders/${selectedOrderId}/cancel`)

      if (response.data.success) {
        setShowCancelModal(false)
        setSelectedOrderId(null)
        fetchOrders()
        alert('Order cancelled successfully')
      } else {
        alert(response.data.message || 'Failed to cancel order')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'NEW':
        return 'New'
      case 'ACCEPTED':
        return 'Accepted'
      case 'REJECTED':
        return 'Rejected'
      case 'CANCELLED':
        return 'Cancelled'
      case 'COMPLETED':
        return 'Completed'
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            My <span className="text-gradient">Orders</span>
          </h1>
          <p className="text-gray-600">Track and manage all your orders</p>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="gradient-border mb-6">
            <div className="gradient-border-inner p-4 bg-red-50 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="gradient-border">
            <div className="gradient-border-inner p-12 text-center bg-white">
              <div className="mb-6">
                <svg className="w-24 h-24 text-purple-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No orders yet</h3>
              <p className="text-gray-600 mb-8">You haven't placed any orders yet.</p>
              <Link
                to="/"
                className="inline-block gradient-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="gradient-border">
                <div className="gradient-border-inner bg-white overflow-hidden">
                  <div className="p-6 sm:p-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 pb-4 border-b border-purple-100">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(order.orderStatus)}`}>
                        {getStatusText(order.orderStatus)}
                      </span>
                    </div>

                    {/* Order Items */}
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mb-6">
                        <p className="text-sm font-bold text-gray-700 mb-4">Photos Ordered:</p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {order.orderItems.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-gradient-to-br from-gray-50 to-purple-50 rounded-xl border border-purple-100">
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0 ring-2 ring-purple-100">
                                <img
                                  src={item.photoUrl}
                                  alt={item.photoName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate">{item.photoName}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gradient">₹{(item.quantity * item.pricePerUnit).toFixed(2)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Order Details Grid */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Magnets</p>
                        <p className="font-bold text-lg text-gray-900">{order.totalQuantity || 0} Magnet{(order.totalQuantity || 0) !== 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment Mode</p>
                        <p className="font-bold text-lg text-gray-900">{order.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                        <p className={`font-bold text-lg ${
                          order.paymentStatus === 'PAID' ? 'text-green-600' : 
                          order.paymentStatus === 'PENDING' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {order.paymentStatus === 'PAID' ? 'Paid' : 
                           order.paymentStatus === 'PENDING' ? 'Pending' : 
                           'Failed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Total Amount</p>
                        <p className="font-bold text-lg text-gradient">₹{order.totalAmount.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-1">Tracking</p>
                          <p className="text-sm text-gray-700">
                            {order.orderStatus === 'NEW' && 'Your order is being prepared'}
                            {order.orderStatus === 'ACCEPTED' && 'Your order has been accepted and is being processed'}
                            {order.orderStatus === 'REJECTED' && 'Your order has been rejected'}
                            {order.orderStatus === 'CANCELLED' && 'Your order has been cancelled'}
                            {order.orderStatus === 'COMPLETED' && 'Your order has been completed'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t border-purple-100">
                      {/* Pay Now button for COD orders */}
                      {order.paymentMode === 'COD' && 
                       order.paymentStatus === 'PENDING' && 
                       !['CANCELLED', 'REJECTED'].includes(order.orderStatus) && (
                        <button
                          onClick={() => handlePayNow(order)}
                          disabled={processingPayment === order.id}
                          className="flex-1 sm:flex-none gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {processingPayment === order.id ? 'Processing...' : 'Pay Now'}
                        </button>
                      )}

                      {/* Cancel Order button - Only show for NEW orders */}
                      {order.orderStatus === 'NEW' && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setShowCancelModal(true)
                          }}
                          disabled={cancelling === order.id}
                          className="flex-1 sm:flex-none bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {cancelling === order.id ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false)
          setSelectedOrderId(null)
        }}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order?"
        confirmText="Cancel Order"
        cancelText="Keep Order"
        variant="danger"
      />
    </div>
  )
}

export default Orders
