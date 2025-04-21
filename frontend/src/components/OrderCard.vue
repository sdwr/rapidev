<template>
  <div class="list-item">
    <h3>Order #{{ order.id }}</h3>
    <p>Status: {{ getCurrentStatus(order) }}</p>
    <p>Client: {{ order.clientId }}</p>
    <p>Courier: {{ order.courierId }}</p>
    <p>Items: {{ order.items.length }}</p>
    <div class="status-history">
      <div class="status-header" @click="toggleStatusHistory">
        <h4>Status History</h4>
        <span class="toggle-icon">{{ isStatusHistoryExpanded ? '▼' : '▶' }}</span>
      </div>
      <div v-if="isStatusHistoryExpanded" class="status-entries">
        <div v-for="status in props.order.orderStatuses" :key="status.id" class="status-entry">
          <span class="status">{{ status.status }}</span>
          <span class="timestamp">{{ new Date(status.createdAt).toLocaleString() }}</span>
          <p class="description">{{ status.description }}</p>
        </div>
      </div>
      <div v-else class="current-status">
        <span class="status">{{ getCurrentStatus(props.order) }}</span>
        <span class="timestamp">{{ getCurrentStatusTimestamp(props.order) }}</span>
      </div>
    </div>

    <!-- Admin Actions -->
    <div v-if="userType === 'admin'" class="actions">
      <div v-if="canAcceptOrder" class="action-buttons">
        <button @click="acceptOrder" class="accept-button">Accept</button>
        <button @click="cancelOrder" class="cancel-button">Cancel</button>
      </div>

      <div v-if="isAccepted" class="courier-assignment">
        <select v-model="selectedCourier" class="courier-select">
          <option value="" selected>Select a courier</option>
          <option v-for="courier in couriers" :key="courier.id" :value="courier.id">
            {{ courier.profile?.name || courier.username }}
          </option>
        </select>
        <button 
          @click="assignCourier" 
          class="assign-button"
          :disabled="!selectedCourier"
        >
          Assign
        </button>
      </div>

      <div v-if="isAssigned" class="courier-assignment">
        <div class="assigned-courier">
          <span>Assigned to: {{ order.courier?.profile?.name || order.courier?.username || order.courierId }}</span>
          <button @click="unassignCourier" class="unassign-button">Unassign</button>
        </div>
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
import { ref, computed } from 'vue'
import { OrderStatus } from '../models/Order'
import { Order } from '../models/Order'
import { User } from '../models/User'
import { updateOrderState, upsertOrder } from '../api/api'
import { toast } from 'vue3-toastify'
import { getCurrentStatus, getCurrentStatusTimestamp } from '../utils'
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

const toggleStatusHistory = () => {
  isStatusHistoryExpanded.value = !isStatusHistoryExpanded.value
}

const canAcceptOrder = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatus.PENDING || currentStatus === OrderStatus.DRAFT
})

const isAccepted = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatus.ACCEPTED
})

const isAssigned = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return currentStatus === OrderStatus.ASSIGNED_TO_COURIER
})

const canCancelOrder = computed(() => {
  const currentStatus = getCurrentStatus(props.order)
  return [OrderStatus.DRAFT, OrderStatus.PENDING, OrderStatus.ACCEPTED].includes(currentStatus)
})

const acceptOrder = async () => {
  try {
    await updateOrderState(props.order.id, OrderStatus.ACCEPTED)
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
      ? OrderStatus.CANCELLED_BY_CLIENT 
      : props.userType === 'COURIER'
        ? OrderStatus.CANCELLED_BY_COURIER
        : OrderStatus.CANCELLED_BY_ADMIN
    
    await updateOrderState(props.order.id, status)
    toast.success('Order cancelled successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error cancelling order:', error)
    toast.error('Failed to cancel order')
  }
}

const assignCourier = async () => {
  try {
    // Update order status
    await updateOrderState(props.order.id, OrderStatus.ASSIGNED_TO_COURIER)
    
    // Update order with courier ID
    await upsertOrder({
      ...props.order,
      courierId: selectedCourier.value
    })
    
    toast.success('Courier assigned successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error assigning courier:', error)
    toast.error('Failed to assign courier')
  }
}

const unassignCourier = async () => {
  try {
    // Update order status back to accepted
    await updateOrderState(props.order.id, OrderStatus.ACCEPTED)
    
    // Remove courier from order
    await upsertOrder({
      ...props.order,
      courierId: null
    })
    
    toast.success('Courier unassigned successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error unassigning courier:', error)
    toast.error('Failed to unassign courier')
  }
}

const confirmOrder = async () => {
  try {
    await updateOrderState(props.order.id, OrderStatus.CONFIRMED_BY_COURIER)
    toast.success('Order confirmed successfully')
    emit('orderUpdated')
  } catch (error) {
    console.error('Error confirming order:', error)
    toast.error('Failed to confirm order')
  }
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

.status-history {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.status-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.status-header h4 {
  margin: 0;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--color-text);
}

.status-entries {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.current-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
}

.current-status .status {
  font-weight: 500;
}

.current-status .timestamp {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.status-entry {
  margin-bottom: 0.1rem;
  padding: 0.1rem;
  background: var(--color-background);
  border-radius: 4px;
}

.status-entry .status {
  font-weight: 500;
  margin-right: 1rem;
}

.status-entry .timestamp {
  color: var(--color-text-soft);
  font-size: 0.9rem;
}

.status-entry .description {
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
  color: var(--color-text-soft);
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