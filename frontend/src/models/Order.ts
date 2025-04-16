import type { OrderItem } from './OrderItem'
import { OrderStatus, Size } from '../enums/OrderEnums'

export interface Order {
  id?: string;
  clientId: string;
  clientProfileId?: string;
  courierId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  items: OrderItem[];
  orderStatuses?: OrderStatus[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  name: string;
  description?: string;
  size: Size;
  quantity: number;
  price: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum OrderStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  ASSIGNED_TO_COURIER = 'ASSIGNED_TO_COURIER',
  CONFIRMED_BY_COURIER = 'CONFIRMED_BY_COURIER',
  PICKED_UP = 'PICKED_UP',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED_BY_CLIENT = 'CANCELLED_BY_CLIENT',
  CANCELLED_BY_COURIER = 'CANCELLED_BY_COURIER',
  CANCELLED_BY_ADMIN = 'CANCELLED_BY_ADMIN'
}

export enum Size {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  EXTRA_LARGE = 'EXTRA_LARGE'
} 