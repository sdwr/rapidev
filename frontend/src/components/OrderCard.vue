<template>
  <div class="list-item" :class="{ 'expanded': isExpanded }">
    <div class="order-summary-header" @click="toggleExpand">
      <div class="status-badge" :class="getStatusClass(getCurrentStatus(order))">
        {{ getCurrentStatus(order) }}
      </div>
      <div class="order-info">
        <span class="order-id">#{{ order.id }}</span>
        <span class="pickup-address">{{ order.pickupAddress }}</span>
        <span class="total-cost">${{ getTotalCost() }}</span>
      </div>
      <div class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</div>
    </div>

    <div v-if="isExpanded" class="order-details-content">
      <p v-if="userType !== 'CLIENT'">Client: {{ order.client?.name }}</p>
      <div class="order-items">
        <div class="order-item-header">
          <h4>Items:</h4>
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
import StatusHistory from './StatusHistory.vue'

const props = defineProps<{
  order: Order
  userType: 'CLIENT' | 'ADMIN' | 'COURIER'
  statusHistory?: any[] // Kept for now, but StatusHistory component handles its own data
  availableCouriers?: User[]
}>()

const emit = defineEmits(['orderUpdated', 'assignCourier', 'unassignCourier'])

const isExpanded = ref(false) // Collapsed by default

const selectedCourierId = ref<number | null>(null)
const availableCouriers = ref<User[]>([])

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}


const getTotalCost = () => {
  // Placeholder for total cost.
  // Replace with actual calculation from order.receipt or items if available.
  if (props.order.receipt && props.order.receipt.total) {
    return props.order.receipt.total.toFixed(2);
  }
  return 'N/A'; // Placeholder
}

const isStatusHistoryExpanded = ref(false)
const expandedItemId = ref(null)

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

// Expand a specific item
const expandItem = (itemId) => {
  expandedItemId.value = itemId
}

// Add a getStatusClass method similar to what's in OrderItemCard
const getStatusClass = (status: string) => {
  switch (status) {
    case OrderStatusEnum.DRAFT:
      return 'status-draft'
    case OrderStatusEnum.ACCEPTED:
      return 'status-accepted'
    case OrderStatusEnum.ASSIGNED_TO_COURIER:
      return 'status-assigned'
    case OrderStatusEnum.CONFIRMED_BY_COURIER:
      return 'status-confirmed'
    case OrderStatusEnum.PICKED_UP:
      return 'status-picked-up'
    case OrderStatusEnum.DELIVERED:
      return 'status-delivered'
    case OrderStatusEnum.CANCELLED_BY_CLIENT:
    case OrderStatusEnum.CANCELLED_BY_COURIER:
    case OrderStatusEnum.CANCELLED_BY_ADMIN:
      return 'status-cancelled'
    default:
      return 'status-draft'
  }
}
</script>

<style scoped>
.list-item {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0; /* Remove padding from list-item itself */
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease-in-out;
}

.list-item.expanded {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-summary-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 0.5rem; /* Add padding to the header */
}

.order-info {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 0.9rem;
  overflow: hidden;
}

.order-info span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}


.pickup-address {
  font-weight: 500;
  flex-grow: 0.1;
  flex-shrink: 1;
  flex-basis: auto;
}

.order-id {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 30px;
  font-weight: bold;
  color: var(--color-text-soft);
}

.total-cost {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 50px;
  font-weight: bold;
  color: var(--color-primary);
}

.toggle-icon {
  font-size: 1.2rem;
  color: var(--color-text-light);
}

.order-details-content {
  border-top: none; /* Remove top border if header has bottom border */
}

.order-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  /* cursor: pointer; /* Moved to order-summary-header */
  /* padding: 1rem; /* Moved to order-summary-header */
  /* background: var(--color-background); */
  /* border-radius: 4px; */
  /* border: 1px solid var(--color-border); */
}

.order-header h3 {
  margin: 0;
  flex: 1;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: white;
}

/* Status colors */
.status-draft {
  background-color: #6c757d;
}

.status-paid {
  background-color: #17a2b8;
}

.status-accepted {
  background-color: #28a745;
}

.status-assigned {
  background-color: #fd7e14;
}

.status-confirmed {
  background-color: #007bff;
}

.status-picked-up {
  background-color: #6f42c1;
}

.status-delivered {
  background-color: #28a745;
}

.status-cancelled {
  background-color: #dc3545;
}

.order-items {
}

.order-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem 0.5rem; /* Adjust padding if needed */
  margin-top: 0.5rem;
  border-top: 1px solid var(--color-border-hover);
}

.order-item-header h4 {
  margin: 0;
}

.order-item-entries {
  padding-top: 0.5rem;
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