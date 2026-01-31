import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

function EventDatePicker({ value, onChange, minDate, className = '', triggerClassName = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null)
  const [popupStyle, setPopupStyle] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popupRef = useRef(null)

  // Update selectedDate when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value))
      setViewDate(new Date(value))
    } else {
      setSelectedDate(null)
    }
  }, [value])

  // Position popup below trigger (or above if not enough space) when opening
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const popupHeight = 320
    const popupWidth = 280
    const gap = 6
    const spaceBelow = window.innerHeight - rect.bottom
    const openUp = spaceBelow < popupHeight && rect.top > spaceBelow
    const top = openUp ? rect.top - popupHeight - gap : rect.bottom + gap
    const left = Math.max(8, Math.min(rect.left + rect.width / 2 - popupWidth / 2, window.innerWidth - popupWidth - 8))
    setPopupStyle({ top, left })
  }, [isOpen])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popupRef.current?.contains(event.target)
      ) return
      setIsOpen(false)
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

  const calendarPopup = isOpen && (
    <div
      ref={popupRef}
      className="fixed z-[9999] w-[280px] bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      style={{ top: popupStyle.top, left: popupStyle.left }}
    >
            {/* Gradient Header - compact */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 px-2.5 py-2 text-white">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-md hover:bg-white/20 transition-all active:scale-95"
                  aria-label="Previous month"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="text-center min-w-0 flex-1 px-1">
                  <div className="text-xs font-semibold truncate">{currentMonth} {currentYear}</div>
                  {selectedDate && (
                    <div className="text-[10px] opacity-90 mt-0.5 truncate">
                      {formatDisplayDate(selectedDate)}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-md hover:bg-white/20 transition-all active:scale-95"
                  aria-label="Next month"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Calendar Grid - compact */}
            <div className="p-2 bg-white">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-[10px] font-semibold text-gray-500 py-0.5"
                  >
                    {day.slice(0, 2)}
                  </div>
                ))}
              </div>

              {/* Calendar Days - smaller cells */}
              <div className="grid grid-cols-7 gap-0.5">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square min-w-0" />
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
                        min-w-0 aspect-square rounded-md text-[11px] font-medium transition-all flex items-center justify-center
                        ${disabled
                          ? 'text-gray-300 cursor-not-allowed'
                          : selected
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow scale-105'
                          : isToday
                          ? 'bg-purple-50 text-purple-700 border border-purple-300 hover:bg-purple-100'
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

            {/* Footer Buttons - compact */}
            <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100 flex gap-1.5">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-2 py-1.5 text-xs text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleOK}
                disabled={!selectedDate}
                className="flex-1 px-2 py-1.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow"
              >
                OK
              </button>
            </div>
    </div>
  )

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={triggerClassName ? `w-full text-left ${triggerClassName}` : 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50/50 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-left hover:border-gray-300'}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {formatDisplayDate(value)}
          </span>
        </button>
      </div>
      {calendarPopup && createPortal(calendarPopup, document.body)}
    </>
  )
}

export default EventDatePicker
