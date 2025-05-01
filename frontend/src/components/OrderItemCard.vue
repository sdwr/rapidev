<template>
  <div class="order-item-card" :class="{ expanded: isExpanded }">
    <div class="order-item-header" @click="toggleExpand">
      <div class="status-badge" :class="statusClass">{{ getCurrentStatus() }}</div>
      <div class="order-item-id">{{ orderItem.pickupAddress }} - {{ orderItem.deliveryAddress }}</div>
      <div class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</div>
    </div>
    <!-- Item Controls Section -->
    <div class="item-controls">
        <!-- Admin Controls -->
        <div v-if="userType === 'ADMIN'" class="admin-controls">
          <!-- Courier Assignment -->
          <div v-if="!orderItem.courierId" class="control-group">
            <select 
              id="courierSelect" 
              v-model="selectedCourierId"
              :disabled="isUpdating"
              class="control-select"
            >
              <option value="">-- Select Courier --</option>
              <option 
                v-for="courier in availableCouriers" 
                :key="courier.id" 
                :value="courier.id"
              >
                {{ courier.name || courier.email }}
              </option>
            </select>
            <button 
              @click="assignCourier" 
              class="control-btn assign-btn"
              :disabled="!selectedCourierId || isUpdating"
            >
              Assign
            </button>
          </div>
          
          <!-- Unassign Courier Button -->
          <button 
            v-if="orderItem.courierId" 
            @click="unassignCourier" 
            class="control-btn unassign-btn"
            :disabled="isUpdating"
          >
            Unassign Courier
          </button>
          
          <!-- Cancel Item Button -->
          <button 
            v-if="canCancelItem"
            @click="cancelItem" 
            class="control-btn cancel-btn"
            :disabled="isUpdating"
          >
            Cancel Item
          </button>
        </div>

        <!-- Courier Controls -->
        <div v-if="userType === 'COURIER'" class="courier-controls">
          <!-- Accept Order Button -->
          <button 
            v-if="canAcceptItem"
            @click="acceptItem" 
            class="control-btn accept-btn"
            :disabled="isUpdating"
          >
            Accept
          </button>
          
          <!-- Decline Order Button -->
          <button 
            v-if="canDeclineItem"
            @click="declineItem" 
            class="control-btn decline-btn"
            :disabled="isUpdating"
          >
            Decline Delivery
          </button>
          
          <!-- Picked Up Button -->
          <button 
            v-if="canMarkAsPickedUp"
            @click="markAsPickedUp" 
            class="control-btn pickup-btn"
            :disabled="isUpdating"
          >
            Mark as Picked Up
          </button>
          
          <!-- Delivered Button -->
          <button 
            v-if="canMarkAsDelivered"
            @click="markAsDelivered" 
            class="control-btn deliver-btn"
            :disabled="isUpdating"
          >
            Mark as Delivered
          </button>
          
          <!-- Additional Notes -->
          <div v-if="showNotesInput" class="notes-input">
            <textarea 
              v-model="statusNotes"
              placeholder="Add notes about this update (optional)"
              :disabled="isUpdating"
            ></textarea>
          </div>
        </div>
      </div>

    <div v-if="isExpanded" class="order-item-details">

      <!-- Courier Information -->
      <div class="courier-section" v-if="userType === 'ADMIN'">
        <div class="courier-item">
          <div class="label">Courier:</div>
          <div v-if="orderItem.courierId" class="value">
            {{ getCourierName() }}
          </div>
          <div v-else class="value not-assigned">
            Not assigned
          </div>
        </div>
      </div>

      <!-- Contact & Notes -->
      <div class="contact-section">
        <div class="contact-item">
          <div class="label">Delivery Phone:</div>
          <div class="value">{{ orderItem.deliveryPhone }}</div>
        </div>
        <div class="notes-item" v-if="orderItem.deliveryNotes">
          <div class="label">Delivery Notes:</div>
          <div class="value">{{ orderItem.deliveryNotes }}</div>
        </div>
      </div>

      <!-- Status History -->
      <StatusHistory :statuses="statusHistory" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrderItemStatusEnum } from '../shared/enums/OrderItemEnums'
