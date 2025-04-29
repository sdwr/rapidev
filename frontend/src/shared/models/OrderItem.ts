import { Order } from './Order'
import { User } from './User'
import { OrderItemStatus } from './OrderItemStatus'

export interface OrderItem {
  id: number
  orderId: number
  courierId: number | null
  pickupAddress: string
  deliveryAddress: string
  deliveryPhone: string
  deliveryNotes: string | null
  createdAt: string
  updatedAt: string
  
  // Related entities
  order?: Order
  courier?: User
  orderItemStatuses?: OrderItemStatus[]
} 