import { useState } from 'react'
import api from '../api'
import EventBookingSuccessModal from './EventBookingSuccessModal'
import EventDatePicker from './EventDatePicker'
import eventImage from '../assets/g3.png'

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

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all placeholder:text-gray-400'

  return (
    <section className="py-10 sm:py-14 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-purple-50/40 pointer-events-none" />
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
            Book Us for Your <span className="text-gradient">Event</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-1.5 max-w-lg mx-auto">
            Live photo magnets & polaroids at birthdays, weddings & special events
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left: Photo + About event service */}
          <div className="order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 ring-1 ring-black/5 bg-gray-100 flex items-center justify-center">
              <img
                src={eventImage}
                alt="Minted Memories at your event"
                className="w-full h-auto max-h-[320px] sm:max-h-[380px] object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="mt-6 lg:mt-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                We Serve Your <span className="text-gradient">Event</span>
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-4">
                Bring Minted Memories to your birthday, wedding, anniversary, or corporate event. We set up on-site—guests get instant custom fridge magnets and polaroids from the moment. Unforgettable keepsakes, zero hassle for you.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  On-site setup & live printing
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                  Custom magnets & polaroids for guests
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Flexible time slots to fit your day
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Booking form */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden bg-white shadow-xl shadow-gray-200/50 ring-1 ring-gray-200/80">
              {/* Top accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-pink-500 to-amber-400" />
              <div className="p-5 sm:p-6 lg:p-7">
                <div className="mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Request a <span className="text-gradient">Booking</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">Fill in the details and we’ll get back to you.</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Event Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      >
                        <option value="">Select type</option>
                        {eventTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Event Date <span className="text-red-400">*</span>
                      </label>
                      <EventDatePicker
                        value={formData.eventDate}
                        onChange={handleChange}
                        minDate={today}
                        className="w-full"
                        triggerClassName={inputClass}
                      />
                      <input type="hidden" name="eventDate" value={formData.eventDate} required />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Time Slot <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="timeSlot"
                        value={formData.timeSlot}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      >
                        <option value="">Select slot</option>
                        {timeSlots.map(slot => (
                          <option key={slot.value} value={slot.value}>{slot.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Guests <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        name="expectedGuests"
                        value={formData.expectedGuests}
                        onChange={handleChange}
                        min="1"
                        required
                        className={inputClass}
                        placeholder="Number of guests"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                      Event Location <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      rows="2"
                      className={`${inputClass} resize-none`}
                      placeholder="Full event address"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Contact Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        required
                        className={inputClass}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        maxLength="10"
                        required
                        className={inputClass}
                        placeholder="10 digits"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows="2"
                      className={`${inputClass} resize-none`}
                      placeholder="Special requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 gradient-primary text-white py-3 px-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Request Booking'}
                  </button>
                </form>
              </div>
            </div>
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
