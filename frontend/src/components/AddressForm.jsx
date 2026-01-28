import { useState } from 'react'
import PaymentSummary from './PaymentSummary'

function AddressForm({ photos, subtotal, totalAmount, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    houseNo: '',
    village: '',
    city: '',
    district: '',
    state: '',
    pincode: ''
  })
  const [errors, setErrors] = useState({})
  const [showPaymentSummary, setShowPaymentSummary] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be exactly 10 digits'
    }

    if (!formData.houseNo.trim()) {
      newErrors.houseNo = 'House number is required'
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village/Town is required'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required'
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required'
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required'
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be exactly 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      setShowPaymentSummary(true)
    }
  }

  const handlePaymentSubmit = (paymentData) => {
    onSubmit({
      ...formData,
      paymentMode: paymentData.paymentMode
    })
  }

  if (showPaymentSummary) {
    return (
      <PaymentSummary
        photos={photos}
        subtotal={subtotal}
        totalAmount={totalAmount}
        address={formData}
        onBack={() => setShowPaymentSummary(false)}
        onClose={onClose}
        onSubmit={handlePaymentSubmit}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-100">
        <div className="p-6 border-b border-purple-100 flex justify-between items-center sticky top-0 bg-gradient-to-r from-white to-purple-50/30">
          <h2 className="text-2xl font-bold text-gray-900">Delivery Address</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-purple-600 transition-colors p-1 rounded-lg hover:bg-purple-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all ${
                errors.fullName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              maxLength="10"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10 digit phone number"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              House No / Flat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="houseNo"
              value={formData.houseNo}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.houseNo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="House number or flat number"
            />
            {errors.houseNo && <p className="mt-1 text-sm text-red-600">{errors.houseNo}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Village / Town <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="village"
              value={formData.village}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.village ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Village or town name"
            />
            {errors.village && <p className="mt-1 text-sm text-red-600">{errors.village}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="City name"
            />
            {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.district ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="District name"
            />
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.state ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="State name"
            />
            {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              maxLength="6"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all ${
                errors.pincode ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="6 digit pincode"
            />
            {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold">Estimated Delivery:</span> 2–3 Days
            </p>
            <button
              type="submit"
              className="w-full gradient-primary text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddressForm
