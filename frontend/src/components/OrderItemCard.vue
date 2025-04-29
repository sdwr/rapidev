<template>
  <div class="order-item-card" :class="{ expanded: isExpanded }">
    <div class="order-item-header" @click="toggleExpand">
      <div class="status-badge" :class="statusClass">{{ getCurrentStatus() }}</div>
      <div class="order-item-id">{{ orderItem.deliveryAddress }}</div>
      <div class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</div>
    </div>

    <div v-if="isExpanded" class="order-item-details">
      <!-- Addresses -->
      <div class="address-section">
        <div class="address-item">
          <div class="label">Pickup Address:</div>
          <div class="value">{{ orderItem.pickupAddress }}</div>
        </div>
        <div class="address-item">
          <div class="label">Delivery Address:</div>
          <div class="value">{{ orderItem.deliveryAddress }}</div>
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

      <!-- Courier Information -->
      <div class="courier-section">
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

      <!-- Status History -->
      <div v-if="statusHistory && statusHistory.length" class="status-history">
        <div class="label">Status History:</div>
        <div class="status-timeline">
          <div 
            v-for="(status, index) in statusHistory" 
            :key="index"
            class="status-item"
          >
            <div class="status-dot" :class="getStatusClass(status.status)"></div>
            <div class="status-details">
              <div class="status-name">{{ status.status }}</div>
              <div class="status-time">{{ formatDate(status.createdAt) }}</div>
              <div v-if="status.notes" class="status-notes">{{ status.notes }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Admin Controls -->
      <div v-if="userType === 'ADMIN'" class="admin-controls">
        <div class="courier-assignment">
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
          <div class="assignment-buttons">
            <button 
              v-if="orderItem.courierId" 
              @click="unassignCourier" 
              class="unassign-btn"
              :disabled="isUpdating"
            >
              Unassign
            </button>
            <button 
              @click="assignCourier" 
              class="assign-btn"
              :disabled="!selectedCourierId || isUpdating"
            >
              Assign
            </button>
          </div>
        </div>
      </div>

      <!-- Courier Controls -->
      <div v-if="userType === 'COURIER' && isCourierAssigned" class="courier-controls">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { OrderStatusEnum } from '../shared/enums/OrderEnums'
import { toast } from 'vue3-toastify'
import { 
  assignCourierToOrderItem, 
  unassignCourierFromOrderItem, 
  updateOrderItemStatus
} from '../api/api'

const props = defineProps({
  orderItem: {
    type: Object,
    required: true
  },
  userType: {
    type: String,
    required: true,
    validator: (value) => ['CLIENT', 'COURIER', 'ADMIN'].includes(value)
  },
  availableCouriers: {
    type: Array,
    default: () => []
  },
  statusHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['item-updated'])

// UI state
const isExpanded = ref(false)
const isUpdating = ref(false)

// Form state
const selectedCourierId = ref('')
const selectedStatus = ref('')
const statusNotes = ref('')

// Computed properties
const isCourierAssigned = computed(() => {
  return props.userType === 'COURIER' && 
         props.orderItem.courierId === getUserId();
})

const statusClass = computed(() => {
  const currentStatus = getCurrentStatus()
  switch (currentStatus) {
    case OrderStatusEnum.DRAFT:
    case OrderStatusEnum.PENDING:
      return 'status-pending'
    case OrderStatusEnum.ACCEPTED:
      return 'status-confirmed'
    case OrderStatusEnum.PICKED_UP:
    case OrderStatusEnum.IN_TRANSIT:
      return 'status-in-progress'
    case OrderStatusEnum.DELIVERED:
      return 'status-delivered'
    case OrderStatusEnum.CANCELLED_BY_ADMIN:
      return 'status-cancelled'
    default:
      return ''
  }
})

const availableStatuses = computed(() => {
  const currentStatus = getCurrentStatus()
  
  // Define logical status progressions based on current status
  switch (currentStatus) {
    case OrderStatusEnum.ACCEPTED:
      return [OrderStatusEnum.PICKED_UP]
    case OrderStatusEnum.PICKED_UP:
      return [OrderStatusEnum.IN_TRANSIT]
    case OrderStatusEnum.IN_TRANSIT:
      return [OrderStatusEnum.DELIVERED]
    default:
      return Object.values(OrderStatusEnum)
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
  if (props.statusHistory && props.statusHistory.length) {
    // Sort by created date, descending
    const sortedHistory = [...props.statusHistory].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    return sortedHistory[0].status
  }
  
  // Fallback to a default status if no history
  return OrderStatusEnum.DRAFT
}

const getStatusClass = (status) => {
  switch (status) {
    case OrderStatusEnum.DRAFT:
    case OrderStatusEnum.PENDING:
      return 'status-pending'
    case OrderStatusEnum.ACCEPTED:
      return 'status-confirmed'
    case OrderStatusEnum.PICKED_UP:
    case OrderStatusEnum.IN_TRANSIT:
      return 'status-in-progress'
    case OrderStatusEnum.DELIVERED:
      return 'status-delivered'
    case OrderStatusEnum.CANCELLED_BY_ADMIN:
      return 'status-cancelled'
    default:
      return ''
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString()
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.order-item-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  background: var(--color-background-soft);
  border-bottom: 1px solid var(--color-border);
}

.status-badge {
  padding: 0.35rem 0.7rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-right: 1rem;
}

.status-pending {
  background-color: #ffeeba;
  color: #856404;
}

.status-confirmed {
  background-color: #b8daff;
  color: #004085;
}

.status-in-progress {
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

.address-section,
.contact-section,
.courier-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.address-item,
.contact-item,
.courier-item,
.notes-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-light);
}

.value {
  font-size: 1rem;
}

.not-assigned {
  color: var(--color-text-light);
  font-style: italic;
}

.status-history {
  margin-top: 1rem;
}

.status-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-left: 1rem;
  border-left: 2px solid var(--color-border);
}

.status-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-left: -1.3rem;
  margin-top: 0.25rem;
}

.status-details {
  flex: 1;
}

.status-name {
  font-weight: 500;
}

.status-time {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.status-notes {
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.25rem;
}

/* Admin controls */
.admin-controls, 
.courier-controls {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.courier-assignment,
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