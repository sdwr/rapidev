import type { ProfileInfo } from '../../../shared/models/ProfileInfo'
import type { Order } from '../../../shared/models/Order'
import { OrderStatus } from '../../../shared/enums/OrderEnums'
import type { Courier } from '../../../shared/models/Courier'
import { getBaseUrl } from './config'
import { handleApiError } from '../utils/errorHandler'
const BASE_URL = getBaseUrl()

// Client API functions
export async function getClientProfile(clientId: string): Promise<ProfileInfo> {
  try {
    const response = await fetch(`${BASE_URL}/api/clients/${clientId}/profile`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function upsertClientProfile(profile: ProfileInfo): Promise<ProfileInfo> {
  const response = await fetch(`${BASE_URL}/api/clients/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profile),
  })
  if (!response.ok) {
    const error = await response.json()
    handleApiError(error)
    throw new Error(error.error || 'Failed to update client profile')
  }
  return response.json()
}

export async function getClientOrders(clientId: string): Promise<Order[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/client/${clientId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function upsertOrder(order: Order): Promise<Order> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: order.id ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function updateOrderState(orderId: string, status: OrderStatus): Promise<Order> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// Admin API functions
export async function getAllClients(): Promise<ProfileInfo[]> {
  const response = await fetch(`${BASE_URL}/api/clients/all`)
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch all clients')
  }
  return response.json()
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/all`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function getAllCouriers(): Promise<Courier[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/couriers/all`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function assignOrderToCourier(orderId: string, courierId: string): Promise<Order> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courierId }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function reorderOrders(orderIds: string[]): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/reorder`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderIds }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

// Courier API functions
export async function acceptOrder(orderId: string, courierId: string): Promise<Order> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/accept`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courierId }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export const getDebugData = async () => {
  try {
    const response = await fetch(`${getBaseUrl()}/debug`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
}

export async function getAllOrderStatuses() {
  try {
    const response = await fetch(`${BASE_URL}/api/orderstatuses`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    throw error
  }
} 