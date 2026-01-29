import { useState, useEffect, useRef } from 'react'

function EventDatePicker({ value, onChange, minDate, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const calendarRef = useRef(null)

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value))
      setViewDate(new Date(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const minDateObj = minDate ? new Date(minDate) : today
  minDateObj.setHours(0, 0, 0, 0)

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const isDateDisabled = (date) => {
    if (!date) return true
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)
    return dateOnly < minDateObj
  }

  const isDateSelected = (date) => {
    if (!date || !selectedDate) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const handleDateClick = (date) => {
    if (!isDateDisabled(date)) {
      setSelectedDate(date)
    }
  }

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
  }

  const handleOK = () => {
    if (selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0]
      onChange({ target: { name: 'eventDate', value: isoDate } })
    }
    setIsOpen(false)
  }

  const handleCancel = () => {
    // Reset to original value
    if (value) {
      setSelectedDate(new Date(value))
      setViewDate(new Date(value))
    } else {
      setSelectedDate(null)
    }
    setIsOpen(false)
  }

  const formatDisplayDate = (date) => {
    if (!date) return 'Select date'
    const d = new Date(date)
    const options = { weekday: 'short', month: 'short', day: 'numeric' }
    return d.toLocaleDateString('en-US', options)
  }

  const days = getDaysInMonth(viewDate)
  const currentMonth = months[viewDate.getMonth()]
  const currentYear = viewDate.getFullYear()

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {/* Date Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-300 outline-none transition-all bg-white text-left hover:border-purple-300"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplayDate(value)}
        </span>
      </button>

      {/* Calendar Modal */}
      {isOpen && (
        <>
          {/* Backdrop - Removed to allow scrolling */}
          
          {/* Calendar Popup */}
          <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-[340px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-200 transform origin-top">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-4 py-3.5 text-white">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <div className="text-base font-semibold">{currentMonth} {currentYear}</div>
                  {selectedDate && (
                    <div className="text-xs opacity-90 mt-0.5">
                      {formatDisplayDate(selectedDate)}
                    </div>
                  )}
                </div>
                
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 bg-white">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 mb-1.5">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-semibold text-gray-500 py-1.5"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />
                  }

                  const disabled = isDateDisabled(date)
                  const selected = isDateSelected(date)
                  const isToday = date.toDateString() === today.toDateString()

                  return (
                    <button
                      key={date.toISOString()}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={disabled}
                      className={`
                        aspect-square rounded-lg text-xs font-medium transition-all
                        ${disabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : selected
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md scale-105'
                          : isToday
                          ? 'bg-purple-50 text-purple-700 border-2 border-purple-300 hover:bg-purple-100'
                          : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                        }
                        ${!disabled && !selected ? 'hover:scale-105 active:scale-95' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-3 py-2.5 bg-gray-50 border-t border-gray-100 flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-3 py-2 text-sm text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOK}
                disabled={!selectedDate}
                className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default EventDatePicker
