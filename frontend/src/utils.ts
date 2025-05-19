import type { Order } from './shared/models/Order'
import type { OrderItem } from './shared/models/OrderItem'
import { OrderStatusEnum } from './shared/enums/OrderEnums'
import { OrderItemStatusEnum } from './shared/enums/OrderItemEnums'
export const getCurrentStatus = (order: Order): OrderStatusEnum | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  let status = order.orderStatuses.find(status => status.isCurrent)
  return status?.status as OrderStatusEnum
} 

export const getCurrentStatusTimestamp = (order: Order): string | undefined => {
  if (!order.orderStatuses || order.orderStatuses.length === 0) {
    return undefined
  }
  
  let status = order.orderStatuses.find(status => status.isCurrent)
  return status?.createdAt
}

export const getCurrentItemStatus = (order: OrderItem): OrderItemStatusEnum | undefined => {
  if (!order.orderItemStatuses || order.orderItemStatuses.length === 0) {
    return undefined
  }
  
  let status = order.orderItemStatuses.find(status => status.isCurrent)
  return status?.status as OrderItemStatusEnum
}

export const getCurrentItemStatusTimestamp = (order: OrderItem): string | undefined => {
  if (!order.orderItemStatuses || order.orderItemStatuses.length === 0) {
    return undefined
  }
  
  let status = order.orderItemStatuses.find(status => status.isCurrent)
  return status?.createdAt
}

// Format and limit phone number as user types
export const formatPhoneNumber = (value: string) => {
  // Remove any non-digit characters
  const digitsOnly = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  value = digitsOnly.substring(0, 10);
  return value;
}