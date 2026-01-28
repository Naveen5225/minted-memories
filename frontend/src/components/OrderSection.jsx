import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import fridgeMagnetsImage from '../assets/fridge-magnets-hero.png'

function OrderSection() {
  const navigate = useNavigate()
  const { items, addItem, removeItem, updateQuantity } = useCart()
  const [currentPhoto, setCurrentPhoto] = useState(null)
  const [photoName, setPhotoName] = useState('')
  const fileInputRef = useRef(null)

  const PRICE_PER_MAGNET = 100
  const DELIVERY_CHARGE = 50
  const GST_RATE = 0.03
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png']

  const photos = items

  // Calculate totals
  const totalPhotos = photos.length
  const totalMagnets = photos.reduce((sum, photo) => sum + photo.quantity, 0)
  const subtotal = totalMagnets * PRICE_PER_MAGNET
  const gst = subtotal * GST_RATE
  const totalAmount = subtotal + DELIVERY_CHARGE + gst

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Only JPG and PNG files are allowed')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      alert('File size must be less than 5MB')
      return
    }

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (event) => {
      setCurrentPhoto({
        file: file,
        preview: event.target.result
      })
    }
    reader.readAsDataURL(file)
  }

  const handleAddPhoto = () => {
    if (!currentPhoto || !photoName.trim()) {
      alert('Please upload a photo and enter a name')
      return
    }

    const newPhoto = {
      id: Date.now().toString(),
      photoName: photoName.trim(),
      photoUrl: currentPhoto.preview, // Store as base64
      quantity: 1,
      file: currentPhoto.file
    }

    addItem(newPhoto)
    setCurrentPhoto(null)
    setPhotoName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (id) => {
    removeItem(id)
  }

  const handleQuantityChange = (id, delta) => {
    const target = photos.find((p) => p.id === id)
    const current = target?.quantity ?? 1
    const next = Math.max(1, Math.min(100, current + delta))
    updateQuantity(id, next)
  }

  const handleOrderNow = () => {
    if (photos.length === 0) {
      alert('Please add at least one photo')
      return
    }

    // Check if all photos have quantity
    const hasInvalidQuantity = photos.some(
      (photo) => !photo.quantity || photo.quantity < 1,
    )
    if (hasInvalidQuantity) {
      alert('All photos must have a quantity of at least 1')
      return
    }

    // Instead of going directly to address/payment from Home,
    // send user to Cart where they can review and place order.
    navigate('/cart')
  }

  return (
    <section className={`relative py-12 sm:py-16 lg:py-20 overflow-hidden ${photos.length > 0 ? 'pb-24 lg:pb-20' : ''}`}>
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-soft opacity-50"></div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero + Order Section - 2 Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-12">
          {/* Left Side - Headline & Trust Badges */}
          <div className="space-y-6 lg:pt-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                <span className="block text-gradient mt-2">Minted Memories...</span>
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Turn Your Photos Into
                <span className="block text-gradient mt-2">Beautiful Fridge Magnets</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
                Upload your memories, choose quantity, and get them delivered in 2–3 days
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-100">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Premium Print</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-100">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Strong Magnet</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-purple-100">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-semibold text-gray-700">Fast Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Side - Premium Order Card */}
          <div className="relative">
            <div className="gradient-border">
              <div className="gradient-border-inner p-6 sm:p-8">
                <div className="space-y-6">
                  {/* Upload Section */}
                  {photos.length === 0 && !currentPhoto && (
                    <div className="text-center py-6 space-y-4">
                      <div className="mx-auto w-full max-w-xs rounded-2xl overflow-hidden shadow-md border border-purple-100">
                        <img
                          src={fridgeMagnetsImage}
                          alt="Minted Memories custom fridge magnets"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-gray-500 text-sm">
                        Upload your first photo to start creating beautiful fridge magnets ✨
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Upload Your Photos
                    </label>
                    
                    <div className="space-y-4">
                      {/* Upload Button */}
                      <div className="border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all duration-200 cursor-pointer group">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/jpeg,image/jpg,image/png"
                          className="hidden"
                          id="photo-upload"
                        />
                        <label
                          htmlFor="photo-upload"
                          className="cursor-pointer flex flex-col items-center"
                        >
                          <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">Click to upload</span>
                          <span className="text-xs text-gray-500 mt-1">JPG or PNG, max 5MB</span>
                        </label>
                      </div>

                      {/* Current Photo Preview & Name Input */}
                      {currentPhoto && (
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 space-y-4 transition-all duration-300">
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-white shadow-sm flex-shrink-0 ring-2 ring-purple-200">
                              <img
                                src={currentPhoto.preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">
                                Photo Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={photoName}
                                onChange={(e) => setPhotoName(e.target.value)}
                                placeholder="e.g., Birthday Pic, Mom & Dad"
                                className="w-full px-3 py-2 text-sm border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
                              />
                            </div>
                          </div>
                          <button
                            onClick={handleAddPhoto}
                            className="w-full gradient-primary text-white py-2.5 px-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
                          >
                            Add Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Your Order - Below main card (like previous layout) */}
        {photos.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Order</h3>

            {/* Photos List */}
            <div className="space-y-4 mb-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:shadow-md transition-all"
                >
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img
                      src={photo.photoUrl}
                      alt={photo.photoName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {photo.photoName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      ₹{PRICE_PER_MAGNET} per magnet
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Quantity:</span>
                    <button
                      onClick={() => handleQuantityChange(photo.id, -1)}
                      disabled={photo.quantity <= 1}
                      className="w-8 h-8 rounded-full border border-purple-300 flex items-center justify-center font-semibold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      −
                    </button>
                    <span className="w-10 text-center font-semibold text-gray-900">
                      {photo.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(photo.id, 1)}
                      disabled={photo.quantity >= 100}
                      className="w-8 h-8 rounded-full border border-purple-300 flex items-center justify-center font-semibold text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      +
                    </button>
                    <span className="text-sm font-semibold text-gray-900 w-20 text-right">
                      ₹{(photo.quantity * PRICE_PER_MAGNET).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="text-red-500 hover:text-red-600 p-2"
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
              ))}
            </div>

            {/* Price Summary */}
            <div className="border-t border-purple-100 pt-6 space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Photos:</span>
                <span className="font-semibold">{totalPhotos}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Magnets:</span>
                <span className="font-semibold">{totalMagnets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Subtotal:</span>
                <span className="font-semibold text-gray-900">
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Delivery Charges:</span>
                <span className="font-semibold text-gray-900">
                  ₹{DELIVERY_CHARGE}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">GST (3%):</span>
                <span className="font-semibold text-gray-900">
                  ₹{gst.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-3 border-t border-purple-100">
                <span className="text-gray-900">Total Amount:</span>
                <span className="text-gradient">
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Go to Cart Button */}
            <button
              onClick={handleOrderNow}
              className="w-full mt-6 gradient-primary text-white py-4 px-6 rounded-xl font-bold text-lg hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-500/30"
            >
              Go to Cart
            </button>
          </div>
        )}

        {/* Sticky Price Bar for Mobile (when photos exist) */}
        {photos.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-purple-200 shadow-lg z-40 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-xl font-bold text-gradient">
                  ₹{totalAmount.toFixed(2)}
                </div>
              </div>
              <button
                onClick={handleOrderNow}
                className="flex-1 gradient-primary text-white py-3 px-6 rounded-xl font-bold hover:opacity-90 transition-all shadow-md"
              >
                Go to Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default OrderSection
