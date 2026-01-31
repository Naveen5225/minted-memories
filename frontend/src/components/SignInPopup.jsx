import { useState } from 'react'
import api from '../api'
import { useAuth } from '../context/AuthContext'

function SignInPopup({ onClose, onSuccess }) {
  const [step, setStep] = useState('phone') // 'phone' | 'name'
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { loginUser } = useAuth()

  const handleSubmitPhone = async (e) => {
    e?.preventDefault()
    setError('')
    if (!phone || !/^\d{10}$/.test(phone)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { phone })
      if (res.data.token && res.data.user) {
        loginUser(res.data.token, res.data.user)
        if (onSuccess) onSuccess()
        if (onClose) onClose()
        return
      }
      if (res.data.requiresName) {
        setStep('name')
      } else {
        setError(res.data.message || 'Something went wrong')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e?.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        phone,
        name: name.trim()
      })
      if (res.data.success && res.data.token && res.data.user) {
        loginUser(res.data.token, res.data.user)
        if (onSuccess) onSuccess()
        if (onClose) onClose()
      } else {
        setError(res.data.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed')
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
            {step === 'name' && 'Register'}
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
            <form onSubmit={handleSubmitPhone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  maxLength={10}
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
                {loading ? 'Checking...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <p className="text-sm text-gray-600">First time here? Enter your name to register.</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
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
                  onClick={() => { setStep('phone'); setName(''); setError('') }}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Registering...' : 'Register'}
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
