import { User } from './User'
import { OrderItem } from './OrderItem'
import { OrderStatus } from './OrderStatus'
import { Receipt } from './Receipt'

export interface Order {
  id: number
  clientId: number
  pickupAddress: string
  createdAt: string
  updatedAt: string
  
  // Related entities
  client?: User
  items?: OrderItem[]
  orderStatuses?: OrderStatus[]
  receipt?: Receipt
}