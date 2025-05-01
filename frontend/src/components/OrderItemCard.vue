<template>
  <div class="order-item-card" :class="{ expanded: isExpanded }">
    <div class="order-item-header" @click="toggleExpand">
      <div class="status-badge" :class="statusClass">{{ getCurrentStatus() }}</div>
      <div class="order-item-id">{{ orderItem.pickupAddress }} - {{ orderItem.deliveryAddress }}</div>
      <div class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</div>
    </div>

    <div v-if="isExpanded" class="order-item-details">

      <!-- Admin Controls -->
      <div class="item-controls">
        <div v-if="userType === 'ADMIN'" class="admin-controls">
          <div v-if="!orderItem.courierId" class="courier-assignment-dropdown">
            <label for="courierSelect">Assign Courier:</label>
            <select 
              id="courierSelect" 
              v-model="selectedCourierId"
              :disabled="isUpdating"
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
          </div>
          <div class="assignment-buttons">
            <button 
              v-if="orderItem.courierId" 
              @click="unassignCourier" 
              class="unassign-btn"
              :disabled="isUpdating"
            >
              Unassign Courier
            </button>
            <button 
              v-else
              @click="assignCourier" 
              class="assign-btn"
              :disabled="!selectedCourierId || isUpdating"
            >
              Assign
            </button>
          </div>
        </div>

        <!-- Courier Controls -->
        <div v-if="userType === 'COURIER'" class="courier-controls">
          <div class="status-update">
            <label for="statusSelect">Update Status:</label>
            <select 
              id="statusSelect" 
              v-model="selectedStatus" 
              :disabled="isUpdating"
            >
              <option value="">-- Select Status --</option>
              <option 
                v-for="status in availableStatuses" 
                :key="status" 
                :value="status"
              >
                {{ status }}
              </option>
            </select>
            <div class="status-notes-input">
              <label for="statusNotes">Notes:</label>
              <textarea 
                id="statusNotes" 
                v-model="statusNotes"
                placeholder="Add notes about this status update"
                :disabled="isUpdating"
              ></textarea>
            </div>
            <button 
              @click="updateStatus" 
              class="update-btn"
              :disabled="!selectedStatus || isUpdating"
            >
              Update Status
            </button>
          </div>
        </div>
      </div>  

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
import { useOrderStore } from '../stores/orderStore'
import StatusHistory from './StatusHistory.vue'

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
  },
})

const emit = defineEmits(['item-updated'])
const orderStore = useOrderStore()
// UI state
const isExpanded = ref(false)
const isUpdating = ref(false)

// Form state
const selectedCourierId = ref('')
const selectedStatus = ref('')
const statusNotes = ref('')

const statusHistory = computed(() => {
  return props.orderItem?.orderItemStatuses
})

const statusClass = computed(() => {
  const currentStatus = getCurrentStatus()
  switch (currentStatus) {
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
})

const availableStatuses = computed(() => {
  const currentStatus = getCurrentStatus()
  
  // Define logical status progressions based on current status
  switch (currentStatus) {
    case OrderItemStatusEnum.DRAFT:
      return [OrderItemStatusEnum.ACCEPTED, OrderItemStatusEnum.CANCELLED]
    case OrderItemStatusEnum.ACCEPTED:
      return [OrderItemStatusEnum.ASSIGNED, OrderItemStatusEnum.CANCELLED]
    case OrderItemStatusEnum.ASSIGNED:
      return [OrderItemStatusEnum.CONFIRMED_BY_COURIER, OrderItemStatusEnum.CANCELLED]
    case OrderItemStatusEnum.CONFIRMED_BY_COURIER:
      return [OrderItemStatusEnum.PICKED_UP, OrderItemStatusEnum.CANCELLED]
    case OrderItemStatusEnum.PICKED_UP:
      return [OrderItemStatusEnum.DELIVERED, OrderItemStatusEnum.CANCELLED]
    case OrderItemStatusEnum.DELIVERED:
      return [OrderItemStatusEnum.CANCELLED]
    default:
      return Object.values(OrderItemStatusEnum)
  }
})

// Initialize
onMounted(() => {
  if (props.orderItem.courierId) {
    selectedCourierId.value = props.orderItem.courierId.toString()
  }
})

// Methods
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const getCurrentStatus = () => {
  if (props.orderItem?.orderItemStatuses) {
    let currentStatus = props.orderItem.orderItemStatuses.find(status => status.isCurrent)
    return currentStatus?.status
  }
  
  // Fallback to a default status if no history
  return OrderItemStatusEnum.DRAFT
}

const getCourierName = () => {
  if (!props.orderItem.courierId) return 'Not assigned'

  const courier = props.availableCouriers.find(c => c.id === props.orderItem.courierId)
  return courier ? (courier.name || courier.email) : `Courier #${props.orderItem.courierId}`
}

const getUserId = () => {
  // This would come from your auth store
  // For example: return userStore.user.id
  return 0; // Replace with actual implementation
}

// Admin actions
const assignCourier = async () => {
  if (!selectedCourierId.value) return
  
  isUpdating.value = true
  try {
    await assignCourierToOrderItem(props.orderItem.id, parseInt(selectedCourierId.value))
    await orderStore.fetchAllOrders()
    toast.success('Courier assigned successfully')
    emit('item-updated')
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
    await orderStore.fetchAllOrders()
    selectedCourierId.value = ''
    toast.success('Courier unassigned successfully')
    emit('item-updated')
  } catch (error) {
    toast.error('Failed to unassign courier')
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}

// Courier actions
const updateStatus = async () => {
  if (!selectedStatus.value) return
  
  isUpdating.value = true
  try {
    await updateOrderItemStatus(props.orderItem.id, {
      status: selectedStatus.value,
      notes: statusNotes.value
    })
    toast.success('Status updated successfully')
    selectedStatus.value = ''
    statusNotes.value = ''
    emit('item-updated')
  } catch (error) {
    toast.error('Failed to update status')
    console.error(error)
  } finally {
    isUpdating.value = false
  }
}
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
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
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

/* Admin controls */
.admin-controls, 
.courier-controls {
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.courier-assignment-dropdown,
.status-update {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

select, textarea {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  font-size: 0.9rem;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

.assignment-buttons {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:disabled {
  opacity: 0.6;
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

.update-btn {
  background-color: #28a745;
  color: white;
  align-self: flex-start;
}
</style> 