import { Size } from '#shared/enums/OrderEnums'

export interface Order {
  id?: string;
  clientId: string;
  pickupAddress: string;
  items: OrderItem[];
  status: OrderStatus;
  deliveryPrice: number;
  bookingFee: number;
  discount: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  id?: string;
  orderId: string;
  courierId: string;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryPhone: string;
  deliveryNotes: string;
  status: OrderStatus;
  createdAt?: Date;
  updatedAt?: Date;
} 