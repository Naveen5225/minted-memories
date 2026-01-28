import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import SignInPopup from './SignInPopup'
import AdminLoginPopup from './AdminLoginPopup'

function Navbar() {
  const { user, admin, logoutUser, logoutAdmin } = useAuth()
  const { items } = useCart()
  const [showSignIn, setShowSignIn] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  const cartItemCount = items.length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleSignInSuccess = () => {
    setShowSignIn(false)
  }

  const handleUserLogout = () => {
    logoutUser()
    setShowDropdown(false)
  }

  const handleAdminLogout = () => {
    logoutAdmin()
    setShowDropdown(false)
    navigate('/')
  }

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {!logoError ? (
                <img 
                  src="/logo.png" 
                  alt="Minted Memories" 
                  className="h-12 w-auto object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-2xl font-semibold text-gray-900">mintedmemories</span>
              )}
            </Link>
            <div className="flex items-center gap-4 sm:gap-6">
              <Link to="/" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Home
              </Link>
              
              {/* Cart Link with Icon and Badge */}
              <Link to="/cart" className="relative text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">Cart</span>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {user && (
                <Link to="/orders" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                  Orders
                </Link>
              )}
              <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                Contact
              </Link>
              
              {admin && (
                <>
                  <Link to="/admin/dashboard" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Dashboard
                  </Link>
                  <Link to="/admin/orders" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">
                    Admin Orders
                  </Link>
                </>
              )}

              <div className="relative" ref={dropdownRef}>
                {user || admin ? (
                  <div className="flex items-center gap-3">
                    {/* User Icon */}
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold text-sm">
                        {(user ? user.name : admin.username).charAt(0).toUpperCase()}
                      </div>
                      <span className="hidden sm:inline text-sm text-gray-700 font-medium">
                        {user ? user.name : admin.username}
                      </span>
                    </div>
                    <button
                      onClick={user ? handleUserLogout : handleAdminLogout}
                      className="text-sm text-gray-700 hover:text-purple-600 transition-colors font-medium"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="text-gray-700 hover:text-purple-600 transition-colors font-medium flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Sign In</span>
                    </button>
                    {showDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                        <button
                          onClick={() => {
                            setShowSignIn(true)
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                        >
                          User
                        </button>
                        <button
                          onClick={() => {
                            setShowAdminLogin(true)
                            setShowDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                        >
                          Admin
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
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
