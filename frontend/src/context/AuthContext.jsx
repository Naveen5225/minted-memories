import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth tokens
    const userToken = localStorage.getItem('userToken')
    const adminToken = localStorage.getItem('adminToken')

    if (userToken) {
      try {
        // Decode token to get user info (simple decode, not verification)
        const tokenData = JSON.parse(atob(userToken.split('.')[1]))
        setUser({
          id: tokenData.userId,
          phone: tokenData.phone,
          name: localStorage.getItem('userName') || ''
        })
      } catch (error) {
        localStorage.removeItem('userToken')
        localStorage.removeItem('userName')
      }
    }

    if (adminToken) {
      try {
        const tokenData = JSON.parse(atob(adminToken.split('.')[1]))
        setAdmin({
          username: tokenData.username
        })
      } catch (error) {
        localStorage.removeItem('adminToken')
      }
    }

    setLoading(false)
  }, [])

  // Configure axios to include token in requests
  useEffect(() => {
    const userToken = localStorage.getItem('userToken')
    if (userToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`
    }
  }, [user])

  const loginUser = (token, userData) => {
    localStorage.setItem('userToken', token)
    localStorage.setItem('userName', userData.name)
    setUser(userData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const loginAdmin = (token, adminData) => {
    localStorage.setItem('adminToken', token)
    setAdmin(adminData)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  const logoutUser = () => {
    localStorage.removeItem('userToken')
    localStorage.removeItem('userName')
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const logoutAdmin = () => {
    localStorage.removeItem('adminToken')
    setAdmin(null)
    delete axios.defaults.headers.common['Authorization']
  }

  const value = {
    user,
    admin,
    loading,
    loginUser,
    loginAdmin,
    logoutUser,
    logoutAdmin,
    isAuthenticated: !!user,
    isAdmin: !!admin
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
