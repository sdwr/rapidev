import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import OrderStatus from '#models/order_status'
import OrderItem from '#models/order_item'
import { randomUUID } from 'node:crypto'
import Profile from '#models/profile'
import User from '#models/user'

import { OrderStatus as Status } from '#shared/enums/OrderEnums'

export class OrderController {
  async createOrder({ request, response }: HttpContext) {
    const data = request.body()
    
    try {
      // Verify client profile exists
      const profile = await Profile.findBy('id', data.clientProfileId)
      if (!profile) {
        return response.status(400).json({ 
          error: 'Client profile not found' 
        })
      }

      // Verify client user exists
      const client = await User.findBy('id', data.clientId)
      if (!client) {
        return response.status(400).json({ 
          error: 'Client user not found' 
        })
      }

      // Remove status and items from incoming data
      const { status, items, ...orderData } = data

      // Create the order
      const order = await Order.create({
        id: randomUUID(),
        ...orderData
      })

      // Create order items
      await Promise.all(items.map((item: any) => 
        OrderItem.create({
          id: randomUUID(),
          orderId: order.id,
          ...item
        })
      ))

      // Create initial order status
      await OrderStatus.create({
        id: randomUUID(),
        orderId: order.id,
        status: Status.DRAFT,
        isCurrent: true,
        description: 'Order created and is in draft state'
      })

      // Load the relationships
      await order.load('items')
      await order.load('orderStatuses', (query) => {
        query.where('isCurrent', true)
      })
      await order.load('client')
      await order.load('clientProfile')

      return response.json(order)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async getAllOrders({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .preload('client')
        .preload('clientProfile')
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.where('isCurrent', true)
        })
        .orderBy('createdAt', 'desc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async getClientOrders({ params, response }: HttpContext) {
    try {
      const orders = await Order.query()
        .where('clientId', params.clientId)
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.where('isCurrent', true)
        })
        .preload('client')
        .preload('clientProfile')
        .orderBy('createdAt', 'desc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async upsertOrder({ request, response }: HttpContext) {
    const order: Order = request.body() as Order
    // TODO: Implement database upsert
    return response.json(order)
  }

  async updateStatus({ request, response }: HttpContext) {
    const id = request.param('id')
    const { status } = request.body()
    
    try {
      // Set all previous statuses to not current
      await OrderStatus.query()
        .where('orderId', id)
        .update({ isCurrent: false })

      // Create new current status
      await OrderStatus.create({
        id: randomUUID(),
        orderId: id,
        status,
        isCurrent: true
      })

      const order = await Order.findOrFail(id)
      await order.load('items')
      await order.load('orderStatuses', (query) => {
        query.where('isCurrent', true)
      })

      return response.json(order)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async assignCourier({ request, response }: HttpContext) {
    const id = request.param('id')
    const { courierId } = request.body()
    // TODO: Implement courier assignment
    return response.json({} as Order)
  }

  async reorderOrders({ request, response }: HttpContext) {
    const { orderIds } = request.body()
    // TODO: Implement reordering
    return response.json(true)
  }

  async getAllOrderStatuses({ response }: HttpContext) {
    try {
      const orderStatuses = await OrderStatus.query()
      return response.json(orderStatuses)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async deleteOrder({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      
      // Delete associated order statuses
      await OrderStatus.query()
        .where('orderId', order.id)
        .delete()
      
      // Delete associated order items
      await OrderItem.query()
        .where('orderId', order.id)
        .delete()
      
      // Delete the order
      await order.delete()
      
      return response.json({ message: 'Order and associated data deleted successfully' })
    } catch (error) {
      return response.status(404).json({ 
        error: 'Order not found' 
      })
    }
  }
} 