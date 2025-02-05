import { Size } from './Order'

export interface OrderItem {
  id?: string
  orderId?: string
  description: string
  quantity: number
  size: Size
  createdAt?: Date
  updatedAt?: Date
} 