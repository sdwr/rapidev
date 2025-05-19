import { HttpContext } from '@adonisjs/core/http'
import stripeService from '#services/stripeService'

export class PaymentsController {
  /**
   * Create a Stripe checkout session for an order
   * test change
   */
  public async createCheckoutSession({ request, response }: HttpContext) {
    try {
      const { orderId, amount, customerEmail, customerName, metadata } = request.body()

      // Validate required fields
      if (!orderId || !amount) {
        return response.status(400).json({
          message: 'Order ID and amount are required',
        })
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession({
        orderId,
        amount,
        customerEmail,
        customerName,
        metadata,
      })

      return response.json({
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      console.error('Error creating checkout session:', error)
      return response.status(500).json({
        message: 'Failed to create checkout session',
        error: error.message,
      })
    }
  }

  /**
   * Get status of a Stripe checkout session
   */
  public async getCheckoutSession({ params, response }: HttpContext) {
    try {
      const { sessionId } = params

      if (!sessionId) {
        return response.status(400).json({
          message: 'Session ID is required',
        })
      }

      const session = await stripeService.getCheckoutSession(sessionId)

      return response.json({
        status: session.status,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
        customerId: session.customer,
        amountTotal: session.amount_total ? session.amount_total / 100 : 0, // Convert from cents
      })
    } catch (error) {
      console.error('Error retrieving checkout session:', error)
      return response.status(500).json({
        message: 'Failed to retrieve checkout session',
        error: error.message,
      })
    }
  }
} 