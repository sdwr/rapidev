<template>
  <div class="list-item">
    <h3>Order #{{ order.id }}</h3>
    <p>Status: {{ getCurrentStatus(order) }}</p>
    <p>Client: {{ order.client?.name }}</p>
    <p>Pickup Address: {{ order.pickupAddress }}</p>
    <div class="order-items">
      <div class="order-item-header" @click="toggleItems">
        <h4>Items</h4>
      </div>
      <div class="order-item-entries">
        <OrderItemCard
          v-for="item in order.items"
          :key="item.id"
          :order-item="item"
          :userType="userType"
          :available-couriers="availableCouriers"
        />
      </div>
    </div>
    
    <!-- Replace the existing status history section with the StatusHistory component -->
    <StatusHistory :statuses="props.order.orderStatuses" />

    <!-- Admin Actions -->
    <div v-if="userType === 'ADMIN'" class="actions">
      <div v-if="canAcceptOrder" class="action-buttons">
        <button @click="acceptOrder" class="accept-button">Accept</button>
        <button @click="cancelOrder" class="cancel-button">Cancel</button>
      </div>
    </div>

    <!-- Client Actions -->
    <div v-if="userType === 'CLIENT'" class="actions">
      <div v-if="canCancelOrder" class="action-buttons">
        <button @click="cancelOrder" class="cancel-button">Cancel Order</button>
      </div>
    </div>

    <!-- Courier Actions -->
    <div v-if="userType === 'COURIER'" class="actions">
      <div v-if="isAssigned" class="action-buttons">
        <button @click="confirmOrder" class="confirm-button">Confirm</button>
        <button @click="cancelOrder" class="cancel-button">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrderStatusEnum } from '../shared/enums/OrderEnums'
import { Order } from '../shared/models/Order'
import { User } from '../shared/models/User'
import { updateOrderState, getAllUsersByType } from '../api/api'
import { toast } from 'vue3-toastify'
import { getCurrentStatus, getCurrentStatusTimestamp } from '../utils'
import OrderItemCard from './OrderItemCard.vue'
import { UserTypeEnum } from '../shared/enums/UserEnums'
import StatusHistory from './StatusHistory.vue'  // Import the StatusHistory component

const props = defineProps<{
  order: Order
  userType: 'ADMIN' | 'CLIENT' | 'COURIER'
  couriers?: User[]
}>()

const emit = defineEmits<{
  (e: 'orderUpdated'): void
}>()

const isStatusHistoryExpanded = ref(false)
const selectedCourier = ref('')
const isOrderExpanded = ref(false)
const expandedItemId = ref(null)
const availableCouriers = ref([])

const toggleStatusHistory = () => {
  isStatusHistoryExpanded.value = !isStatusHistoryExpanded.value
}

const canAcceptOrder = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatusEnum.PENDING || currentStatus === OrderStatusEnum.DRAFT
})

const isAccepted = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatusEnum.ACCEPTED
})

const isAssigned = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatusEnum.ASSIGNED_TO_COURIER
})

const canCancelOrder = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return [OrderStatusEnum.DRAFT, OrderStatusEnum.PENDING, OrderStatusEnum.ACCEPTED].includes(currentStatus)
})

const acceptOrder = async () => {
  try {
    await updateOrderState(props.order.id, OrderStatusEnum.ACCEPTED)
    toast.success('Order accepted successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error accepting order:', error)
    toast.error('Failed to accept order')
  }
}

const cancelOrder = async () => {
  try {
    const status = props.userType === 'CLIENT' 
      ? OrderStatusEnum.CANCELLED_BY_CLIENT 
      : props.userType === 'COURIER'
        ? OrderStatusEnum.CANCELLED_BY_COURIER
        : OrderStatusEnum.CANCELLED_BY_ADMIN
    
    await updateOrderState(props.order.id, status)
    toast.success('Order cancelled successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error cancelling order:', error)
    toast.error('Failed to cancel order')
  }
}

const confirmOrder = async () => {
  try {
    await updateOrderState(props.order.id, OrderStatusEnum.CONFIRMED_BY_COURIER)
    toast.success('Order confirmed successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error confirming order:', error)
    toast.error('Failed to confirm order')
  }
}

// Fetch available couriers for admin users
onMounted(async () => {
  if (props.userType === UserTypeEnum.ADMIN) {
    try {
      const couriers = await getAllUsersByType(UserTypeEnum.COURIER)
      if (couriers) {
        availableCouriers.value = couriers
      }
    } catch (error) {
      console.error('Failed to fetch couriers:', error)
      toast.error('Failed to load available couriers')
    }
  }
})

// Toggle order expansion
const toggleOrder = () => {
  isOrderExpanded.value = !isOrderExpanded.value
}


// Expand a specific item
const expandItem = (itemId) => {
  expandedItemId.value = itemId
}
</script>

<style scoped>
.list-item {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.order-items {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.order-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.accept-button {
  background-color: #4CAF50; /* Green for accept */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.accept-button:hover {
  background-color: #45a049;
}

.cancel-button {
  background-color: #f44336; /* Red for cancel */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background-color: #da190b;
}

.confirm-button {
  background-color: #2196F3; /* Blue for confirm */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.confirm-button:hover {
  background-color: #0b7dda;
}

.assign-button {
  background-color: #9C27B0; /* Purple for assign */
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.assign-button:hover {
  background-color: #7b1fa2;
}

.assign-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.unassign-button {
  background-color: #FF9800; /* Orange for unassign */
  color: white;
  padding: 0.25rem 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.unassign-button:hover {
  background-color: #f57c00;
}

.courier-assignment {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.courier-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  flex: 1;
}
</style> 