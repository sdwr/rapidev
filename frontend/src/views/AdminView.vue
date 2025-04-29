<template>
  <div class="view admin-view">
    <h1>Admin View</h1>
    
    <div class="view-container">
      <div class="tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-button', { active: currentTab === tab.id }]"
          @click="currentTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <!-- All Clients Tab -->
        <div v-if="currentTab === 'clients'" class="tab-panel">
          <h2>All Clients</h2>
          <div v-if="error" class="error-message">{{ error }}</div>
          <div v-if="loadingClients" class="loading">Loading clients...</div>
          <div class="list-container">
            <p v-if="!loadingClients && !clients.length">No clients registered yet.</p>
            <div v-else v-for="client in clients" :key="client.id" class="list-item">
              <h3>Name: {{ client.name }}</h3>
              <p>Email: {{ client.email || 'No email' }}</p>
              <p>Phone: {{ client.phone || 'No phone' }}</p>
            </div>
          </div>
        </div>

        <!-- All Couriers Tab -->
        <div v-if="currentTab === 'couriers'" class="tab-panel">
          <h2>All Couriers</h2>
          <div class="list-container">
            <p v-if="!couriers.length">No couriers registered yet.</p>
            <div v-else v-for="courier in couriers" :key="courier.id" class="list-item">
              <h3>Name: {{ courier.name }}</h3>
              <p>Email: {{ courier.email || 'No email' }}</p>
              <p>Phone: {{ courier.phone || 'No phone' }}</p>
            </div>
          </div>
        </div>

        <!-- Order History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Order History</h2>
          <div class="list-container">
            <p v-if="!orderHistory.length">No completed orders.</p>
            <OrderCard
              v-else
              v-for="order in orderHistory"
              :key="order.id"
              :order="order"
              :userType="'ADMIN'"
              :statusHistory="statusHistories[order.id]"
              @orderUpdated="orderStore.fetchAllOrders"
            />
          </div>
        </div>

        <!-- Active Orders Tab -->
        <div v-if="currentTab === 'active'" class="tab-panel">
          <h2>Active Orders</h2>
          <div class="list-container">
            <p v-if="!activeOrders.length">No active orders.</p>
            <OrderCard
              v-else
              v-for="order in activeOrders"
              :key="order.id"
              :order="order"
              :userType="'ADMIN'"
              :couriers="couriers"
              :statusHistory="statusHistories[order.id]"
              @orderUpdated="orderStore.fetchAllOrders"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getAllUsers, getAllOrders, updateOrderState, assignCourier, unassignCourier } from '../api/api'
import type { Order } from '../shared/models/Order'
import type { User } from '../shared/models/User'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES, ACCEPTABLE_ORDER_STATUSES } from '../utils/consts'
import { toast } from 'vue3-toastify'
import { OrderStatusEnum } from '../shared/enums/OrderEnums'
import { getCurrentStatus } from '../utils'
import OrderCard from '../components/OrderCard.vue'
import { useOrderStore } from '../stores/orderStore'
import { useUserStore } from '../stores/userStore'

const tabs = [
  { id: 'active', label: 'Active Orders' },
  { id: 'history', label: 'Order History' },
  { id: 'clients', label: 'All Clients' },
  { id: 'couriers', label: 'All Couriers' }
]

const currentTab = ref('active')
const clients = ref<User[]>([])
const couriers = ref<User[]>([])
const statusHistories = ref<Record<string, any[]>>({})
const loadingClients = ref(false)
const loadingOrders = ref(false)
const error = ref('')
const selectedCouriers = ref<Record<string, string>>({})
const expandedStatusHistories = ref<Record<string, boolean>>({})

const orderStore = useOrderStore()
const userStore = useUserStore()

const fetchClients = async () => {
  loadingClients.value = true
  try {
    clients.value = await getAllUsers(UserTypeEnum.CLIENT)
  } catch (e) {
    error.value = e.message
  } finally {
    loadingClients.value = false
  }
}

const fetchCouriers = async () => {
  try {
    couriers.value = await getAllUsers(UserTypeEnum.COURIER)
  } catch (e) {
    error.value = e.message
  }
}

onMounted(() => {
  fetchClients()
  fetchCouriers()
})

const canAcceptOrder = (order: Order) => {
  return ACCEPTABLE_ORDER_STATUSES.includes(getCurrentStatus(order))
}

const assignCourierToOrder = async (orderId: string) => {
  const courierId = selectedCouriers.value[orderId]
  if (!courierId) return

  try {
    // First update the order status
    await updateOrderState(orderId, OrderStatusEnum.ASSIGNED_TO_COURIER)
    await assignCourier(orderId, courierId)
    
    toast.success('Order assigned to courier')
    await orderStore.fetchAllOrders() // Refresh the orders list
  } catch (error) {
    toast.error('Failed to assign courier')
    console.error('Error assigning courier:', error)
  }
}

const unassignCourierToOrder = async (orderId: string) => {
  try {
    // First update the order status
    await updateOrderState(orderId, OrderStatusEnum.ACCEPTED)
    await unassignCourier(orderId)
    
    toast.success('Courier unassigned')
    await orderStore.fetchAllOrders() // Refresh the orders list
  } catch (error) {
    toast.error('Failed to unassign courier')
    console.error('Error unassigning courier:', error)
  }
}

const toggleStatusHistory = (orderId: string) => {
  expandedStatusHistories.value[orderId] = !expandedStatusHistories.value[orderId]
}

// Load orders when the component mounts
onMounted(async () => {
  if (userStore.user?.id) {
    await orderStore.fetchAllOrders()
  }
})

// Use computed properties from the store
const activeOrders = computed(() => orderStore.activeOrders)
const orderHistory = computed(() => orderStore.orderHistory)

</script>

<style scoped>
.view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.tabs {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-text);
  border-radius: 4px;
  transition: background-color 0.2s;
}

.tab-button:hover {
  background: var(--color-background-soft);
}

.tab-button.active {
  background: var(--color-background-soft);
  font-weight: bold;
}

.tab-content {
  width: 100%;
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
}

.tab-panel {
  min-height: 200px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.list-item {
  background: var(--color-background);
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.list-item h3 {
  margin: 0 0 0.5rem 0;
}

.list-item p {
  margin: 0.25rem 0;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.order-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.order-actions button:first-child {
  background: #4CAF50;
  color: white;
}

.order-actions button:last-child {
  background: #f44336;
  color: white;
}

.order-actions button:hover {
  opacity: 0.9;
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
  margin-bottom: 0.5rem;
  padding: 0.5rem;
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

.courier-assignment {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
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

.courier-select:invalid {
  color: var(--color-text-soft);
}

.assign-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.assign-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.assign-button:not(:disabled):hover {
  opacity: 0.9;
}

.assigned-courier {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  width: 100%;
}

.unassign-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #f44336;
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: opacity 0.2s;
}

.unassign-button:hover {
  opacity: 0.9;
}
</style> 