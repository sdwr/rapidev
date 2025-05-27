import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {  
  getOrder, 
  createOrder, 
  updateOrder, 
  updateOrderState,
  getClientOrders,
  getAllOrders
} from '../api/api'
import type { Order } from '../shared/models/Order'
import { OrderStatusEnum } from '../shared/enums/OrderEnums'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES } from '../utils/consts'
import { getCurrentStatus } from '../utils'

export const useOrderStore = defineStore('order', () => {
  // State
  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeOrders = computed(() => {
    return orders.value.filter(order => 
      ACTIVE_ORDER_STATUSES.includes(getCurrentStatus(order))
    )
  })

  const orderHistory = computed(() => {
    return orders.value.filter(order => 
      HISTORY_ORDER_STATUSES.includes(getCurrentStatus(order))
    )
  })

  const allOrders = computed(() => {
    return orders.value
  })

  const getOrderById = computed(() => {
    return (id: number) => orders.value.find(order => order.id === id)
  })

  // Actions
  const fetchAllOrders = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await getAllOrders()
      orders.value = response
    } catch (err) {
      console.error('Error fetching orders:', err)
      error.value = 'Failed to fetch orders'
    } finally {
      isLoading.value = false
    }
  }

  const fetchClientOrders = async (clientId: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await getClientOrders(clientId.toString())
      orders.value = response
    } catch (err) {
      console.error('Error fetching client orders:', err)
      error.value = 'Failed to fetch client orders'
    } finally {
      isLoading.value = false
    }
  }

  const fetchOrderById = async (id: number) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await getOrder(id.toString())
      
      // Update the order in the store if it exists
      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = response
      } else {
        orders.value.push(response)
      }
      
      return response
    } catch (err) {
      console.error(`Error fetching order ${id}:`, err)
      error.value = 'Failed to fetch order'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const createNewOrder = async (orderData: Partial<Order>) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await createOrder(orderData as Order)
      orders.value.unshift(response) // Add to beginning of array
      return response
    } catch (err) {
      console.error('Error creating order:', err)
      error.value = 'Failed to create order'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateExistingOrder = async (orderData: Order) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await updateOrder(orderData)
      
      // Update the order in the store
      const index = orders.value.findIndex(order => order.id === orderData.id)
      if (index !== -1) {
        orders.value[index] = response
      }
      
      return response
    } catch (err) {
      console.error('Error updating order:', err)
      error.value = 'Failed to update order'
      return null
    } finally {
      isLoading.value = false
    }
  }

  const updateOrderStatus = async (orderId: number, status: OrderStatusEnum) => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await updateOrderState(orderId.toString(), status)
      
      // Update the order in the store
      const index = orders.value.findIndex(order => order.id === orderId)
      if (index !== -1) {
        orders.value[index] = response
      }
      
      return response
    } catch (err) {
      console.error('Error updating order status:', err)
      error.value = 'Failed to update order status'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    orders,
    isLoading,
    error,
    
    // Getters
    activeOrders,
    orderHistory,
    getOrderById,
    allOrders,
    
    // Actions
    fetchAllOrders,
    fetchClientOrders,
    fetchOrderById,
    createNewOrder,
    updateExistingOrder,
    updateOrderStatus
  }
}) 