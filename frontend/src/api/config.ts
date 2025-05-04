const isProd = import.meta.env.VITE_API_ENV === 'production'
const baseURL = isProd 
  ? ''
  : import.meta.env.VITE_BACKEND_URL_DEV

export const apiConfig = {
  baseURL,
  // other config options...
}

export const getBaseUrl = () => {
  return apiConfig.baseURL
} 
