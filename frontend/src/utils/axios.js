import axios from 'axios'
import { toast } from 'vue3-toastify'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred'
    toast.error(message)
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default api 