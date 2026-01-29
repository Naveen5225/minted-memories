import { useState } from 'react'
import api from '../api'
import EventBookingSuccessModal from './EventBookingSuccessModal'
import EventDatePicker from './EventDatePicker'

function EventBookingForm() {
  const [formData, setFormData] = useState({
    eventType: '',
    eventDate: '',
    timeSlot: '',
    location: '',
    expectedGuests: '',
    contactName: '',
    contactPhone: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [error, setError] = useState('')

  const eventTypes = ['Birthday', 'Wedding', 'Anniversary', 'Corporate Event', 'Other']
  const timeSlots = [
    { value: 'MORNING', label: 'Morning (9 AM – 1 PM)' },
    { value: 'AFTERNOON', label: 'Afternoon (1 PM – 5 PM)' },
    { value: 'EVENING', label: 'Evening (5 PM – 9 PM)' }
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.eventType || !formData.eventDate || !formData.timeSlot || 
        !formData.location || !formData.expectedGuests || !formData.contactName || 
        !formData.contactPhone) {
      setError('Please fill all required fields')
      return
    }

    if (!/^\d{10}$/.test(formData.contactPhone)) {
      setError('Phone number must be exactly 10 digits')
      return
    }

    if (parseInt(formData.expectedGuests) < 1) {
      setError('Expected guests must be at least 1')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await api.post('/api/events/book', {
        eventType: formData.eventType,
        eventDate: formData.eventDate,
        timeSlot: formData.timeSlot,
        location: formData.location.trim(),
        expectedGuests: parseInt(formData.expectedGuests),
        contactName: formData.contactName.trim(),
        contactPhone: formData.contactPhone.trim(),
        notes: formData.notes.trim() || null
      })

      if (response.data.success) {
        // Clear form
        setFormData({
          eventType: '',
          eventDate: '',
          timeSlot: '',
          location: '',
          expectedGuests: '',
          contactName: '',
          contactPhone: '',
          notes: ''
        })
        // Show success modal
        setShowSuccessModal(true)
      }
    } catch (err) {
      console.error('Event booking error:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit booking request. Please try again.'
      setError(errorMessage)
      console.error('Full error:', err.response?.data || err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <section className="py-16 sm:py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Book Us for Your <span className="text-gradient">Event</span>
          </h2>
          <p className="text-lg text-gray-600">
            Live photo magnets at birthdays, weddings & special events
          </p>
        </div>

        <div className="gradient-border">
          <div className="gradient-border-inner bg-white p-6 sm:p-8 rounded-lg">

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white"
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Date <span className="text-red-500">*</span>
                  </label>
                  <EventDatePicker
                    value={formData.eventDate}
                    onChange={handleChange}
                    minDate={today}
                    className="w-full"
                  />
                  {/* Hidden input for form validation */}
                  <input
                    type="hidden"
                    name="eventDate"
                    value={formData.eventDate}
                    required
                  />
                </div>

                {/* Time Slot */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="timeSlot"
                    value={formData.timeSlot}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white"
                  >
                    <option value="">Select time slot</option>
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>

                {/* Expected Guests */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expected Guests <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="expectedGuests"
                    value={formData.expectedGuests}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white"
                    placeholder="Number of guests"
                  />
                </div>
              </div>

              {/* Event Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Location <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all resize-none bg-white"
                  placeholder="Enter full event address"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Contact Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white"
                    placeholder="Your name"
                  />
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    maxLength="10"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white"
                    placeholder="10 digit phone number"
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all resize-none bg-white"
                  placeholder="Any special requirements or details..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full gradient-primary text-white py-3.5 px-6 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request Booking'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <EventBookingSuccessModal
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </section>
  )
}

export default EventBookingForm
