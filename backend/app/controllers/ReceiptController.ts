import { HttpContext } from '@adonisjs/core/http'
import Receipt from '#models/receipt'
import Order from '#models/order'
import { createReceiptValidator, updateReceiptValidator } from '#validators/ReceiptValidator'
import { ReceiptStatusEnum } from '#shared/enums/ReceiptEnums'
import { OrderStatusEnum } from '#shared/enums/OrderEnums'
import OrderStatusService from '#services/OrderStatusService'

export class ReceiptController {
  async getAllReceipts({ response }: HttpContext) {
    try {
      const receipts = await Receipt.all()
      return response.json(receipts)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deleteAllReceipts({ response }: HttpContext) {
    try {
      await Receipt.query().delete()
      return response.json({ message: 'All receipts deleted successfully' })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  /**
   * Create a new receipt for an order
   */
  async createReceipt({ request, response }: HttpContext) {
    try {
      // Validate request data
      const data = request.body()
      await createReceiptValidator.validate(data)
      
      // Check if order exists
      const order = await Order.find(data.orderId)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }
      
      // Check if receipt already exists for this order
      const existingReceipt = await Receipt.findBy('orderId', data.orderId)
      if (existingReceipt) {
        return response.status(400).json({ error: 'Receipt already exists for this order' })
      }
      
      // Set default values if not provided
      if (data.receiptStatus === undefined) {
        data.receiptStatus = ReceiptStatusEnum.PENDING
      }
      
      if (data.amountPaid === undefined) {
        data.amountPaid = 0
      }
      
      // Create the receipt
      const receipt = await Receipt.create(data)

      // if the receipt is paid, update the order status to accepted
      if (data.receiptStatus === ReceiptStatusEnum.PAID) {
        await OrderStatusService.createStatus(order.id, OrderStatusEnum.ACCEPTED)
        await order.load('orderStatuses')
      }
      
      return response.status(201).json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Get a receipt by ID
   */
  async getReceipt({ params, response }: HttpContext) {
    try {
      const receipt = await Receipt.find(params.id)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found' })
      }
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Get receipt by order ID
   */
  async getReceiptByOrderId({ params, response }: HttpContext) {
    try {
      const receipt = await Receipt.findBy('orderId', params.orderId)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found for this order' })
      }
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Update a receipt
   */
  async updateReceipt({ params, request, response }: HttpContext) {
    try {
      const data = request.body()
      await updateReceiptValidator.validate(data)
      const receipt = await Receipt.find(params.id)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found' })
      }

      // Update receipt
      receipt.merge(data)
      await receipt.save()
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Process a payment for a receipt
   */
  async payReceipt({ params, request, response }: HttpContext) {
    try {
      const receipt = await Receipt.find(params.id)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found' })
      }
      
      // Validate payment amount
      const { amount } = request.body()
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return response.status(400).json({ error: 'Valid payment amount is required' })
      }
      
      // Update amount paid
      const newAmountPaid = receipt.amountPaid + amount
      
      // Update receipt status based on payment
      let newStatus = receipt.receiptStatus
      
      if (newAmountPaid >= receipt.total) {
        newStatus = ReceiptStatusEnum.PAID
      } else if (newAmountPaid > 0) {
        newStatus = ReceiptStatusEnum.PARTIALLY_PAID
      }
      
      // Update receipt
      receipt.merge({
        amountPaid: newAmountPaid,
        receiptStatus: newStatus
      })
      
      await receipt.save()
      

      //update order status to accepted
      await OrderStatusService.createStatus(receipt.orderId, OrderStatusEnum.ACCEPTED)
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Process a refund for a receipt
   */
  async refundReceipt({ params, request, response }: HttpContext) {
    try {
      const receipt = await Receipt.find(params.id)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found' })
      }
      
      // Validate refund amount
      const { amount } = request.body()
      
      if (!amount || typeof amount !== 'number' || amount <= 0) {
        return response.status(400).json({ error: 'Valid refund amount is required' })
      }
      
      // Check if refund amount is valid
      if (amount > receipt.amountPaid) {
        return response.status(400).json({ 
          error: 'Refund amount cannot exceed the amount paid' 
        })
      }
      
      // Update amount paid
      const newAmountPaid = receipt.amountPaid - amount
      
      // Update receipt status based on refund
      let newStatus = receipt.receiptStatus
      
      if (newAmountPaid === 0) {
        newStatus = ReceiptStatusEnum.REFUNDED
      } else if (newAmountPaid < receipt.total) {
        newStatus = ReceiptStatusEnum.PARTIALLY_PAID
      }
      
      // Update receipt
      receipt.merge({
        amountPaid: newAmountPaid,
        receiptStatus: newStatus
      })
      
      await receipt.save()
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
  
  /**
   * Cancel a receipt
   */
  async cancelReceipt({ params, response }: HttpContext) {
    try {
      const receipt = await Receipt.find(params.id)
      
      if (!receipt) {
        return response.status(404).json({ error: 'Receipt not found' })
      }
      
      // Update receipt status
      receipt.receiptStatus = ReceiptStatusEnum.CANCELLED
      
      await receipt.save()
      
      return response.json(receipt)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
} 