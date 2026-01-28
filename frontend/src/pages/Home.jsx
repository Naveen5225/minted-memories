import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductGallery from '../components/ProductGallery'
import OrderSection from '../components/OrderSection'
import Footer from '../components/Footer'

function Home() {
  const [orderSuccess, setOrderSuccess] = useState(false)
  const navigate = useNavigate()

  const handleOrderClick = (photosData, addressData) => {
    if (addressData) {
      // Order was placed successfully
      setOrderSuccess(true)
      setTimeout(() => {
        setOrderSuccess(false)
        navigate('/orders')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navbar />

      {orderSuccess && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-800 font-medium">Order placed successfully! Redirecting to orders page...</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero + Order Section Combined */}
      <OrderSection onOrderClick={handleOrderClick} />
      
      {/* Product Gallery Below */}
      <ProductGallery />

      <Footer />
    </div>
  )
}

export default Home
