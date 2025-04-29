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

// Format and limit phone number as user types
export const formatPhoneNumber = (value: string) => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  value = digitsOnly.substring(0, 10);
  return value;
}