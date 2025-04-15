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
              <h3>{{ client.profile?.name || 'No name' }}</h3>
              <p>Username: {{ client.username }}</p>
              <p>Email: {{ client.profile?.email || 'No email' }}</p>
              <p>Phone: {{ client.profile?.phone || 'No phone' }}</p>
              <p>Address: {{ client.profile?.address || 'No address' }}</p>
            </div>
          </div>
        </div>

        <!-- All Couriers Tab -->
        <div v-if="currentTab === 'couriers'" class="tab-panel">
          <h2>All Couriers</h2>
          <div class="list-container">
            <p v-if="!couriers.length">No couriers registered yet.</p>
            <div v-else v-for="courier in couriers" :key="courier.id" class="list-item">
              <h3>{{ courier.profile?.name || 'No name' }}</h3>
              <p>Username: {{ courier.username }}</p>
              <p>Email: {{ courier.profile?.email || 'No email' }}</p>
              <p>Phone: {{ courier.profile?.phone || 'No phone' }}</p>
              <p>Address: {{ courier.profile?.address || 'No address' }}</p>
            </div>
          </div>
        </div>

        <!-- Order History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Order History</h2>
          <div class="list-container">
            <p v-if="!orderHistory.length">No completed orders.</p>
            <div v-else v-for="order in orderHistory" :key="order.id" class="list-item">
              <h3>Order #{{ order.id }}</h3>
              <p>Client: {{ order.clientId }}</p>
              <p>Items: {{ order.items.length }}</p>
              <div class="status-history">
                <h4>Status History</h4>
                <div v-for="status in statusHistories[order.id]" :key="status.id" class="status-entry">
                  <span class="status">{{ status.status }}</span>
                  <span class="timestamp">{{ new Date(status.createdAt).toLocaleString() }}</span>
                  <p class="description">{{ status.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Orders Tab -->
        <div v-if="currentTab === 'active'" class="tab-panel">
          <h2>Active Orders</h2>
          <div class="list-container">
            <p v-if="!activeOrders.length">No active orders.</p>
            <div v-else v-for="order in activeOrders" :key="order.id" class="list-item">
              <h3>Order #{{ order.id }}</h3>
              <p>Status: {{ order.status }}</p>
              <p>Client: {{ order.clientId }}</p>
              <div class="status-history">
                <h4>Status History</h4>
                <div v-for="status in statusHistories[order.id]" :key="status.id" class="status-entry">
                  <span class="status">{{ status.status }}</span>
                  <span class="timestamp">{{ new Date(status.createdAt).toLocaleString() }}</span>
                  <p class="description">{{ status.description }}</p>
                </div>
              </div>
              <div class="order-actions">
                <button @click="updateOrderStatus(order.id, 'ACCEPTED')">Accept</button>
                <button @click="updateOrderStatus(order.id, 'CANCELLED')">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllUsers, getAllOrders, updateOrderState, getOrderStatuses } from '../api/api'
import type { Order } from '@/models/Order'
import type { User } from '@/models/User'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES } from '@/utils/consts'
import { toast } from 'vue3-toastify'
import { OrderStatus } from '../../../shared/enums/OrderEnums'
const tabs = [
  { id: 'active', label: 'Active Orders' },
  { id: 'history', label: 'Order History' },
  { id: 'clients', label: 'All Clients' },
  { id: 'couriers', label: 'All Couriers' }
]

const currentTab = ref('active')
const clients = ref<User[]>([])
const couriers = ref<User[]>([])
const orderHistory = ref<Order[]>([])
const activeOrders = ref<Order[]>([])
const statusHistories = ref<Record<string, any[]>>({})
const loadingClients = ref(false)
const loadingOrders = ref(false)
const error = ref('')

const fetchClients = async () => {
  loadingClients.value = true
  try {
    clients.value = await getAllUsers('client')
  } catch (e) {
    error.value = e.message
  } finally {
    loadingClients.value = false
  }
}

const fetchCouriers = async () => {
  try {
    couriers.value = await getAllUsers('courier')
  } catch (e) {
    error.value = e.message
  }
}

const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const orders = await getAllOrders()
    activeOrders.value = orders.filter(o => 
      ACTIVE_ORDER_STATUSES.includes(o.status)
    )
    orderHistory.value = orders.filter(o => 
      HISTORY_ORDER_STATUSES.includes(o.status)
    )
    
    // Fetch status history for each order
    for (const order of orders) {
      const statuses = await getOrderStatuses(order.id)
      statusHistories.value[order.id] = statuses
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loadingOrders.value = false
  }
}

onMounted(() => {
  fetchClients()
  fetchCouriers()
  fetchOrders()
})

const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const updatedOrder = await updateOrderState(orderId, status as OrderStatus)
    if (updatedOrder) {
      toast.success(`Order status updated to ${status}`)
      await fetchOrders() // Refresh the orders list
    }
  } catch (error) {
    toast.error('Failed to update order status')
    console.error('Error updating order status:', error)
  }
}
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

.status-history h4 {
  margin: 0 0 0.5rem 0;
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
</style> 