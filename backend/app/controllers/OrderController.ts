import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import OrderStatus from '#models/order_status'
import OrderItem from '#models/order_item'
import User from '#models/user'
import OrderItemStatus from '#models/order_item_status'

import { OrderStatus as Status } from '#shared/enums/OrderEnums'

export class OrderController {
  //order endpoints
  async getOrder({ params, response }: HttpContext) {
    const order = await Order.findOrFail(params.id)
    await this.loadOrderRelationships(order)

    return response.json(order)
  }

  async createOrder({ request, response }: HttpContext) {
    const data = request.body()
    
    try {
      // Verify client user exists
      const client = await User.findBy('id', data.clientId)
      if (!client) {
        return response.status(400).json({ 
          error: 'Client user not found' 
        })
      }

      // Remove status and items from incoming data
      let { orderStatuses, deliveryItems, ...orderData } = data
      orderData = {
        clientId: orderData.clientId,
        pickupAddress: orderData.pickupAddress,
      }

      // Create the order
      const order = await Order.create({
        ...orderData
      })

      // Create order items
      const orderItems = await Promise.all(deliveryItems.map((item: any) => 
        OrderItem.create({
          orderId: order.id,
          pickupAddress: order.pickupAddress,
          deliveryAddress: item.deliveryAddress,
          deliveryPhone: item.deliveryPhone,
          deliveryNotes: item.deliveryNotes,
        })
      ))

      // Create initial status for each order item
      for (const item of orderItems) {
        await OrderItemStatus.create({
          orderItemId: item.id,
          status: Status.DRAFT,
          notes: 'Order item created'
        })
      }

      // Create initial order status
      await OrderStatus.create({
        orderId: order.id,
        status: Status.DRAFT,
        isCurrent: true,
        description: 'Order created and is in draft state'
      })

      // Load the relationships
      await order.load('items')
      await order.load('orderStatuses', (query) => {
        query.orderBy('createdAt', 'asc')
      })
      await order.load('client')

      return response.json(order)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async updateOrder({ request, response }: HttpContext) {
    const id = request.param('id')
    const data = request.body()

    try {
      const order = await Order.findOrFail(id)
      await order.merge(data).save()
      return response.json(order)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async getAllOrders({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .preload('client')
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .orderBy('createdAt', 'asc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async deleteAllOrders({ response }: HttpContext) {
    await Order.query().delete()
    return response.json({ message: 'All orders deleted' })
  }

  async getAllOrdersWithHistory({ response }: HttpContext) {
    try {
      const orders = await Order.query()
        .preload('client')
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .orderBy('createdAt', 'asc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
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

  async getClientOrders({ params, response }: HttpContext) {
    try {
      const orders = await Order.query()
        .where('clientId', params.clientId)
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .preload('client')
        .orderBy('createdAt', 'asc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async getCourierOrders({ params, response }: HttpContext) {
    try {
      const orders = await Order.query()
        .where('courierId', params.courierId)
        .preload('items')
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .preload('client')
        .orderBy('createdAt', 'asc')
      return response.json(orders)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message
      })
    }
  }

  async loadOrderRelationships(order: Order) {
    // Load relationships
    await order.load('items')
    await order.load('orderStatuses')
    await order.load('client')
    await order.load('receipt')
    return order
  }

  //order status endpoints
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
        orderId: id,
        status,
        isCurrent: true,
        description: ''
      })

      const order = await Order.findOrFail(id)
      await order.load('items')
      await order.load('orderStatuses', (query) => {
        query.orderBy('createdAt', 'asc')
      })

      return response.json(order)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  async getAllOrderStatuses({ response }: HttpContext) {
    try {
      const orderStatuses = await OrderStatus.query()
      return response.json(orderStatuses)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async getOrderStatuses({ params, response }: HttpContext) {
    try {
      const order = await Order.findOrFail(params.id)
      const statuses = await OrderStatus.query()
        .where('orderId', order.id)
        .orderBy('createdAt', 'asc')
      return response.json(statuses)
    } catch (error) {
      return response.status(400).json({ 
        error: error.message 
      })
    }
  }

  //order item endpoints

  async getOrderItem({ params, response }: HttpContext) {
    const orderItem = await OrderItem.findOrFail(params.id)
    await orderItem.load('orderItemStatuses')

    return response.json(orderItem)
  }

  async assignCourier({ request, response }: HttpContext) {
    const id = request.param('id')
    const { courierId } = request.body()
    
    const orderItem = await OrderItem.findOrFail(id)
    const courier = await User.findOrFail(courierId)

    if (courier && courier.userType === 'COURIER') {
      orderItem.courierId = courierId
      await orderItem.save()
    } else {
      return response.status(400).json({ error: 'Courier not found or is not a courier' })
    }

    return response.json(orderItem)
  }

  async unassignCourier({ request, response }: HttpContext) {
    const id = request.param('id')
    const orderItem = await OrderItem.findOrFail(id)
    orderItem.courierId = null
    await orderItem.save()

    return response.json(orderItem)
  }

  async updateOrderItemStatus({ request, response }: HttpContext) {
    const id = request.param('id')
    const { status, notes } = request.body()

    const orderItem = await OrderItem.findOrFail(id)
    let orderItemStatus = {
      orderItemId: orderItem.id,
      status: status,
      notes: notes,
      isCurrent: true,
      updatedBy:  null
    }

    //set all previous statuses to not current
    try {
      await OrderItemStatus.query()
        .where('orderItemId', orderItem.id)
        .update({ isCurrent: false })

      await OrderItemStatus.create(orderItemStatus)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }


    return response.json(orderItem)
  }
} 