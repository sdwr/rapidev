import { OrderStatusEnum } from '../enums/OrderEnums'
import { OrderItem } from './OrderItem'

export interface Order {
  id?: string;
  clientId: string;
  status: OrderStatusEnum;
  pickupAddress: string;
  deliveryAddress: string;
  items: OrderItem[];
  createdAt?: Date;
  updatedAt?: Date;
}