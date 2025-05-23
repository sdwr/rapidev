<template>
  <div class="view client-view">
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

        <!-- Place Order Tab -->
        <div v-if="currentTab === 'order'" class="tab-panel">
          <div class="card">
            <template v-if="userStore.user?.id">
              <Order
                v-if="currentTab === 'order'"
                @order-created="handleOrderCreated"
              />
            </template>
            <div v-else class="error-message">
              You must be logged in to place an order.
            </div>
          </div>
        </div>

        <!-- My Orders Tab -->
        <div v-if="currentTab === 'myOrders'" class="tab-panel">
          <div class="list-container">
            <p v-if="!myOrders.length">No active orders.</p>
            <OrderCard
              v-else
              v-for="order in myOrders"
              :key="order.id"
              :order="order"
              :userType="'CLIENT'"
              :statusHistory="statusHistories[order.id]"
              :startExpanded="myOrders.length === 1"
              @orderUpdated="fetchOrders"
            />
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <div class="list-container">
            <p v-if="!orderHistory.length">No order history.</p>
            <OrderCard
              v-else
              v-for="order in orderHistory"
              :key="order.id"
              :order="order"
              :userType="'CLIENT'"
              :statusHistory="statusHistories[order.id]"
              @orderUpdated="fetchOrders"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Order from '@/components/Order.vue'
import OrderCard from '@/components/OrderCard.vue'
import type { Order as OrderType } from '@/models/Order'
import type { Profile } from '@/models/Profile'
import { getClientOrders, getUser, upsertProfile } from '../api/api'
import { useUserStore } from '../stores/userStore'
import { toast } from 'vue3-toastify'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES } from '@/utils/consts'
import { getCurrentStatus } from '@/utils'
import { useOrderStore } from '../stores/orderStore'

const userStore = useUserStore()
const orderStore = useOrderStore()

const tabs = [
  { id: 'order', label: 'Place Order' },
  { id: 'myOrders', label: 'My Orders' },
  { id: 'history', label: 'History' }
]

const currentTab = ref('order')
const myOrders = ref<OrderType[]>([])
const orderHistory = ref<OrderType[]>([])
const addresses = ref<Profile[]>([])
const loadingOrders = ref(false)
const error = ref('')
const statusHistories = ref<Record<string, any[]>>({})

const handleProfileSave = async (profileData: Profile) => {
  try {
    await upsertProfile(profileData)
    toast.success('Profile saved successfully!')
  } catch (error) {
    console.error('Error saving profile:', error)
    toast.error('Failed to save profile')
  }
}

const fetchUser = async () => {
  if (!userStore.user?.id) {
    error.value = 'No user logged in'
    return
  }

  const user = await getUser(userStore.user.id)
  addresses.value = user.profiles
}

const fetchOrders = async () => {
  loadingOrders.value = true
  await orderStore.fetchAllOrders()

  const orders = orderStore.orders
  myOrders.value = orders.filter(order => {
    return ACTIVE_ORDER_STATUSES.includes(getCurrentStatus(order)) && order.clientId === userStore.user?.id
  })
  orderHistory.value = orders.filter(order => {
    return HISTORY_ORDER_STATUSES.includes(getCurrentStatus(order)) && order.clientId === userStore.user?.id
  })

  // Fetch status history for each order
  for (const order of orders) {
    const statuses = order.orderStatuses
    statusHistories.value[order.id] = statuses
    statusHistories.value[order.id].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }
  loadingOrders.value = false
}

const handleOrderCreated = async () => {
  if (!userStore.user?.id) {
    console.error('No user logged in')
    toast.error('Please log in to create an order')
    return
  }

  try {
    //reload client orders
    await fetchOrders()
  } catch (error) {
    console.error('Error reloading orders:', error)
    toast.error(error.message || 'Error reloading orders')
  }
}

onMounted(() => {
  fetchOrders()
  fetchUser()
})
</script>

<style scoped>
.view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.tabs {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
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

  flex: 1;
  overflow-y: hidden;
  min-height: 0;
}

.tab-panel {
  min-height: 200px;
  height: 100%;
  overflow-y: scroll;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 1rem;
}

.list-container::-webkit-scrollbar {
  width: 8px;
  padding-bottom: 1rem;
}

.list-container::-webkit-scrollbar-track {
  background: var(--color-background-soft);
  border-radius: 4px;
}

.list-container::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

.list-container::-webkit-scrollbar-thumb:hover {
  background: var(--color-text);
}

.list-item {
  background: var(--color-background);
  padding: 0.25rem;
  border-radius: 4px;
}

.list-item h3 {
  margin: 0 0 0.5rem 0;
}

.list-item p {
  margin: 0.25rem 0;
}

.status-chip {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0.5rem 0;
  text-transform: capitalize;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.action-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.action-button:hover {
  opacity: 0.9;
}

.action-button.cancel {
  background-color: #f44336;
  color: white;
}

.action-button.pay {
  background-color: #4CAF50;
  color: white;
}

.action-button.edit {
  background-color: #2196F3;
  color: white;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.order-header h3 {
  margin: 0;
  flex: 1;
}

.toggle-icon {
  font-size: 0.875rem;
  color: var(--color-text);
}

.order-details {
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
  margin-top: 0.5rem;
}

.order-details p {
  margin: 0.5rem 0;
}
</style> 