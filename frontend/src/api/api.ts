import type { ProfileInfo } from '../../../shared/models/ProfileInfo'
import type { Order } from '../../../shared/models/Order'
import { OrderStatus } from '../../../shared/enums/OrderEnums'
import type { Courier } from '../../../shared/models/Courier'
import { getBaseUrl } from './config'

const BASE_URL = getBaseUrl()

// Client API functions
export async function getClientProfile(clientId: string): Promise<ProfileInfo> {
  const response = await fetch(`${BASE_URL}/api/clients/${clientId}/profile`)
  if (!response.ok) throw new Error('Failed to fetch client profile')
  return response.json()
}

export async function upsertClientProfile(profile: ProfileInfo): Promise<ProfileInfo> {
  const response = await fetch(`${BASE_URL}/api/clients/${profile.id}/profile`, {
    method: profile.id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })
  if (!response.ok) throw new Error('Failed to update client profile')
  return response.json()
}

export async function getClientOrders(clientId: string): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/api/clients/${clientId}/orders`)
  if (!response.ok) throw new Error('Failed to fetch client orders')
  return response.json()
}

export async function upsertOrder(order: Order): Promise<Order> {
  const response = await fetch(`${BASE_URL}/api/orders`, {
    method: order.id ? 'PUT' : 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(order),
  })
  if (!response.ok) throw new Error('Failed to update order')
  return response.json()
}

export async function updateOrderState(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error('Failed to update order status')
  return response.json()
}

// Admin API functions
export async function getAllClients(): Promise<ProfileInfo[]> {
  const response = await fetch(`${BASE_URL}/api/clients/all`)
  if (!response.ok) throw new Error('Failed to fetch all clients')
  return response.json()
}

export async function getAllOrders(): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/api/orders/all`)
  if (!response.ok) throw new Error('Failed to fetch all orders')
  return response.json()
}

export async function getAllCouriers(): Promise<Courier[]> {
  const response = await fetch(`${BASE_URL}/api/couriers/all`)
  if (!response.ok) throw new Error('Failed to fetch all couriers')
  return response.json()
}

export async function assignOrderToCourier(orderId: string, courierId: string): Promise<Order> {
  const response = await fetch(`${BASE_URL}/api/orders/${orderId}/assign`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courierId }),
  })
  if (!response.ok) throw new Error('Failed to assign order to courier')
  return response.json()
}

export async function reorderOrders(orderIds: string[]): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/api/orders/reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderIds }),
  })
  if (!response.ok) throw new Error('Failed to reorder orders')
  return response.json()
}

// Courier API functions
export async function acceptOrder(orderId: string, courierId: string): Promise<Order> {
  const response = await fetch(`${BASE_URL}/api/orders/${orderId}/accept`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courierId }),
  })
  if (!response.ok) throw new Error('Failed to accept order')
  return response.json()
} 