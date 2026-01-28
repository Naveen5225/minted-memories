import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              © {new Date().getFullYear()} mintedmemories
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Custom fridge magnets made from your favourite memories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <a
              href="https://www.instagram.com/mintedmemories9?igsh=cTEyNTJjenJtOGZi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-50 text-pink-600 text-xs font-semibold">
                IG
              </span>
              <span>Instagram</span>
            </a>
            <a
              href="tel:+917842041709"
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-purple-600 text-xs font-semibold">
                📞
              </span>
              <span>Phone</span>
            </a>
            <a
              href="https://wa.me/917842041709"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600 text-xs font-semibold">
                WA
              </span>
              <span>WhatsApp</span>
            </a>
            <a
              href="mailto:mintedminds9@gmail.com"
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
                ✉
              </span>
              <span>Gmail</span>
            </a>
            <Link
              to="/contact"
              className="flex items-center gap-2 hover:text-purple-600 transition-colors"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-semibold">
                →
              </span>
              <span>Contact us</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

