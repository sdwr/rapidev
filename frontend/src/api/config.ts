const env = process.env.NODE_ENV || 'development'

export const API_CONFIG = {
  LOCAL_URL: 'http://localhost:3333',
  PROD_URL: 'https://api.delivery-app.com', // Replace with your actual production URL
  ENV: env === 'production' ? 'prod' : 'local'
}

export const getBaseUrl = () => {
  return API_CONFIG.ENV === 'prod' ? API_CONFIG.PROD_URL : API_CONFIG.LOCAL_URL
} 