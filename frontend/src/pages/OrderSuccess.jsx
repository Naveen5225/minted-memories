import { useSearchParams, useNavigate } from 'react-router-dom'

function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const status = searchParams.get('status') || 'failed'
  const orderId = searchParams.get('orderId') || ''
  const error = searchParams.get('error') || ''

  const isSuccess = status === 'success'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-purple-100 overflow-hidden">
        <div className="p-8 text-center">
          {isSuccess ? (
            <>
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h2>
              <p className="text-gray-600 mb-1">Your order has been placed successfully.</p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
              )}
            </>
          ) : (
            <>
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h2>
              <p className="text-gray-600 mb-1">
                {error === 'order_not_found' && 'Order not found.'}
                {error === 'missing_order' && 'Invalid return link.'}
                {error === 'payment_not_configured' && 'Payment service is not configured.'}
                {error === 'server_error' && 'Something went wrong. Please try again or contact support.'}
                {!error && 'Your payment could not be completed.'}
              </p>
              {orderId && (
                <p className="text-sm text-gray-500 mb-4">Order ID: {orderId}</p>
              )}
            </>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gray-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              View My Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
