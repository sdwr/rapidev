import { toast } from 'vue3-toastify'

export const handleApiError = (error) => {
  const message = error.response?.data?.message || error.message || error.error || 'An unexpected error occurred'
  const url = error.response?.url || error.url || 'Unknown URL'
  
  // Show toast with URL context
  toast.error(`Error at ${url}: ${message}`)
  
  // Detailed console log
  console.error('API Error:', {
    url,
    message,
    error
  })
} 