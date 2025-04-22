import { OrderStatus, Size } from '../enums/OrderEnums'
import Receipt from '../models/Receipt'
export interface Order {
  id?: string;
  clientId: string;
  pickupAddress: string;
  items: OrderItem[];
  orderStatuses?: OrderStatus[];
  receipt?: Receipt;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  courierId?: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryNotes: string;
  status: OrderStatus;
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