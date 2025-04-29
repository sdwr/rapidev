import { OrderItem } from './OrderItem'
import { User } from './User'
import { OrderItemStatusEnum } from '../enums/OrderItemEnums'

export interface OrderItemStatus {
  id: number
  orderItemId: number
  status: OrderItemStatusEnum
  notes: string | null
  isCurrent: boolean
  updatedBy: number | null
  createdAt: string
  updatedAt: string
  
  // Related entities
  orderItem?: OrderItem
  updatedByUser?: User
} 