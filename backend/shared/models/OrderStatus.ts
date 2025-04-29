import { Order } from './Order'
import { OrderStatusEnum } from '../enums/OrderEnums'

export interface OrderStatus {
  id: number
  orderId: number
  status: OrderStatusEnum
  description: string
  isCurrent: boolean
  updatedBy: number | null
  createdAt: string
  updatedAt: string
  
  // Related entities
  order?: Order
} 