import axios from 'axios'

// Debug: Log the base URL being used
const baseURL = import.meta.env.VITE_API_BASE_URL || ''
console.log('API Base URL:', baseURL || '(empty - using relative URLs)')

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

export default api
