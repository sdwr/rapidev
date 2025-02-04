export interface Courier {
  id: string;
  name: string;
  status: CourierStatus;
  currentOrderId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum CourierStatus {
  AVAILABLE = 'AVAILABLE',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE'
} 