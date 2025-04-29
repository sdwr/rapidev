import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getAllOrderItems,
} from '../api/api'
import type { OrderItem } from '../shared/models/OrderItem'

export const useOrderItemStore = defineStore('orderItem', () => {
  // State
  const orderItems = ref<OrderItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  const fetchAllOrderItems = async () => {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await getAllOrderItems()
      orderItems.value = response
      return response
    } catch (err) {
      console.error('Error fetching order items:', err)
      error.value = 'Failed to fetch order items'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    orderItems,
    isLoading,
    error,
    
    // Actions
    fetchAllOrderItems,
  }
}) 