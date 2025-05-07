import type { Order } from './shared/models/Order'
import type { OrderStatus } from './shared/models/OrderStatus'
import { OrderItemStatus } from './shared/models/OrderItemStatus'
import type { OrderItem } from './shared/models/OrderItem'
export const getCurrentStatus = (order: Order): OrderStatus | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  return order.orderStatuses.find(status => status.isCurrent)
} 

export const getCurrentStatusTimestamp = (order: Order): string | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  return order.orderStatuses.find(status => status.isCurrent)?.createdAt
}

export const getCurrentItemStatus = (order: OrderItem): OrderItemStatus | undefined => {
  if (!order.orderItemStatuses || order.orderItemStatuses.length === 0) {
    return undefined
  }
  
  return order.orderItemStatuses.find(status => status.isCurrent)
}

export const getCurrentItemStatusTimestamp = (order: OrderItem): string | undefined => {
  if (!order.orderItemStatuses || order.orderItemStatuses.length === 0) {
    return undefined
  }
  
  return order.orderItemStatuses.find(status => status.isCurrent)?.createdAt
}

// Format and limit phone number as user types
export const formatPhoneNumber = (value: string) => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  value = digitsOnly.substring(0, 10);
  return value;
}