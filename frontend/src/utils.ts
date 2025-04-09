import type { Order } from '../shared/models/Order'
import type { OrderStatus } from '../shared/models/OrderStatus'

export const getCurrentStatus = (order: Order): OrderStatus | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  return order.orderStatuses[0].status
} 

export const mapOrderStatuses = (orders: Order[]): Order[] => {
  return orders.map(order => {
    return {
      ...order,
      status: getOrderStatus(order)
    }
  })
}

export const mapOrderStatus = (order: Order): Order => {
  return {
    ...order,
    status: getOrderStatus(order)
  }
}

const getOrderStatus = (order: Order): OrderStatus => {
  if (order.orderStatuses.length === 0) {
    return null
  }
  return order.orderStatuses[0].status
}
