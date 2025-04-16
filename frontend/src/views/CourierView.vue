<template>
  <div class="view courier-view">
    <h1>Courier View</h1>
    
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
        <!-- Profile Tab -->
        <div v-if="currentTab === 'profile'" class="tab-panel">
          <h2>My Profile</h2>
          <ProfileInfo 
            profileType="courier"
            @profile-saved="handleProfileSave" />
        </div>

        <!-- Assigned Deliveries Tab -->
        <div v-if="currentTab === 'assigned'" class="tab-panel">
          <h2>Assigned Deliveries</h2>
          <div class="list-container">
            <p v-if="!assignedDeliveries.length">No assigned deliveries.</p>
            <OrderCard
              v-else
              v-for="order in assignedDeliveries"
              :key="order.id"
              :order="order"
              :userType="'courier'"
              :statusHistory="statusHistories[order.id]"
              @orderUpdated="fetchOrders"
            />
          </div>
        </div>

        <!-- Active Deliveries Tab -->
        <div v-if="currentTab === 'active'" class="tab-panel">
          <h2>Active Deliveries</h2>
          <div class="list-container">
            <p v-if="!activeDeliveries.length">No active deliveries.</p>
            <OrderCard
              v-else
              v-for="order in activeDeliveries"
              :key="order.id"
              :order="order"
              :userType="'courier'"
              :statusHistory="statusHistories[order.id]"
              @orderUpdated="fetchOrders"
            />
          </div>
        </div>

        <!-- Delivery History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Delivery History</h2>
          <div class="list-container">
            <p v-if="!deliveryHistory.length">No delivery history.</p>
            <OrderCard
              v-else
              v-for="order in deliveryHistory"
              :key="order.id"
              :order="order"
              :userType="'courier'"
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
import ProfileInfo from '@/components/ProfileInfo.vue'
import OrderCard from '@/components/OrderCard.vue'
import type { Order } from '@/models/Order'
import { getCourierOrders, getOrderStatuses } from '../api/api'
import { useUserStore } from '../stores/userStore'
import { toast } from 'vue3-toastify'
import { HISTORY_ORDER_STATUSES, COURIER_ACTIVE_ORDER_STATUSES } from '@/utils/consts'
import { getCurrentStatus } from '@/utils'

const userStore = useUserStore()

const tabs = [
  { id: 'assigned', label: 'Assigned Deliveries' },
  { id: 'active', label: 'Active Deliveries' },
  { id: 'history', label: 'Delivery History' },
  { id: 'profile', label: 'My Profile' }
]

const currentTab = ref('assigned')
const assignedDeliveries = ref<Order[]>([])
const activeDeliveries = ref<Order[]>([])
const deliveryHistory = ref<Order[]>([])
const loadingOrders = ref(false)
const error = ref('')
const statusHistories = ref<Record<string, any[]>>({})

const handleProfileSave = async (profileData) => {
  try {
    await userStore.setUser({
      ...userStore.user,
      profile: profileData
    })
    toast.success('Profile saved successfully!')
  } catch (error) {
    console.error('Error saving profile:', error)
    toast.error('Failed to save profile')
  }
}

const fetchOrders = async () => {
  if (!userStore.user?.id) {
    error.value = 'No user logged in'
    return
  }

  loadingOrders.value = true
  try {
    const orders = await getCourierOrders(userStore.user.id)
    
    console.log(orders)
    // Filter orders into their respective categories
    console.log(getCurrentStatus(orders[0]))
    assignedDeliveries.value = orders.filter(order => getCurrentStatus(order) === 'ASSIGNED_TO_COURIER')
    activeDeliveries.value = orders.filter(order => COURIER_ACTIVE_ORDER_STATUSES.includes(getCurrentStatus(order)))
    deliveryHistory.value = orders.filter(order => HISTORY_ORDER_STATUSES.includes(getCurrentStatus(order)))
    
    // Fetch status history for each order
    for (const order of orders) {
      const statuses = await getOrderStatuses(order.id)
      statusHistories.value[order.id] = statuses
      statusHistories.value[order.id].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loadingOrders.value = false
  }
}

onMounted(() => {
  fetchOrders()
})
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
</style> 