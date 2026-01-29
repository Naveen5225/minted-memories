import { useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import SignInPopup from './SignInPopup'
import OrderSuccessModal from './OrderSuccessModal'

function PaymentSummary({ photos, subtotal, totalAmount, address, onBack, onClose, onSubmit }) {
  const { isAuthenticated } = useAuth()
  const [paymentMode, setPaymentMode] = useState('COD')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const DELIVERY_CHARGE = 50
  const GST_RATE = 0.03 // 3%
  const PRICE_PER_MAGNET = 100

  const handlePlaceOrder = async () => {
    // Check authentication first
    if (!isAuthenticated) {
      setShowSignIn(true)
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // Prepare photos data (without file objects) - preserve orderType per item
      const photosData = photos.map(photo => {
        const itemOrderType = photo.orderType || 'MAGNET'
        
        // CRITICAL: Validate orderType exists
        if (!photo.orderType) {
          throw new Error(`Missing orderType for photo: ${photo.photoName}`)
        }
        
        return {
          photoName: photo.photoName,
          photoUrl: photo.photoUrl,
          quantity: photo.quantity,
          pricePerUnit: 100, // PRICE_PER_MAGNET constant
          orderType: itemOrderType, // REQUIRED: Each item preserves its own orderType
          polaroidType: itemOrderType === 'POLAROID' ? (photo.polaroidType || null) : null,
          caption: itemOrderType === 'POLAROID' ? (photo.caption || null) : null
        }
      })

      // Create order (orderType is now per-item, not order-level)
      const orderResponse = await api.post('/api/orders/create', {
        photos: photosData,
        address,
        paymentMode
      })

      if (!orderResponse.data.success) {
        throw new Error(orderResponse.data.message || 'Failed to create order')
      }

      const order = orderResponse.data.order

      if (paymentMode === 'COD') {
        // COD - Order placed directly, show success modal.
        // We will trigger onSubmit (to clear cart / navigate) when user closes success modal.
        setIsProcessing(false)
        setShowSuccessModal(true)
        return
      } else {
        // Online payment - Create Razorpay order
        const paymentResponse = await api.post('/api/payment/create', {
          orderId: order.id,
          amount: Math.round(totalAmount * 100) // Convert to paise
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

        const totalQuantity = photos.reduce((sum, photo) => sum + photo.quantity, 0)
        const orderTypeLabel = orderType === 'POLAROID' ? 'Polaroid Print(s)' : 'Fridge Magnet(s)'

        const options = {
          key: key,
          amount: amount,
          currency: 'INR',
          name: 'Minted Memories',
          description: `${totalQuantity} Custom Photo ${orderTypeLabel}`,
          order_id: razorpayOrderId,
          handler: async function (response) {
            try {
              // Verify payment
              const verifyResponse = await api.post('/api/payment/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: order.id
              })

              if (verifyResponse.data.success) {
                onSubmit({
                  paymentMode: 'ONLINE',
                  orderId: order.id,
                  paymentId: response.razorpay_payment_id
                })
              } else {
                setError('Payment verification failed. Please contact support.')
                setIsProcessing(false)
              }
            } catch (err) {
              setError(err.response?.data?.message || 'Payment verification failed. Please contact support.')
              setIsProcessing(false)
            }
          },
          prefill: {
            name: address.fullName,
            contact: address.phone,
            email: ''
          },
          theme: {
            color: '#000000'
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false)
            }
          }
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (err) {
      console.error('Order placement error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to place order. Please try again.'
      setError(errorMessage)
      setIsProcessing(false)
    }
  }

  const totalQuantity = photos.reduce((sum, photo) => sum + photo.quantity, 0)

  return (
    <>
    {!showSuccessModal && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-100">
        <div className="p-6 border-b border-purple-100 flex justify-between items-center sticky top-0 bg-gradient-to-r from-white to-purple-50/30">
          <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded-lg hover:bg-purple-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Order Details - Photos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Photos</h3>
            <div className="space-y-3">
              {photos.map((photo, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                    <img
                      src={photo.photoUrl}
                      alt={photo.photoName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{photo.photoName}</p>
                    <p className="text-sm text-gray-600">Quantity: {photo.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{(photo.quantity * PRICE_PER_MAGNET).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-lg p-4 space-y-3 border border-purple-100">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Delivery Charges:</span>
              <span className="font-semibold text-gray-900">₹{DELIVERY_CHARGE}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">GST (3%):</span>
              <span className="font-semibold text-gray-900">₹{(subtotal * GST_RATE).toFixed(2)}</span>
            </div>
            <div className="pt-3 border-t border-purple-200 flex justify-between text-lg">
              <span className="font-bold text-gray-900">Total Amount:</span>
              <span className="font-bold text-gradient">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Mode</h3>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMode === 'COD' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="COD"
                  checked={paymentMode === 'COD'}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-gray-900">Cash on Delivery (COD)</div>
                  <div className="text-sm text-gray-600">Pay when you receive your order</div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                paymentMode === 'ONLINE' 
                  ? 'border-purple-500 bg-purple-50' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}>
                <input
                  type="radio"
                  name="paymentMode"
                  value="ONLINE"
                  checked={paymentMode === 'ONLINE'}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-gray-900">Online Payment</div>
                  <div className="text-sm text-gray-600">Pay securely with Razorpay</div>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onBack}
              disabled={isProcessing}
              className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="flex-1 gradient-primary text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isProcessing ? 'Processing...' : paymentMode === 'COD' ? 'Place Order' : 'Pay Now'}
            </button>
          </div>
        </div>
      </div>

      {showSignIn && (
        <SignInPopup
          onClose={() => setShowSignIn(false)}
          onSuccess={() => {
            setShowSignIn(false)
            // Retry placing order after successful login
            handlePlaceOrder()
          }}
        />
      )}
    </div>
    )}

    {showSuccessModal && (
      <OrderSuccessModal
        onClose={() => {
          setShowSuccessModal(false)
          // For COD flow, propagate success back up so Cart / parent can clear state.
          if (onSubmit) {
            onSubmit({
              paymentMode: 'COD'
            })
          }
        }}
      />
    )}
    </>
  )
}

export default PaymentSummary
