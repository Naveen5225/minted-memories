import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import Navbar from '../components/Navbar'

function AdminEventBookings() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    fetchBookings()
  }, [isAdmin, navigate, statusFilter])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const url = statusFilter ? `/api/admin/events?status=${statusFilter}` : '/api/admin/events'
      const response = await api.get(url)
      if (response.data.success) {
        setBookings(response.data.bookings)
      } else {
        setError('Failed to fetch event bookings')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch event bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setUpdating(bookingId)
      const response = await api.patch(`/api/admin/events/${bookingId}/status`, {
        status: newStatus
      })

      if (response.data.success) {
        fetchBookings()
      } else {
        alert('Failed to update booking status')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status')
    } finally {
      setUpdating(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTimeSlotLabel = (slot) => {
    switch (slot) {
      case 'MORNING':
        return 'Morning (9 AM – 1 PM)'
      case 'AFTERNOON':
        return 'Afternoon (1 PM – 5 PM)'
      case 'EVENING':
        return 'Evening (5 PM – 9 PM)'
      default:
        return slot
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Bookings</h1>
          <p className="text-gray-600">Manage event booking requests</p>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                statusFilter === ''
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('NEW')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                statusFilter === 'NEW'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              New
            </button>
            <button
              onClick={() => setStatusFilter('CONFIRMED')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                statusFilter === 'CONFIRMED'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                statusFilter === 'CANCELLED'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Cancelled
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No event bookings found.</p>
          </div>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {booking.eventType} Event
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatDate(booking.eventDate)} • {getTimeSlotLabel(booking.timeSlot)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Contact Information</p>
                      <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {booking.contactName}</p>
                      <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {booking.contactPhone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Event Details</p>
                      <p className="text-sm text-gray-900"><span className="font-medium">Location:</span> {booking.location}</p>
                      <p className="text-sm text-gray-900"><span className="font-medium">Expected Guests:</span> {booking.expectedGuests}</p>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Additional Notes</p>
                      <p className="text-sm text-gray-700">{booking.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {booking.status === 'NEW' && (
                    <div className="pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                        disabled={updating === booking.id}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === booking.id ? 'Processing...' : 'Confirm Booking'}
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                        disabled={updating === booking.id}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminEventBookings
