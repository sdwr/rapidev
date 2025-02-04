import type { ProfileInfo } from '@/models/ProfileInfo'
import type { Order } from '@/models/Order'
import { OrderStatus } from '@/models/Order'
import type { Courier } from '@/models/Courier'

// Client API functions
export async function getClientProfile(clientId: string): Promise<ProfileInfo> {
  // TODO: Implement API call
  return {} as ProfileInfo
}

export async function upsertClientProfile(profile: ProfileInfo): Promise<ProfileInfo> {
  // TODO: Implement API call
  return profile
}

export async function getClientOrders(clientId: string): Promise<Order[]> {
  // TODO: Implement API call
  return []
}

export async function upsertOrder(order: Order): Promise<Order> {
  // TODO: Implement API call
  return order
}

export async function updateOrderState(orderId: string, status: OrderStatus): Promise<Order> {
  // TODO: Implement API call
  return {} as Order
}

// Admin API functions
export async function getAllClients(): Promise<ProfileInfo[]> {
  // TODO: Implement API call
  return []
}

export async function getAllOrders(): Promise<Order[]> {
  // TODO: Implement API call
  return []
}

export async function getAllCouriers(): Promise<Courier[]> {
  // TODO: Implement API call
  return []
}

export async function assignOrderToCourier(orderId: string, courierId: string): Promise<Order> {
  // TODO: Implement API call
  return {} as Order
}

export async function reorderOrders(orderIds: string[]): Promise<boolean> {
  // TODO: Implement API call
  return true
}

// Courier API functions
export async function acceptOrder(orderId: string, courierId: string): Promise<Order> {
  // TODO: Implement API call
  return {} as Order
} 