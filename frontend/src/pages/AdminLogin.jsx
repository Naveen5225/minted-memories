import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLoginPopup from '../components/AdminLoginPopup'

function AdminLogin() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAdmin) {
      navigate('/admin/dashboard')
    }
  }, [isAdmin, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <AdminLoginPopup onClose={() => navigate('/')} />
    </div>
  )
}

export default AdminLogin
