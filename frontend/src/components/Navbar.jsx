import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import api from '../api'
import SignInPopup from './SignInPopup'
import AdminLoginPopup from './AdminLoginPopup'

function Navbar() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth()
  const { items } = useCart()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [newEventsCount, setNewEventsCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)

  const cartItemCount = items.length

  // Fetch admin notification counts
  useEffect(() => {
    if (admin) {
      fetchAdminNotifications()
      const interval = setInterval(fetchAdminNotifications, 30000)
      return () => clearInterval(interval)
    } else {
      setNewOrdersCount(0)
      setNewEventsCount(0)
    }
  }, [admin])

  const fetchAdminNotifications = async () => {
    try {
      const response = await api.get('/api/admin/notifications')
      if (response.data.success) {
        setNewOrdersCount(response.data.newOrdersCount || 0)
        setNewEventsCount(response.data.newEventsCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch admin notifications:', error)
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false)
      }
    }

    if (showDropdown || showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown, showMobileMenu])

  const handleSignInSuccess = () => {
    setShowSignIn(false)
  }

  const handleUserLogout = () => {
    logoutUser()
    setShowDropdown(false)
    setShowMobileMenu(false)
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    setShowDropdown(false)
    setShowMobileMenu(false)
    navigate('/')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const NavLink = ({ to, icon, children, badge, badgeColor = 'bg-purple-600', className = '' }) => {
    const active = isActive(to)
    return (
      <Link
        to={to}
        className={`
          relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${active
            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
            : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
          }
          ${className}
        `}
        onClick={() => setShowMobileMenu(false)}
      >
        {icon}
        <span>{children}</span>
        {badge && badge > 0 && (
          <span className={`absolute -top-1 -right-1 ${badgeColor} text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md`}>
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-100/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 sm:h-24">
            {/* Logo - solid background so only logo graphic shows, no transparent areas */}
            <Link to="/" className="flex items-center gap-3 group">
              {!logoError ? (
                <div className="bg-white rounded-lg px-2 py-1 flex items-center justify-center">
                  <img 
                    src="/logo.PNG" 
                    alt="Minted Memories" 
                    className="h-16 sm:h-20 md:h-24 w-auto object-contain object-center transition-transform group-hover:scale-105"
                    onError={() => setLogoError(true)}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                    M
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Minted Memories
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              <NavLink 
                to="/" 
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
              >
                Home
              </NavLink>
              
              <NavLink 
                to="/cart" 
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
                badge={cartItemCount}
              >
                Cart
              </NavLink>

              {user && (
                <NavLink 
                  to="/orders" 
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  }
                >
                  Orders
                </NavLink>
              )}

              <NavLink 
                to="/services" 
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              >
                Services
              </NavLink>

              <NavLink 
                to="/contact" 
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                }
              >
                Contact
              </NavLink>
              
              {admin && (
                <>
                  <NavLink 
                    to="/admin/dashboard" 
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                  >
                    Dashboard
                  </NavLink>
                  <NavLink 
                    to="/admin/orders" 
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    }
                    badge={newOrdersCount}
                    badgeColor="bg-red-500"
                  >
                    Orders
                  </NavLink>
                  <NavLink 
                    to="/admin/events" 
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    badge={newEventsCount}
                    badgeColor="bg-orange-500"
                  >
                    Events
                  </NavLink>
                </>
              )}

              {/* User Menu */}
              <div className="relative ml-2" ref={dropdownRef}>
                {user || admin ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                        {(user ? user.name : admin.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden lg:inline text-sm text-gray-700 font-medium">
                        {user ? user.name : admin.username}
                      </span>
                    </div>
                    <button
                      onClick={user ? handleUserLogout : handleAdminLogout}
                      className="px-4 py-2 text-sm text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-600 rounded-lg transition-all duration-200 font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>Sign In</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {showDropdown && !user && !admin && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-purple-100 overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setShowSignIn(true)
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">User Login</span>
                    </button>
                    <div className="border-t border-gray-100"></div>
                    <button
                      onClick={() => {
                        setShowAdminLogin(true)
                        setShowDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all flex items-center gap-2"
                    >
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="font-medium">Admin Login</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-purple-50 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div ref={mobileMenuRef} className="md:hidden py-4 border-t border-purple-100">
              <div className="flex flex-col gap-2">
                <NavLink to="/" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>}>
                  Home
                </NavLink>
                <NavLink to="/cart" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} badge={cartItemCount}>
                  Cart
                </NavLink>
                {user && (
                  <NavLink to="/orders" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}>
                    Orders
                  </NavLink>
                )}
                <NavLink to="/services" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}>
                  Services
                </NavLink>
                <NavLink to="/contact" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}>
                  Contact
                </NavLink>
                {admin && (
                  <>
                    <NavLink to="/admin/dashboard" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                      Dashboard
                    </NavLink>
                    <NavLink to="/admin/orders" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>} badge={newOrdersCount} badgeColor="bg-red-500">
                      Orders
                    </NavLink>
                    <NavLink to="/admin/events" icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} badge={newEventsCount} badgeColor="bg-orange-500">
                      Events
                    </NavLink>
                  </>
                )}
                {(user || admin) && (
                  <div className="pt-2 border-t border-purple-100 mt-2">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                        {(user ? user.name : admin.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-700 font-medium flex-1">
                        {user ? user.name : admin.username}
                      </span>
                      <button
                        onClick={user ? handleUserLogout : handleAdminLogout}
                        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
                {!user && !admin && (
                  <div className="pt-2 border-t border-purple-100 mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        setShowSignIn(true)
                        setShowMobileMenu(false)
                      }}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-md transition-all"
                    >
                      User Login
                    </button>
                    <button
                      onClick={() => {
                        setShowAdminLogin(true)
                        setShowMobileMenu(false)
                      }}
                      className="flex-1 px-4 py-2 rounded-lg border-2 border-purple-300 text-purple-600 font-medium hover:bg-purple-50 transition-all"
                    >
                      Admin
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {showSignIn && (
        <SignInPopup
          onClose={() => setShowSignIn(false)}
          onSuccess={handleSignInSuccess}
        />
      )}

      {showAdminLogin && (
        <AdminLoginPopup
          onClose={() => setShowAdminLogin(false)}
        />
      )}
    </>
  )
}

export default Navbar
