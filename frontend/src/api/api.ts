import type { ProfileInfo } from '../../../shared/models/ProfileInfo'
import type { Order } from '../../../shared/models/Order'
import type { User } from '../../../shared/models/User'
import { OrderStatus } from '../../../shared/enums/OrderEnums'
import type { Courier } from '../../../shared/models/Courier'
import { getBaseUrl } from './config'
import { handleApiError } from '../utils/errorHandler'

const BASE_URL = getBaseUrl()

// User API functions
export async function getUser(userId: string): Promise<User> {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

// Profile API functions
export async function getProfile(profileId: string): Promise<ProfileInfo> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/${profileId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getProfileByUserId(userId: string): Promise<ProfileInfo> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/user/${userId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function upsertProfile(profile: ProfileInfo): Promise<ProfileInfo> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getAllProfiles(): Promise<ProfileInfo[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

// Order API functions
export async function getClientOrders(clientId: string): Promise<Order[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/client/${clientId}`)
    if (!response.ok) throw await response.json()
    return await response.json()
  } catch (error) {
    handleApiError(error)
    return []
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
    let responseOrder = await response.json()
    return responseOrder
  } catch (error) {
    handleApiError(error)
    return null
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
    return await response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getAllOrders(): Promise<Order[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/all`)
    if (!response.ok) throw await response.json()
    return await response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function getAllOrdersWithHistory(): Promise<Order[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/all-with-history`)
    if (!response.ok) throw await response.json()
    return await response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function getAllOrderStatuses() {
  try {
    const response = await fetch(`${BASE_URL}/api/orderstatuses`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function getOrderStatuses(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/statuses`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

// User API functions
export async function loginOrRegister(email: string, password: string, userType: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, userType }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getAllUsers(userType?: 'CLIENT' | 'COURIER' | 'ADMIN'): Promise<User[]> {
  try {
    const url = userType 
      ? `${BASE_URL}/api/users/all?userType=${userType}`
      : `${BASE_URL}/api/users/all`
    const response = await fetch(url)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

// Debug API function
export const getDebugData = async () => {
  try {
    const response = await fetch(`${getBaseUrl()}/debug`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function deleteUser(userId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function createOrder(order: Order) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(order),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export const getCourierOrders = async (courierId: string): Promise<Order[]> => {
  const response = await fetch(`${BASE_URL}/api/orders/courier/${courierId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch courier orders')
  }

  return response.json()
}

export async function createProfile(profile: ProfileInfo) {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profile),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getProfilesForUserByProfileType(userId: string, profileType: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/user/${userId}/${profileType}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function deleteProfile(profileId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/${profileId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}