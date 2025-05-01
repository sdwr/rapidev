import type { Profile } from '../shared/models/Profile'
import type { Order } from '../shared/models/Order'
import type { User } from '../shared/models/User'
import { OrderStatusEnum } from '../shared/enums/OrderEnums'
import { getBaseUrl } from './config'
import { handleApiError } from '../utils/errorHandler'
import { Receipt } from '../shared/models/Receipt'
import { UserTypeEnum } from '../shared/enums/UserEnums'
import type { OrderItem } from '../shared/models/OrderItem'

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
export async function getProfile(profileId: string): Promise<Profile> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/${profileId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getProfileByUserId(userId: string): Promise<Profile> {
  try {
    const response = await fetch(`${BASE_URL}/api/profiles/user/${userId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function upsertProfile(profile: Profile): Promise<Profile> {
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

export async function getAllProfiles(): Promise<Profile[]> {
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
    const response = await fetch(`${BASE_URL}/api/users/login`, {
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

export const updateUser = async (userId: number, userData: any) => {
  try {
    const response = await fetch(`${BASE_URL}/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getAllUsers(userType?: UserTypeEnum): Promise<User[]> {
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

export async function getAllUsersByType(userType: UserTypeEnum): Promise<User[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/users/all/${userType}`)
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

export async function getOrder(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}`)
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

export async function updateOrder(order: Order) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${order.id}`, {
      method: 'PUT',
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

export async function assignCourier(orderId: string, courierId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/courier`, {
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
    return null
  }
}

export async function unassignCourier(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/${orderId}/unassign-courier`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
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

// Receipt API functions
export async function getAllReceipts() {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return []
  }
}

export async function deleteAllReceipts() {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts`, {
      method: 'DELETE',
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function createReceipt(receipt: Receipt) {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receipt),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function updateReceipt(receipt: Receipt) {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts/${receipt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(receipt),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getReceipt(receiptId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts/${receiptId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getReceiptByOrderId(orderId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/receipts/order/${orderId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export const assignCourierToOrderItem = async (orderItemId: number, courierId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/item/${orderItemId}/courier`, {
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
    return null
  }
}

export const unassignCourierFromOrderItem = async (orderItemId: number) => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/item/${orderItemId}/unassign-courier`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export const updateOrderItemStatus = async (orderItemId: number, status: string, notes?: string ) => {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/item/${orderItemId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, notes }),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export const getCouriers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/users?userType=COURIER`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function getAllOrderItems(): Promise<OrderItem[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/items`)
    if (!response.ok) {
      throw new Error('Failed to fetch order items')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching all order items:', error)
    throw error
  }
}

export async function getOrderItem(orderItemId: string) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/item/${orderItemId}`)
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}

export async function updateOrderItem(orderItem: OrderItem) {
  try {
    const response = await fetch(`${BASE_URL}/api/orders/item/${orderItem.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderItem),
    })
    if (!response.ok) throw await response.json()
    return response.json()
  } catch (error) {
    handleApiError(error)
    return null
  }
}
