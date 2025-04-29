import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import OrderStatus from '#models/order_status'
import OrderItem from '#models/order_item'
import User from '#models/user'
import OrderItemStatus from '#models/order_item_status'

import { OrderStatus as Status } from '#shared/enums/OrderEnums'
import OrderStatusService from '#services/OrderStatusService'
import OrderItemStatusService from '#services/OrderItemStatusService'
import { OrderItemStatus as OrderItemStatusEnum } from '#shared/enums/OrderItemEnums'

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
          status: OrderItemStatusEnum.DRAFT,
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
  async updateOrderStatus({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { status, notes } = request.body()
      
      // Find the order
      const order = await Order.find(id)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }
      
      // Create the new status using the service
      const orderStatus = await OrderStatusService.createStatus(
        order.id,
        status,
        notes
      )
      
      // Return the updated order with its statuses
      await order.load('orderStatuses')
      
      return response.json({
        order,
        currentStatus: orderStatus
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
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

  async assignCourier({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { courierId, updatedBy } = request.body()
      
      // Find the order item
      const orderItem = await OrderItem.find(id)
      if (!orderItem) {
        return response.status(404).json({ error: 'Order item not found' })
      }
      
      // Assign courier
      orderItem.courierId = courierId
      await orderItem.save()
      
      // Create a status for the assignment
      await OrderItemStatusService.createStatus(
        orderItem.id,
        OrderItemStatus.ASSIGNED,
        `Assigned to courier #${courierId}`,
        updatedBy
      )
      
      // Load relationships
      await orderItem.load('courier')
      await orderItem.load('orderItemStatuses', (query) => {
        query.orderBy('createdAt', 'desc')
      })
      
      return response.json(orderItem)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async unassignCourier({ params, response }: HttpContext) {
    try {
      const { id } = params
      
      // Find the order item
      const orderItem = await OrderItem.find(id)
      if (!orderItem) {
        return response.status(404).json({ error: 'Order item not found' })
      }
      
      // Find the order
      const order = await Order.find(orderItem.orderId)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }
      
      // Keep track of the courier that was unassigned
      const previousCourierId = orderItem.courierId
      
      // Unassign courier
      orderItem.courierId = null
      await orderItem.save()
      
      // Create a status for the unassignment
      await OrderStatusService.createStatus(
        order.id,
        Status.ACCEPTED,
        `Courier #${previousCourierId} unassigned from order item #${orderItem.id}`
      )
      
      return response.json(orderItem)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }

  async updateOrderItem({ params, request, response }: HttpContext) {
    const { id } = params
    const { status, notes } = request.body()

    const orderItem = await OrderItem.findOrFail(id)
    await orderItem.merge({ status, notes }).save()

    return response.json(orderItem)
  }

  async updateOrderItemStatus({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { status, notes, updatedBy } = request.body()
      
      // Find the order item by ID
      const orderItem = await OrderItem.find(id)
      if (!orderItem) {
        return response.status(404).json({ error: 'Order item not found' })
      }
      
      // Get current status
      const currentStatus = await OrderItemStatusService.getCurrentStatus(orderItem.id)
      
      // Check if the status transition is valid
      if (currentStatus && !OrderItemStatusService.canTransitionTo(currentStatus.status, status)) {
        return response.status(400).json({ 
          error: `Cannot transition from ${currentStatus.status} to ${status}` 
        })
      }
      
      // Create the new status using the service
      const orderItemStatus = await OrderItemStatusService.createStatus(
        orderItem.id,
        status,
        notes,
        updatedBy
      )
      
      // Load status history
      await orderItem.load('orderItemStatuses', (query) => {
        query.orderBy('createdAt', 'desc')
      })
      
      // Return the updated order item with status history
      return response.json({
        orderItem,
        currentStatus: orderItemStatus
      })
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
  }
} 