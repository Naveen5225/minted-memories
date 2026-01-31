/**
 * Central API client for backend requests.
 * Set VITE_API_BASE_URL in .env (e.g. http://localhost:5001 for backend port 5001).
 */
import axios from 'axios'

const raw = import.meta.env.VITE_API_BASE_URL || ''
const baseURL = typeof raw === 'string' ? raw.replace(/\/$/, '') : ''

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
