import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const serviceSections = [
  {
    id: 'magnets',
    title: 'Custom Fridge Magnets',
    tagline: 'Turn your photos into beautiful keepsakes',
    description: 'Upload your favourite memories and we’ll print them on premium, strong fridge magnets. Perfect for gifts, home decor, or preserving moments. Fast delivery in 2–3 days.',
    features: ['Premium print quality', 'Strong magnet backing', 'Multiple shapes & sizes', '2–3 day delivery'],
    gradient: 'from-indigo-500 to-purple-600',
    bgGradient: 'from-indigo-50 to-purple-50',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    cta: 'Order Magnets',
    ctaLink: '/#order-section'
  },
  {
    id: 'polaroids',
    title: 'Polaroid-Style Prints',
    tagline: 'Vintage charm, modern quality',
    description: 'Classic white border, vintage matte, or custom captions—get beautiful polaroid-style prints from your photos. Same easy flow as magnets: upload, choose style, get delivered.',
    features: ['Classic & vintage styles', 'Custom text captions', 'Premium paper', 'Same-day processing'],
    gradient: 'from-rose-500 to-pink-600',
    bgGradient: 'from-rose-50 to-pink-50',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      </svg>
    ),
    cta: 'Order Polaroids',
    ctaLink: '/?tab=polaroid#order-section'
  },
  {
    id: 'frames',
    title: 'Custom Aesthetic Photo Frames',
    tagline: 'Frame your moments beautifully',
    description: 'Choose from a range of aesthetic frames—minimal, vintage, or bold—and we’ll print your photo ready to hang or gift. Perfect for walls, desks, and special occasions.',
    features: ['Multiple frame styles', 'Print + frame options', 'Gift-ready packaging', 'Custom sizes'],
    gradient: 'from-amber-500 to-orange-600',
    bgGradient: 'from-amber-50 to-orange-50',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    cta: 'Coming Soon',
    ctaLink: '/contact'
  },
  {
    id: 'events',
    title: 'Event Coverage',
    tagline: 'Live photo magnets at your event',
    description: 'Book Minted Memories for birthdays, weddings, anniversaries, and corporate events. We bring the setup; guests get instant custom magnets. Unforgettable keepsakes on the spot.',
    features: ['On-site printing', 'Multiple event types', 'Flexible time slots', 'Request a quote'],
    gradient: 'from-emerald-500 to-teal-600',
    bgGradient: 'from-emerald-50 to-teal-50',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    cta: 'Book an Event',
    ctaLink: '/#events'
  }
]

function Services() {
  // Scroll to top when landing on Services page (e.g. from "Explore Services" on Home)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <Navbar />

      {/* Hero */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/80 via-purple-50/60 to-pink-100/50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-gradient">Services</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            From custom magnets and polaroids to photo frames and live event coverage—we help you turn moments into lasting memories.
          </p>
        </div>
      </section>

      {/* Service sections */}
      <section className="relative py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {serviceSections.map((service, index) => (
            <div
              key={service.id}
              id={service.id}
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${service.bgGradient} border border-white/80 shadow-xl shadow-gray-200/50`}
            >
              <div className="p-8 sm:p-10 md:p-12">
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                      {service.title}
                    </h2>
                    <p className="text-lg text-gray-600 font-medium mb-4">
                      {service.tagline}
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                      {service.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-8">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={service.ctaLink}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${service.gradient} shadow-md hover:shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
                    >
                      {service.cta}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-16 sm:py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Ready to create something special?
          </h2>
          <p className="text-gray-600 mb-8">
            Start with custom magnets or polaroids on the home page, or get in touch for events and frames.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-white gradient-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
            >
              Order Now
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Services
