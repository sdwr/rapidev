import { getBaseUrl } from '../api/config'

const BASE_URL = getBaseUrl()

export const createCheckoutSession = async (params: {
  orderId: string
  amount: number
  customerEmail?: string
  customerName?: string
  metadata?: Record<string, string>
}) => {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating checkout session:', error)
    throw error
  }
}

export const getCheckoutSession = async (sessionId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/payments/checkout-session/${sessionId}`)

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting checkout session:', error)
    throw error
  }
} 