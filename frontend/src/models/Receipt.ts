export interface Receipt {
  id?: number
  orderId: number
  deliveryFee: number
  bookingFee: number
  discount: number
  total: number
  amountPaid: number
  receiptStatus: ReceiptStatus
  createdAt?: string
  updatedAt?: string
}

export interface ReceiptCreateRequest {
  orderId: number
  deliveryFee?: number
  bookingFee?: number
  discount?: number
  total: number
  amountPaid?: number
  receiptStatus?: ReceiptStatus
}

export interface ReceiptUpdateRequest {
  deliveryFee?: number
  bookingFee?: number
  discount?: number
  total?: number
  amountPaid?: number
  receiptStatus?: ReceiptStatus
} 

export enum ReceiptStatus {
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  UNPAID = 'UNPAID',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}
