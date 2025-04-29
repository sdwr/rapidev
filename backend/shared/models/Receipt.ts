import { Order } from './Order'
import { ReceiptStatusEnum } from '../enums/ReceiptEnums'

export interface Receipt {
  id: number
  orderId: number
  deliveryFee: number
  bookingFee: number
  discount: number
  total: number
  amountPaid: number
  receiptStatus: ReceiptStatusEnum
  createdAt: string
  updatedAt: string
  
  // Related entities
  order?: Order
} 