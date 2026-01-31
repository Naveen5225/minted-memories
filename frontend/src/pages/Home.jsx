import { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ProductGallery from '../components/ProductGallery'
import OrderSection from '../components/OrderSection'
import EventBookingForm from '../components/EventBookingForm'
import Footer from '../components/Footer'

function Home() {
  const [orderSuccess, setOrderSuccess] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Scroll to section when landing with hash (e.g. from Services page)
  useEffect(() => {
    const hash = location.hash || window.location.hash
    if (hash === '#order-section' || hash === '#events') {
      const id = hash.slice(1)
      const el = document.getElementById(id)
      if (el) {
        const timer = setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [location.pathname, location.hash])

  const initialOrderType = searchParams.get('tab') === 'polaroid' ? 'POLAROID' : undefined

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
      <section id="order-section">
        <OrderSection onOrderClick={handleOrderClick} initialOrderType={initialOrderType} />
      </section>
      
      {/* Event Booking Section */}
      <section id="events">
        <EventBookingForm />
      </section>

      {/* Services We Offer – Overview */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-pink-50/60" />
        <div className="absolute top-10 right-0 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="absolute bottom-10 left-0 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Services We <span className="text-gradient">Offer</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From custom magnets and polaroids to photo frames and live event coverage—we turn your moments into lasting memories.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-lg shadow-gray-200/50 p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Magnets</h3>
              <p className="text-sm text-gray-600">Custom fridge magnets from your photos</p>
            </div>
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-lg shadow-gray-200/50 p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Polaroids</h3>
              <p className="text-sm text-gray-600">Vintage-style prints with custom captions</p>
            </div>
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-lg shadow-gray-200/50 p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Photo Frames</h3>
              <p className="text-sm text-gray-600">Aesthetic frames for your favourite shots</p>
            </div>
            <div className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-lg shadow-gray-200/50 p-6 text-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Events</h3>
              <p className="text-sm text-gray-600">Live photo magnets at your event</p>
            </div>
          </div>
          <div className="text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Services
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Product Gallery Below */}
      <ProductGallery />

      <Footer />
    </div>
  )
}

export default Home
