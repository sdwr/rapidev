<template>
  <div class="user-card" :class="{ expanded: isExpanded }">
    <!-- User Info Header -->
    <div class="user-header" @click="toggleExpand">
      <div class="user-info">
        <h3>{{ user.name || 'Unnamed User' }}</h3>
        <p>{{ user.phone || 'No phone' }}</p>
        <p>{{ user.email }}</p>
      </div>
      <div class="toggle-icon">{{ isExpanded ? '▼' : '▶' }}</div>
    </div>

    <!-- Expandable Content -->
    <div v-if="isExpanded" class="user-content">
      <!-- Active Orders -->
      <div class="orders-section">
        <div class="section-header" @click="toggleActiveOrders">
          <h4>Active Orders ({{ activeOrders.length }})</h4>
          <span class="toggle-icon">{{ showActiveOrders ? '▼' : '▶' }}</span>
        </div>
        <div v-if="showActiveOrders" class="orders-list">
          <p v-if="!activeOrders.length" class="no-orders">No active orders</p>
          <OrderCard
            v-else
            v-for="order in activeOrders"
            :key="order.id"
            :order="order"
            :userType="userType"
            @orderUpdated="$emit('refresh')"
          />
        </div>
      </div>

      <!-- Completed Orders -->
      <div class="orders-section">
        <div class="section-header" @click="toggleCompletedOrders">
          <h4>Completed Orders ({{ completedOrders.length }})</h4>
          <span class="toggle-icon">{{ showCompletedOrders ? '▼' : '▶' }}</span>
        </div>
        <div v-if="showCompletedOrders" class="orders-list">
          <p v-if="!completedOrders.length" class="no-orders">No completed orders</p>
          <OrderCard
            v-else
            v-for="order in completedOrders"
            :key="order.id"
            :order="order"
            :userType="userType"
            @orderUpdated="$emit('refresh')"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="action-buttons">
        <!-- Client Actions -->
        <button
          v-if="userType === 'CLIENT'"
          class="action-btn refund-btn"
          :disabled="isProcessing || !hasCompletedOrders"
          @click="handleRefundClient"
        >
          {{ isProcessing ? 'Processing...' : 'Refund Client' }}
        </button>

        <!-- Courier Actions -->
        <button
          v-if="userType === 'COURIER'"
          class="action-btn pay-btn"
          :disabled="isProcessing || !hasCompletedOrders"
          @click="handlePayCourier"
        >
          {{ isProcessing ? 'Processing...' : 'Pay Courier' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import OrderCard from './OrderCard.vue'
import type { User } from '../shared/models/User'
import type { Order } from '../shared/models/Order'
import { toast } from 'vue3-toastify'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES } from '../utils/consts'
import { getCurrentStatus } from '../utils'
const props = defineProps<{
  user: User
  userType: 'CLIENT' | 'COURIER'
  orders: Order[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// State
const isExpanded = ref(false)
const showActiveOrders = ref(true)
const showCompletedOrders = ref(false)
const isProcessing = ref(false)

// Computed
const activeOrders = computed(() => 
  props.orders.filter(order => ACTIVE_ORDER_STATUSES.includes(getCurrentStatus(order)))
)

const completedOrders = computed(() => 
  props.orders.filter(order => HISTORY_ORDER_STATUSES.includes(getCurrentStatus(order)))
)

const hasCompletedOrders = computed(() => completedOrders.value.length > 0)

// Methods
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value
}

const toggleActiveOrders = () => {
  showActiveOrders.value = !showActiveOrders.value
}

const toggleCompletedOrders = () => {
  showCompletedOrders.value = !showCompletedOrders.value
}

const handleRefundClient = async () => {
  isProcessing.value = true
  try {
    // TODO: Implement refund logic
    toast.info('Refund functionality coming soon')
  } catch (error) {
    toast.error('Failed to process refund')
  } finally {
    isProcessing.value = false
  }
}

const handlePayCourier = async () => {
  isProcessing.value = true
  try {
    // TODO: Implement payment logic
    toast.info('Payment functionality coming soon')
  } catch (error) {
    toast.error('Failed to process payment')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.user-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.user-header {
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info h3 {
  margin: 0 0 0.5rem 0;
  color: var(--color-heading);
}

.user-info p {
  margin: 0.25rem 0;
  color: var(--color-text);
  font-size: 0.9rem;
}

.user-content {
  border-top: 1px solid var(--color-border);
  padding: 1rem;
}

.orders-section {
  margin-bottom: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 0.5rem;
  background: var(--color-background);
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.section-header h4 {
  margin: 0;
}

.orders-list {
  padding: 0.5rem;
}

.no-orders {
  color: var(--color-text-soft);
  text-align: center;
  padding: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-border);
}

.action-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  flex: 1;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refund-btn {
  background-color: #ff9800;
  color: white;
}

.pay-btn {
  background-color: #4caf50;
  color: white;
}

.refund-btn:hover:not(:disabled),
.pay-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--color-text);
}
</style> 