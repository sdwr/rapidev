import { OrderStatus, Size } from '../enums/OrderEnums'

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

export interface OrderItem {
  description: string;
  quantity: number;
  size: Size;
} 