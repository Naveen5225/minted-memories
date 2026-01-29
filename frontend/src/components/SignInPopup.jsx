import { useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

function SignInPopup({ onClose, onSuccess }) {
  const [step, setStep] = useState('phone') // 'phone', 'otp', 'name'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginUser } = useAuth()

  const handleSendOTP = async (e) => {
    e?.preventDefault()
    setError('')
    
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/send-otp', { phone })
      if (response.data.success) {
        setStep('otp')
        // In development, show OTP in alert
        if (response.data.otp) {
          alert(`OTP: ${response.data.otp} (Development mode)`)
        }
      } else {
        setError(response.data.message || 'Failed to send OTP')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send OTP. Please try again.'
      setError(errorMessage)
      console.error('OTP send error:', err.response?.data || err)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e?.preventDefault()
    setError('')

    if (!otp || !/^\d{6}$/.test(otp)) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/verify-otp', {
        phone,
        otp
      })

      if (response.data.success) {
        // Existing user - login successful
        loginUser(response.data.token, response.data.user)
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      } else {
        setError(response.data.message || 'Invalid OTP')
      }
    } catch (err) {
      // Check if name is required (new user)
      if (err.response?.status === 400 && err.response?.data?.requiresName) {
        setIsNewUser(true)
        setStep('name')
        // Don't show error, just move to name step
      } else {
        setError(err.response?.data?.message || 'Invalid OTP. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteSignup = async (e) => {
    e?.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your name')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/api/auth/verify-otp', {
        phone,
        otp,
        name: name.trim()
      })

      if (response.data.success) {
        loginUser(response.data.token, response.data.user)
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      } else {
        setError(response.data.message || 'Failed to create account')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === 'phone' && 'Sign In'}
            {step === 'otp' && 'Verify OTP'}
            {step === 'name' && 'Complete Sign Up'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength="10"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="10 digit phone number"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none text-center text-2xl tracking-widest"
                  placeholder="000000"
                  required
                />
                <p className="mt-2 text-sm text-gray-600">
                  OTP sent to {phone}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setOtp('')
                    setError('')
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleCompleteSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('otp')
                    setName('')
                    setError('')
                  }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Complete Sign Up'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignInPopup
