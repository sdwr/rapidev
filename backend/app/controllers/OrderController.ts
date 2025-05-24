import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import OrderStatus from '#models/order_status'
import OrderItem from '#models/order_item'
import User from '#models/user'
import OrderItemStatus from '#models/order_item_status'

import { OrderStatusEnum } from '#shared/enums/OrderEnums'
import OrderStatusService from '#services/OrderStatusService'
import OrderItemStatusService from '#services/OrderItemStatusService'
import { OrderItemStatusEnum } from '#shared/enums/OrderItemEnums'

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
        status: OrderStatusEnum.DRAFT,
        isCurrent: true,
        description: 'Order created and is in draft state'
      })

      // Load the relationships
      await order.load('items', (query) => {
        query.preload('orderItemStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
      })
      await order.load('orderStatuses', (query) => {
        query.orderBy('createdAt', 'asc')
      })
      await order.load('client')
      await order.load('receipt')

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
        .preload('items', (query) => {
          query.preload('orderItemStatuses', (query) => {
            query.orderBy('createdAt', 'asc')
          })
        })
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .preload('receipt')
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
        .preload('items', (query) => {
          query.preload('orderItemStatuses', (query) => {
            query.orderBy('createdAt', 'asc')
          })
        })
        .preload('orderStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
        .preload('receipt')
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
        .preload('receipt')
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
        .preload('receipt')
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
    await order.load('items', (query) => {  
      query.preload('orderItemStatuses', (query) => {
        query.orderBy('createdAt', 'asc')
      })
    })
    await order.load('orderStatuses')
    await order.load('client')
    await order.load('receipt')
    return order
  }

  //order status endpoints
  async updateOrderStatus({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { status } = request.body()
      
      // Find the order
      const order = await Order.find(id)
      if (!order) {
        return response.status(404).json({ error: 'Order not found' })
      }
      
      await order.load('items')
      
      // Create the new status using the service
      const orderStatus = await OrderStatusService.createStatus(
        order.id,
        status
      )
      
      // Return the updated order with its statuses
      await order.load('orderStatuses')

      // Update all order items to the new status if necessary
      if (status === OrderStatusEnum.PICKED_UP) {
        for (const item of order.items) {
          await OrderItemStatusService.createStatus(
            item.id,
            status,
            `Order status updated to ${status}`
          )
        }
      }

      await order.load('items', (query) => {
        query.preload('orderItemStatuses', (query) => {
          query.orderBy('createdAt', 'asc')
        })
      })
      
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

  async getAllOrderItems({ response }: HttpContext) {
    const orderItems = await OrderItem.query()
      .preload('orderItemStatuses')
    return response.json(orderItems)
  }

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
        OrderItemStatusEnum.ASSIGNED,
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
      const { id, updatedBy } = params
      
      // Find the order item
      const orderItem = await OrderItem.find(id)
      if (!orderItem) {
        return response.status(404).json({ error: 'Order item not found' })
      }
      
      // Keep track of the courier that was unassigned
      const previousCourierId = orderItem.courierId
      
      // Create a status for the unassignment
      await OrderItemStatusService.createStatus(
        orderItem.id,
        OrderItemStatusEnum.ACCEPTED,
        `Unassigned from courier #${previousCourierId}`,
        updatedBy
      )

      // Unassign courier
      orderItem.courierId = null
      await orderItem.save()
      

      
      return response.json(orderItem)
    } catch (error) {
      return response.status(400).json({ error: error.message })
    }
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