import { toast } from 'vue3-toastify'
import { 
  assignCourierToOrderItem, 
  unassignCourierFromOrderItem, 
  updateOrderItemStatus 
} from '../api/api'
import { UserTypeEnum } from '../shared/enums/UserEnums'
import StatusHistory from './StatusHistory.vue'
import { useOrderItemStore } from '../stores/orderItemStore'
const props = defineProps({
  orderItem: {
    type: Object,
    required: true
  },
  userType: {
    type: String,
    required: true,
    validator: (value) => [UserTypeEnum.CLIENT, UserTypeEnum.COURIER, UserTypeEnum.ADMIN].includes(value)
  },
  availableCouriers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['item-updated'])
const orderItemStore = useOrderItemStore()

// UI state
const isExpanded = ref(false)
const isUpdating = ref(false)
const selectedCourierId = ref('')
const selectedStatus = ref('')
const statusNotes = ref('')

// Computed properties for status-based controls
const currentStatus = computed(() => getCurrentStatus())

// For Admin
const canCancelItem = computed(() => {
  const status = currentStatus.value
  return ![OrderItemStatusEnum.CANCELLED, OrderItemStatusEnum.DELIVERED].includes(status)
})

// For Courier
const canAcceptItem = computed(() => {
  return currentStatus.value === OrderItemStatusEnum.ASSIGNED
})

const canDeclineItem = computed(() => {
  return [OrderItemStatusEnum.ASSIGNED, OrderItemStatusEnum.CONFIRMED_BY_COURIER].includes(currentStatus.value) && 
         props.orderItem.courierId === getUserId()
})

const canMarkAsPickedUp = computed(() => {
  return currentStatus.value === OrderItemStatusEnum.CONFIRMED_BY_COURIER
})

const canMarkAsDelivered = computed(() => {
  return currentStatus.value === OrderItemStatusEnum.PICKED_UP
})

const showNotesInput = computed(() => {
  return props.userType === 'COURIER' && 
         (canMarkAsPickedUp.value || canMarkAsDelivered.value || canDeclineItem.value)
})

// Status-related computed properties
const statusHistory = computed(() => {
  return props.orderItem?.orderItemStatuses
})

const statusClass = computed(() => {
  return getStatusClass(currentStatus.value)
})

// Get user ID helper
const getUserId = () => {
  try {
    const userId = localStorage.getItem('userId')
    return userId ? parseInt(userId) : null
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}

// Available statuses by role and current status
const availableStatuses = computed(() => {
  const status = currentStatus.value
  if (props.userType === 'COURIER') {
    if (status === OrderItemStatusEnum.ASSIGNED) {
      return [OrderItemStatusEnum.CONFIRMED_BY_COURIER]
    } else if (status === OrderItemStatusEnum.CONFIRMED_BY_COURIER) {
      return [OrderItemStatusEnum.PICKED_UP]
    } else if (status === OrderItemStatusEnum.PICKED_UP) {
      return [OrderItemStatusEnum.DELIVERED]
    }
  }
  return []
})

// Methods
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const getCurrentStatus = () => {
  if (!props.orderItem.orderItemStatuses || props.orderItem.orderItemStatuses.length === 0) {
    return OrderItemStatusEnum.DRAFT
  }
  
  const sortedStatuses = [...props.orderItem.orderItemStatuses].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  
  if (sortedStatuses.length > 0) {
    return sortedStatuses[0].status
  }
  
  return OrderItemStatusEnum.DRAFT
}

const getStatusClass = (status) => {
  switch (status) {
    case OrderItemStatusEnum.DRAFT:
      return 'status-pending'
    case OrderItemStatusEnum.ACCEPTED:
      return 'status-confirmed'
    case OrderItemStatusEnum.ASSIGNED:
      return 'status-assigned'
    case OrderItemStatusEnum.CONFIRMED_BY_COURIER:
      return 'status-confirmed'
    case OrderItemStatusEnum.PICKED_UP:
      return 'status-picked-up'
    case OrderItemStatusEnum.DELIVERED:
      return 'status-delivered'
    case OrderItemStatusEnum.CANCELLED:
      return 'status-cancelled'
    default:
      return ''
  }
}

const getCourierName = () => {
  if (!props.orderItem.courierId) return 'Not assigned'
  
  const courier = props.availableCouriers.find(c => c.id === props.orderItem.courierId)
  return courier ? (courier.name || courier.email) : `Courier #${props.orderItem.courierId}`
}

// Action methods
const assignCourier = async () => {
  if (!selectedCourierId.value) {
    toast.error('Please select a courier')
    return
  }
  
  isUpdating.value = true
  
  try {
    await assignCourierToOrderItem(props.orderItem.id, selectedCourierId.value)
    toast.success('Courier assigned successfully')
    await reloadOrderItems()
  } catch (error) {
    toast.error('Failed to assign courier')
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}

const unassignCourier = async () => {
  isUpdating.value = true
  
  try {
    await unassignCourierFromOrderItem(props.orderItem.id)
    toast.success('Courier unassigned successfully')
    await reloadOrderItems()
  } catch (error) {
    toast.error('Failed to unassign courier')
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}

const updateItem = async (newStatus) => {
  isUpdating.value = true
  
  try {
    await updateOrderItemStatus(props.orderItem.id, newStatus, statusNotes.value)
    toast.success(`Item status updated to ${newStatus}`)
    statusNotes.value = ''
    await reloadOrderItems()
  } catch (error) {
    toast.error('Failed to update item status')
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}

const reloadOrderItems = async () => {
  await orderItemStore.fetchAllOrderItems()
  emit('item-updated')
}

// New action methods
const acceptItem = async () => {
  await updateItem(OrderItemStatusEnum.CONFIRMED_BY_COURIER)
}

const declineItem = async () => {
  await updateItem(OrderItemStatusEnum.CANCELLED)
}

const markAsPickedUp = async () => {
  await updateItem(OrderItemStatusEnum.PICKED_UP)
}

const markAsDelivered = async () => {
  await updateItem(OrderItemStatusEnum.DELIVERED)
}

const cancelItem = async () => {
  await updateItem(OrderItemStatusEnum.CANCELLED)
}

onMounted(() => {
  if (props.orderItem?.courierId) {
    selectedCourierId.value = props.orderItem.courierId.toString()
  }
})
</script>

<style scoped>
.order-item-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.order-item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: var(--color-background-soft);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background-color: #b8daff;
  color: #004085;
}

.status-assigned {
  background-color: #c3e6cb;
  color: #155724;
}

.status-picked-up {
  background-color: #c3e6cb;
  color: #155724;
}

.status-delivered {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f5c6cb;
  color: #721c24;
}

.order-item-id {
  flex: 1;
  font-weight: 500;
}

.toggle-icon {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.order-item-details {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.item-controls {
  background: var(--color-background-soft);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content:center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.control-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.control-select {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  min-width: 200px;
}

.control-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.control-btn:hover {
  opacity: 0.9;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.assign-btn {
  background-color: #007bff;
  color: white;
}

.unassign-btn {
  background-color: #dc3545;
  color: white;
}

.cancel-btn {
  background-color: #dc3545;
  color: white;
}

.accept-btn {
  background-color: #28a745;
  color: white;
}

.decline-btn {
  background-color: #dc3545;
  color: white;
}

.pickup-btn {
  background-color: #6f42c1;
  color: white;
}

.deliver-btn {
  background-color: #28a745;
  color: white;
}

.notes-input {
  width: 100%;
  margin-top: 1rem;
}

.notes-input textarea {
  width: 100%;
  min-height: 60px;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  resize: vertical;
}

.address-section,
.contact-section,
.courier-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Updated styles for horizontal layout */
.address-item,
.contact-item,
.courier-item,
.notes-item {
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: 0.75rem;
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-light);
  min-width: 120px; /* Fixed width for labels */
  text-align: right; /* Right align the labels */
}

.value {
  font-size: 1rem;
  flex: 1; /* Allow the value to take up remaining space */
}

.not-assigned {
  color: var(--color-text-light);
  font-style: italic;
}

/* Admin and Courier controls */
.admin-controls, 
.courier-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
</style> 