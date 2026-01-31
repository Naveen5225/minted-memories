import { useState, useEffect, useRef } from 'react'

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

const galleryImages = [g1, g2, g3, g4, g5, g6, g7, g8, g9, g10]

// Duplicate for infinite circular scroll (no jump back to start)
const circularImages = [...galleryImages, ...galleryImages]

const CARD_WIDTH_MOBILE = 280
const CARD_WIDTH_DESKTOP = 320
const GAP = 16
const AUTO_SCROLL_INTERVAL = 2500
// Wrap when this close to the end/start of one "lap" so the circle is seamless
const WRAP_THRESHOLD = 20

function ProductGallery() {
  const [isPaused, setIsPaused] = useState(false)
  const [cardWidth, setCardWidth] = useState(CARD_WIDTH_DESKTOP)
  const scrollRef = useRef(null)
  const autoScrollTimerRef = useRef(null)
  const resumeTimerRef = useRef(null)
  const lastScrollLeftRef = useRef(0)
  const isWrappingRef = useRef(false)

  const total = galleryImages.length
  const step = cardWidth + GAP
  const firstSetWidth = total * step - GAP

  useEffect(() => {
    const updateWidth = () => {
      setCardWidth(window.innerWidth < 640 ? CARD_WIDTH_MOBILE : CARD_WIDTH_DESKTOP)
    }
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  // Circular scroll: when last photo passes, next is first again — wrap position so it never jumps visibly
  const handleScroll = () => {
    const el = scrollRef.current
    if (!el || isWrappingRef.current) return

    const scrollLeft = el.scrollLeft

    // Reached/passed end of first "lap" (showing duplicate) → jump back to start of first lap (same visual = circle)
    if (scrollLeft >= firstSetWidth - WRAP_THRESHOLD) {
      isWrappingRef.current = true
      el.scrollLeft = Math.max(0, scrollLeft - firstSetWidth)
      lastScrollLeftRef.current = el.scrollLeft
      isWrappingRef.current = false
    }
    // At start and user scrolled left → jump to end of first lap so they can keep going left (circle)
    else if (scrollLeft <= WRAP_THRESHOLD && scrollLeft < lastScrollLeftRef.current) {
      isWrappingRef.current = true
      el.scrollLeft = scrollLeft + firstSetWidth
      lastScrollLeftRef.current = el.scrollLeft
      isWrappingRef.current = false
    } else {
      lastScrollLeftRef.current = scrollLeft
    }

    setIsPaused(true)
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 2000)
  }

  // Auto-advance: always scroll right by step; wrap is handled in onScroll
  useEffect(() => {
    if (total === 0 || isPaused) return

    autoScrollTimerRef.current = setInterval(() => {
      if (!scrollRef.current) return
      const el = scrollRef.current
      el.scrollTo({ left: el.scrollLeft + step, behavior: 'smooth' })
    }, AUTO_SCROLL_INTERVAL)

    return () => {
      if (autoScrollTimerRef.current) clearInterval(autoScrollTimerRef.current)
    }
  }, [total, isPaused, step])

  const handleMouseEnter = () => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current)
      resumeTimerRef.current = null
    }
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 1500)
  }

  const goPrev = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: scrollRef.current.scrollLeft - step, behavior: 'smooth' })
    handleMouseEnter()
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 2000)
  }

  const goNext = () => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTo({ left: scrollRef.current.scrollLeft + step, behavior: 'smooth' })
    handleMouseEnter()
    resumeTimerRef.current = setTimeout(() => setIsPaused(false), 2000)
  }

  return (
    <section
      className="relative py-6 sm:py-8 overflow-hidden border-t border-b border-gray-100"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Light background */}
      <div className="absolute inset-0 bg-gray-50/80" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact header */}
        <div className="text-center mb-5 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            <span className="text-gradient">Gallery</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1 max-w-md mx-auto">
            Memories as magnets & polaroids
          </p>
        </div>

        {/* Strip: arrows + scroll */}
        <div className="relative flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={goPrev}
            className="flex-shrink-0 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:shadow-md transition-all"
            aria-label="Previous"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory py-1 -mx-1"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <div className="flex" style={{ minWidth: 'min-content', gap: GAP }}>
              {circularImages.map((src, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 snap-center"
                  style={{ width: cardWidth }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 hover:shadow-lg hover:ring-2 hover:ring-purple-200 transition-all duration-200">
                    <img
                      src={src}
                      alt={`Gallery ${(index % galleryImages.length) + 1}`}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={goNext}
            className="flex-shrink-0 z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-200 hover:shadow-md transition-all"
            aria-label="Next"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <p className="text-center text-gray-400 text-xs mt-3">
          Hover to pause • Scroll or use arrows
        </p>
      </div>
    </section>
  )
}

export default ProductGallery
