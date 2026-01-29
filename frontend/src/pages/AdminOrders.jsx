import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import Navbar from '../components/Navbar'
import ConfirmationModal from '../components/ConfirmationModal'

function AdminOrders() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('new')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [expandedOrders, setExpandedOrders] = useState({})

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    fetchOrders()
  }, [isAdmin, navigate, activeTab])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let url = `/api/orders/admin`
      
      // Handle order type filter
      if (activeTab === 'magnets' || activeTab === 'polaroids') {
        // Filter by orderType on frontend (backend doesn't support this filter yet)
        const response = await api.get(`/api/orders/admin?status=new`)
        if (response.data.success) {
          const filteredOrders = response.data.orders.filter(order => {
            const orderType = order.orderType || 'MAGNET'
            return activeTab === 'magnets' ? orderType === 'MAGNET' : orderType === 'POLAROID'
          })
          setOrders(filteredOrders)
        } else {
          setError('Failed to fetch orders')
        }
      } else {
        // Regular status filter
        const response = await api.get(`${url}?status=${activeTab}`)
        if (response.data.success) {
          setOrders(response.data.orders)
        } else {
          setError('Failed to fetch orders')
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkCompleted = async (orderId) => {
    try {
      setUpdating(orderId)
      const response = await api.patch(`/api/orders/${orderId}/status`, {
        orderStatus: 'COMPLETED'
      })

      if (response.data.success) {
        fetchOrders()
      } else {
        alert('Failed to update order status')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    } finally {
      setUpdating(null)
    }
  }

  const handleAccept = async (orderId) => {
    try {
      setUpdating(orderId)
      const response = await api.patch(`/api/orders/${orderId}/admin-action`, {
        action: 'ACCEPT'
      })

      if (response.data.success) {
        fetchOrders()
      } else {
        alert('Failed to accept order')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept order')
    } finally {
      setUpdating(null)
    }
  }

  const handleReject = async () => {
    if (!selectedOrderId) return
    
    try {
      setUpdating(selectedOrderId)
      const response = await api.patch(`/api/orders/${selectedOrderId}/admin-action`, {
        action: 'REJECT'
      })

      if (response.data.success) {
        setShowRejectModal(false)
        setSelectedOrderId(null)
        fetchOrders()
      } else {
        alert('Failed to reject order')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject order')
    } finally {
      setUpdating(null)
    }
  }

  const handleDownloadPhoto = async (orderId, photoId, photoName) => {
    try {
      const response = await api.get(`/api/orders/${orderId}/photos/${photoId}/download`, {
        responseType: 'blob'
      })
      
      // Create blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      
      // Extract filename from Content-Disposition header or use photoName
      const contentDisposition = response.headers['content-disposition']
      let filename = photoName
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to download photo')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-800'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'NEW':
        return 'New'
      case 'ACCEPTED':
        return 'Accepted'
      case 'REJECTED':
        return 'Rejected'
      case 'CANCELLED':
        return 'Cancelled'
      case 'COMPLETED':
        return 'Completed'
      default:
        return status
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track all orders</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('new')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'new'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              New Orders
            </button>
            <button
              onClick={() => setActiveTab('magnets')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'magnets'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Magnets
            </button>
            <button
              onClick={() => setActiveTab('polaroids')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'polaroids'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Polaroids
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed Orders
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'rejected'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected Orders
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'cancelled'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelled Orders
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">
              {activeTab === 'magnets' ? 'No magnet orders found.' :
               activeTab === 'polaroids' ? 'No polaroid orders found.' :
               `No ${activeTab === 'new' ? 'new' : activeTab === 'completed' ? 'completed' : activeTab === 'rejected' ? 'rejected' : 'cancelled'} orders found.`}
            </p>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Compact header row (clickable) */}
                <div
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-mono text-gray-500">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          (order.orderType || 'MAGNET') === 'POLAROID' 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {(order.orderType || 'MAGNET') === 'POLAROID' ? 'POLAROID' : 'MAGNET'}
                        </span>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          User ID: {order.user?.phone ?? order.phone}
                        </p>
                      </div>
                      <div className="sm:hidden text-xs text-gray-500">
                        User ID: {order.user?.phone ?? order.phone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {getStatusText(order.orderStatus)}
                    </span>
                    <button
                      type="button"
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleOrderExpansion(order.id)
                      }}
                    >
                      <svg
                        className={`w-4 h-4 transform transition-transform ${
                          expandedOrders[order.id] ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedOrders[order.id] && (
                  <div className="px-6 pb-6 pt-0">
                    {/* Customer Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Customer Information
                        </p>
                        <p className="text-sm text-gray-900 mb-1">
                          <span className="font-medium">User ID:</span>{' '}
                          {order.user?.phone ?? order.phone}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Name:</span>{' '}
                          {order.customerName}
                        </p>
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">Phone:</span>{' '}
                          {order.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          Delivery Address
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.address.houseNo}, {order.address.village}{' '}
                          {order.address.city}
                        </p>
                        <p className="text-sm text-gray-900">
                          {order.address.district}, {order.address.state} -{' '}
                          {order.address.pincode}
                        </p>
                        {/* Order Type Counts */}
                        {(order.magnetCount > 0 || order.polaroidCount > 0) && (
                          <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {order.magnetCount > 0 && (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                Magnets: {order.magnetCount}
                              </span>
                            )}
                            {order.polaroidCount > 0 && (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-pink-100 text-pink-700 border border-pink-200">
                                Polaroids: {order.polaroidCount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        Photos Ordered:
                      </p>
                      <div className="space-y-2">
                        {order.orderItems.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="w-16 h-16 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                              <img
                                src={item.photoUrl}
                                alt={item.photoName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-gray-900 truncate">
                                  {item.photoName}
                                </p>
                                {/* Order Type Badge */}
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${
                                  (item.orderType || order.orderType || 'MAGNET') === 'POLAROID' 
                                    ? 'bg-pink-100 text-pink-700 border border-pink-200' 
                                    : 'bg-purple-100 text-purple-700 border border-purple-200'
                                }`}>
                                  {(item.orderType || order.orderType || 'MAGNET') === 'POLAROID' ? 'POLAROID' : 'MAGNET'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                              {(item.orderType || order.orderType || 'MAGNET') === 'POLAROID' && item.polaroidType && (
                                <p className="text-xs text-purple-600 font-semibold mt-1">
                                  Type: {item.polaroidType}
                                </p>
                              )}
                              {(item.orderType || order.orderType || 'MAGNET') === 'POLAROID' && item.caption && item.caption.trim() && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Caption: "{item.caption}"
                                </p>
                              )}
                              {(item.orderType || order.orderType || 'MAGNET') === 'POLAROID' && item.polaroidType === 'Custom Text Caption' && (!item.caption || !item.caption.trim()) && (
                                <p className="text-xs text-gray-400 italic mt-1">
                                  (No caption provided)
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  handleDownloadPhoto(
                                    order.id,
                                    item.id,
                                    item.photoName
                                  )
                                }
                                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Download Photo"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                              </button>
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  ₹
                                  {(
                                    item.quantity * item.pricePerUnit
                                  ).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 p-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Magnets
                        </p>
                        <p className="font-semibold text-gray-900">
                          {order.totalQuantity} Magnets
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Payment Mode
                        </p>
                        <p className="font-semibold text-gray-900">
                          {order.paymentMode === 'COD'
                            ? 'Cash on Delivery'
                            : 'Online Payment'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Payment Status
                        </p>
                        <p
                          className={`font-semibold ${
                            order.paymentStatus === 'PAID'
                              ? 'text-green-600'
                              : order.paymentStatus === 'PENDING'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}
                        >
                          {order.paymentStatus === 'PAID'
                            ? 'Paid'
                            : order.paymentStatus === 'PENDING'
                            ? 'Pending'
                            : 'Failed'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="font-semibold text-gray-900">
                          ₹{order.totalAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions (always visible at bottom) */}
                {activeTab === 'new' && (
                  <div className="px-6 pb-4 pt-3 border-t border-gray-200 flex flex-wrap gap-3">
                    {order.orderStatus === 'NEW' && (
                      <>
                        <button
                          onClick={() => handleAccept(order.id)}
                          disabled={updating === order.id}
                          className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updating === order.id ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id)
                            setShowRejectModal(true)
                          }}
                          disabled={updating === order.id}
                          className="bg-red-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {order.orderStatus === 'ACCEPTED' && (
                      <button
                        onClick={() => handleMarkCompleted(order.id)}
                        disabled={updating === order.id}
                        className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updating === order.id
                          ? 'Updating...'
                          : 'Mark as Completed'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false)
          setSelectedOrderId(null)
        }}
        onConfirm={handleReject}
        title="Reject Order"
        message="Are you sure you want to reject this order?"
        confirmText="Reject"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}

export default AdminOrders
