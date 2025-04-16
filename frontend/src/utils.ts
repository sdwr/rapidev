import type { Order } from '../shared/models/Order'
import type { OrderStatus } from '../shared/models/OrderStatus'

export const getCurrentStatus = (order: Order): OrderStatus | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  return order.orderStatuses[order.orderStatuses.length - 1].status
} 

export const getCurrentStatusTimestamp = (order: Order): Date | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  return order.orderStatuses[order.orderStatuses.length - 1].createdAt
}

