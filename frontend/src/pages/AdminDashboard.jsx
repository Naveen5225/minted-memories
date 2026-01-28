import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import Navbar from '../components/Navbar'

function AdminDashboard() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [dayWiseData, setDayWiseData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('7') // Default to last 7 days
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    fetchDashboardData()
  }, [isAdmin, navigate, dateRange, customStartDate, customEndDate])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      let url = '/api/admin/dashboard'
      
      // Build query parameters
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        url += `?startDate=${customStartDate}&endDate=${customEndDate}`
      } else if (dateRange !== 'custom') {
        url += `?range=${dateRange}`
      }

      const response = await axios.get(url)
      if (response.data.success) {
        setStats(response.data.stats)
        setDayWiseData(response.data.dayWiseData)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (value) => {
    setDateRange(value)
    setShowCustomRange(value === 'custom')
    if (value !== 'custom') {
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      fetchDashboardData()
    }
  }

  const getDateRangeLabel = () => {
    switch (dateRange) {
      case 'today':
        return 'Today'
      case '7':
        return 'Last 7 Days'
      case '30':
        return 'Last 30 Days'
      case 'full':
        return 'All Time'
      case 'custom':
        return customStartDate && customEndDate 
          ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
          : 'Custom Range'
      default:
        return 'Last 7 Days'
    }
  }

  if (!isAdmin) {
    return null
  }

  const maxCount = dayWiseData.length > 0 ? Math.max(...dayWiseData.map(d => d.count)) : 1

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #f8fafc, #f1f5f9)' }}>
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <Navbar />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Admin <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="text-gray-600">Overview of orders and revenue</p>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="appearance-none bg-white border-2 border-purple-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 cursor-pointer"
              >
                <option value="today">Today</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="full">All Time</option>
                <option value="custom">Custom Range</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {showCustomRange && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border-2 border-purple-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="End Date"
                />
                <button
                  onClick={handleCustomRangeApply}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-2 gradient-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        )}

        {error && (
          <div className="gradient-border mb-6">
            <div className="gradient-border-inner p-4 bg-red-50 border-red-200 rounded-lg">
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-6 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
              <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-6 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">New Orders</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.newOrders}</p>
                </div>
              </div>
              <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-6 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Completed Orders</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
              </div>
              <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-6 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Revenue</p>
                  <p className="text-3xl font-bold text-gradient">₹{parseFloat(stats.totalRevenue).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <div className="gradient-border">
                <div className="gradient-border-inner bg-white p-6 rounded-lg">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Total Magnets Made</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalMagnets || 0}</p>
                </div>
              </div>
            </div>

            {/* Payment Insights Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Insights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="gradient-border">
                  <div className="gradient-border-inner bg-white p-6 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 mb-2">COD Orders</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.codOrdersCount || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed orders</p>
                  </div>
                </div>
                <div className="gradient-border">
                  <div className="gradient-border-inner bg-white p-6 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Online Orders</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats.onlineOrdersCount || 0}</p>
                    <p className="text-xs text-gray-500 mt-1">Completed orders</p>
                  </div>
                </div>
                <div className="gradient-border">
                  <div className="gradient-border-inner bg-white p-6 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 mb-2">COD Revenue</p>
                    <p className="text-3xl font-bold text-orange-600">₹{parseFloat(stats.codRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">From completed orders</p>
                  </div>
                </div>
                <div className="gradient-border">
                  <div className="gradient-border-inner bg-white p-6 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 mb-2">Online Revenue</p>
                    <p className="text-3xl font-bold text-indigo-600">₹{parseFloat(stats.onlineRevenue || 0).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1">From completed orders</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Day-wise Order Chart */}
            <div className="gradient-border mb-8">
              <div className="gradient-border-inner bg-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Orders ({getDateRangeLabel()})</h2>
                </div>
                {dayWiseData.length > 0 ? (
                  <div className="flex items-end justify-between gap-2 h-64">
                    {dayWiseData.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full gradient-primary rounded-t transition-all hover:opacity-80 cursor-pointer"
                            style={{
                              height: `${(day.count / maxCount) * 100}%`,
                              minHeight: day.count > 0 ? '4px' : '0'
                            }}
                            title={`${day.date}: ${day.count} orders`}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-600 text-center">
                          {new Date(day.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{day.count}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <p>No data available for selected range</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="gradient-border">
              <div className="gradient-border-inner bg-white p-6 rounded-lg">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <Link
                  to="/admin/orders"
                  className="inline-block gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-md"
                >
                  View All Orders
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
