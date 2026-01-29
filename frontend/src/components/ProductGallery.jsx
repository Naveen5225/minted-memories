import { useState, useEffect, useRef } from 'react'

// Import gallery images - user will add these to assets folder
import g1 from '../assets/g1.png'
import g2 from '../assets/g2.png'
import g3 from '../assets/g3.png'
import g4 from '../assets/g4.png'
import g5 from '../assets/g5.png'
import g6 from '../assets/g6.png'
import g7 from '../assets/g7.png'
import g8 from '../assets/g8.png'
import g9 from '../assets/g9.png'
import g10 from '../assets/g10.png'

function ProductGallery() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [imagesPerView, setImagesPerView] = useState(3)
  const scrollContainerRef = useRef(null)
  const autoScrollIntervalRef = useRef(null)

  const galleryImages = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10]
  const totalImages = galleryImages.length
  const maxIndex = Math.max(0, totalImages - imagesPerView)

  // Update imagesPerView based on screen size
  useEffect(() => {
    const updateImagesPerView = () => {
      if (window.innerWidth < 640) {
        setImagesPerView(1) // Mobile: 1 image
      } else {
        setImagesPerView(3) // Desktop: 3 images
      }
    }

    updateImagesPerView()
    window.addEventListener('resize', updateImagesPerView)
    return () => window.removeEventListener('resize', updateImagesPerView)
  }, [])

  // Auto-scroll every 1 second
  useEffect(() => {
    if (!isPaused) {
      autoScrollIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= maxIndex) {
            return 0 // Loop back to start
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [isPaused, maxIndex])

  // Update scroll position when currentIndex changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const itemWidth = container.scrollWidth / totalImages
      const scrollPosition = currentIndex * itemWidth * imagesPerView
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, imagesPerView, totalImages])

  // Handle manual scroll
  const handleScroll = (e) => {
    const container = e.target
    const scrollLeft = container.scrollLeft
    const itemWidth = container.scrollWidth / totalImages
    const newIndex = Math.round(scrollLeft / (itemWidth * imagesPerView))
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex <= maxIndex) {
      setCurrentIndex(newIndex)
      // Pause auto-scroll when user manually scrolls
      setIsPaused(true)
      // Resume after 3 seconds of no interaction
      setTimeout(() => setIsPaused(false), 3000)
    }
  }

  // Handle mouse enter/leave to pause/resume
  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  // Navigation buttons
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex))
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0))
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000)
  }

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-gradient">Gallery</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            See how your memories come to life as premium fridge magnets
          </p>
        </div>

        {/* Gallery Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute left-2 sm:left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95 border border-purple-200"
            aria-label="Previous images"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNext}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="absolute right-2 sm:right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm p-2 sm:p-3 rounded-full shadow-lg hover:bg-white transition-all transform hover:scale-110 active:scale-95 border border-purple-200"
            aria-label="Next images"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Scrollable Gallery */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-2"
          >
            {galleryImages.map((img, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-1/3 snap-center group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ring-2 ring-transparent hover:ring-purple-300 bg-white p-2">
                  <img
                    src={img}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Fallback if image doesn't exist yet
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                          <span class="text-purple-400 text-sm">g${index + 1}</span>
                        </div>
                      `
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsPaused(true)
                  setTimeout(() => setIsPaused(false), 3000)
                }}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

    </section>
  )
}

export default ProductGallery
