import Stripe from 'stripe'
import env from '#start/env'

// Initialize Stripe with the API key from environment
const stripe = new Stripe(env.get('STRIPE_API_SECRET_KEY'), {
  apiVersion: '2023-10-16', // Use latest stable API version
})

// Determine the correct frontend URL based on environment
const getFrontendUrl = () => {
  const nodeEnv = env.get('NODE_ENV')
  return nodeEnv === 'development' 
    ? env.get('FRONTEND_URL_DEV') 
    : env.get('FRONTEND_URL_PROD')
}

export class StripeService {
  /**
   * Create a Stripe checkout session for an order
   */
  public async createCheckoutSession(params: {
    orderId: string
    amount: number
    customerEmail?: string
    customerName?: string
    metadata?: Record<string, string>
  }) {
    const { orderId, amount, customerEmail, customerName, metadata = {} } = params

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100)
    
    // Get the correct frontend URL
    const frontendUrl = getFrontendUrl()

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: `Order #${orderId}`,
              description: 'Delivery service payment',
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: customerEmail,
      client_reference_id: orderId,
      metadata: {
        orderId,
        customerName: customerName || '',
        ...metadata,
      },
      mode: 'payment',
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?session_id={CHECKOUT_SESSION_ID}`,
    })

    return session
  }

  /**
   * Retrieve a checkout session by ID
   */
  public async getCheckoutSession(sessionId: string) {
    return await stripe.checkout.sessions.retrieve(sessionId)
  }
}

// Export a singleton instance
export default new StripeService() 