import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AddressForm from '../components/AddressForm'
import { useCart } from '../context/CartContext'

const PRICE_PER_MAGNET = 100
const DELIVERY_CHARGE = 50
const GST_RATE = 0.03

function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clearCart } = useCart()
  const [showAddressForm, setShowAddressForm] = useState(false)

  const photos = items
  const totalMagnets = photos.reduce((sum, photo) => sum + photo.quantity, 0)
  const subtotal = totalMagnets * PRICE_PER_MAGNET
  const gst = subtotal * GST_RATE
  const totalAmount = subtotal + DELIVERY_CHARGE + gst

  const handleOrderClick = (_photosData, addressData) => {
    if (addressData) {
      // After successful COD / online payment (from PaymentSummary),
      // AddressForm calls onSubmit and we arrive here.
      // Clear cart and go to orders page.
      clearCart()
      navigate('/orders')
    }
  }

  const handleAddressSubmit = (addressData) => {
    setShowAddressForm(false)
    // Prepare photos data (without file object, just metadata) for consistency
    const photosData = photos.map((photo) => ({
      photoName: photo.photoName,
      photoUrl: photo.photoUrl,
      quantity: photo.quantity,
    }))
    handleOrderClick(photosData, addressData)
  }

  const handleCloseForm = () => {
    setShowAddressForm(false)
  }

  const handleDirectQuantityChange = (id, value) => {
    const numeric = parseInt(value, 10)
    if (Number.isNaN(numeric)) {
      return
    }
    updateQuantity(id, numeric)
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Navbar />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Your <span className="text-gradient">Cart</span>
          </h1>
          {photos.length > 0 && (
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              {photos.length} {photos.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {photos.length === 0 && (
          <div className="gradient-border">
            <div className="gradient-border-inner p-12 text-center">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-purple-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start by uploading a photo on the home page to create your first beautiful fridge magnet.
              </p>
              <Link
                to="/"
                className="inline-block gradient-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-lg"
              >
                Create Magnets
              </Link>
            </div>
          </div>
        )}

        {photos.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="gradient-border"
                >
                  <div className="gradient-border-inner p-5 bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-purple-100">
                        <img
                          src={photo.photoUrl}
                          alt={photo.photoName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <h3 className="font-bold text-lg text-gray-900 truncate">
                          {photo.photoName}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₹{PRICE_PER_MAGNET} per magnet
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">Quantity:</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(photo.id, photo.quantity - 1)}
                              disabled={photo.quantity <= 1}
                              className="w-8 h-8 rounded-full border-2 border-purple-300 flex items-center justify-center text-sm font-bold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              −
                            </button>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={photo.quantity}
                              onChange={(e) =>
                                handleDirectQuantityChange(photo.id, e.target.value)
                              }
                              className="w-16 text-center text-sm font-bold text-gray-900 border-2 border-purple-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <button
                              onClick={() => updateQuantity(photo.id, photo.quantity + 1)}
                              disabled={photo.quantity >= 100}
                              className="w-8 h-8 rounded-full border-2 border-purple-300 flex items-center justify-center text-sm font-bold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gradient">
                            ₹{(photo.quantity * PRICE_PER_MAGNET).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(photo.id)}
                          className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          aria-label="Remove photo"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="gradient-border sticky top-24">
                <div className="gradient-border-inner p-6 bg-white">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Magnets:</span>
                      <span className="font-semibold text-gray-800">{totalMagnets}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold text-gray-800">
                        ₹{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-semibold text-gray-800">
                        ₹{DELIVERY_CHARGE}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (3%):</span>
                      <span className="font-semibold text-gray-800">
                        ₹{gst.toFixed(2)}
                      </span>
                    </div>
                    <div className="pt-4 border-t-2 border-purple-200 flex justify-between text-lg font-bold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gradient text-xl">₹{totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full gradient-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showAddressForm && photos.length > 0 && (
        <AddressForm
          photos={photos}
          subtotal={subtotal}
          totalAmount={totalAmount}
          onClose={handleCloseForm}
          onSubmit={handleAddressSubmit}
        />
      )}
    </div>
  )
}

export default Cart
