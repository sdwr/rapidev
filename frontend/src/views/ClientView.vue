<template>
  <div class="view client-view">
    <h1>Client View</h1>
    
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
            profileType="client"
            @profile-saved="handleProfileSave" />
        </div>

        <!-- Place Order Tab -->
        <div v-if="currentTab === 'order'" class="tab-panel">
          <div class="card">
            <h2>Place Your Order</h2>
            <template v-if="userStore.user?.profile?.id">
              <Order 
                :clientId="userStore.user.id"
                :clientProfileId="userStore.user.profile.id"
                @order-created="handleOrderCreated" 
              />
            </template>
            <div v-else class="error-message">
              Please create a profile before placing an order.
            </div>
            <div class="order-status" v-if="orderStatus">{{ orderStatus }}</div>
          </div>
        </div>

        <!-- Order History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Order History</h2>
          <div class="list-container">
            <p v-if="!orderHistory.length">No orders yet.</p>
            <div v-else v-for="order in orderHistory" :key="order.id" class="list-item">
              <h3>Order #{{ order.id }}</h3>
              <p>Status: {{ order.status }}</p>
              <p>Delivery Address: {{ order.deliveryAddress }}</p>
              <p>Items: {{ order.items.length }}</p>
              <p>Created: {{ new Date(order.createdAt).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProfileInfo from '@/components/ProfileInfo.vue'
import Order from '@/components/Order.vue'
import type { Order as OrderType } from '@/models/Order'
import { getClientOrders, upsertOrder, getProfileByUserId } from '../api/api'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const tabs = [
  { id: 'profile', label: 'My Profile' },
  { id: 'order', label: 'Place Order' },
  { id: 'history', label: 'Order History' }
]

const currentTab = ref('order')
const orderStatus = ref('')
const orderHistory = ref<OrderType[]>([])
const loadingOrders = ref(false)
const error = ref('')

const handleProfileSave = (profileData) => {
  console.log('Profile saved:', profileData)
}

const fetchOrders = async () => {
  if (!userStore.user?.id) {
    error.value = 'No user logged in'
    return
  }

  loadingOrders.value = true
  try {
    orderHistory.value = await getClientOrders(userStore.user.id)
  } catch (e) {
    error.value = e.message
  } finally {
    loadingOrders.value = false
  }
}

const handleOrderCreated = async (orderData: OrderType) => {
  if (!userStore.user?.id) {
    console.error('No user logged in')
    return
  }

  try {
    // Get the user's profile
    const profile = await getProfileByUserId(userStore.user.id)
    if (!profile) {
      console.error('No profile found for user')
      return
    }

    // Create the order with the profile's ID
    const order = await upsertOrder({
      ...orderData,
      clientId: profile.id
    })

    if (order) {
      orderStatus.value = 'Order created successfully!'
      await fetchOrders()
    }
  } catch (error) {
    console.error('Error creating order:', error)
    orderStatus.value = 'Error creating order'
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

.order-status {
  margin-top: 1rem;
  padding: 1rem;
  background: #4CAF50;
  color: white;
  border-radius: 4px;
  text-align: center;
}
</style> 