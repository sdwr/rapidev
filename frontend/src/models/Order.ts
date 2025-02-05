import type { OrderItem } from './OrderItem'

export interface Order {
  id?: string;
  clientId: string;
  status: OrderStatus;
  pickupAddress: string;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export enum Size {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE'
} 