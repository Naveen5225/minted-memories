import { useNavigate } from 'react-router-dom'

function OrderSuccessModal({ onClose }) {
  const navigate = useNavigate()

  const handleViewOrders = () => {
    onClose()
    navigate('/orders')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="p-8 text-center">
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-gray-600">
              Your order will be delivered in 2–3 days
            </p>
          </div>

          <button
            onClick={handleViewOrders}
            className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessModal
