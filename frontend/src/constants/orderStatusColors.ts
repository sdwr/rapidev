import { OrderStatus } from '@/models/Order'

export const orderStatusColors: Record<OrderStatus, { background: string; text: string }> = {
  [OrderStatus.DRAFT]: {
    background: '#E3E3E3',
    text: '#333333'
  },
  [OrderStatus.PENDING]: {
    background: '#FFF3CD',
    text: '#856404'
  },
  [OrderStatus.ACCEPTED]: {
    background: '#D4EDDA',
    text: '#155724'
  },
  [OrderStatus.ASSIGNED_TO_COURIER]: {
    background: '#CCE5FF',
    text: '#004085'
  },
  [OrderStatus.CONFIRMED_BY_COURIER]: {
    background: '#CCE5FF',
    text: '#004085'
  },
  [OrderStatus.PICKED_UP]: {
    background: '#CCE5FF',
    text: '#004085'
  },
  [OrderStatus.IN_TRANSIT]: {
    background: '#D1ECF1',
    text: '#0C5460'
  },
  [OrderStatus.DELIVERED]: {
    background: '#D4EDDA',
    text: '#155724'
  },
  [OrderStatus.CANCELLED_BY_CLIENT]: {
    background: '#F8D7DA',
    text: '#721C24'
  },
  [OrderStatus.CANCELLED_BY_COURIER]: {
    background: '#F8D7DA',
    text: '#721C24'
  },
  [OrderStatus.CANCELLED_BY_ADMIN]: {
    background: '#F8D7DA',
    text: '#721C24'
  } 
} 
