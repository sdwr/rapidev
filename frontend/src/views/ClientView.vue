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
            <template v-if="userStore.user?.id && userStore.user?.profile">
              <Order
                v-if="currentTab === 'order'"
                @order-created="handleOrderCreated"
              />
            </template>
            <div v-else class="error-message">
              Please create a profile before placing an order.
            </div>
          </div>
        </div>

        <!-- My Orders Tab -->
        <div v-if="currentTab === 'myOrders'" class="tab-panel">
          <h2>My Orders</h2>
          <div class="list-container">
            <p v-if="!myOrders.length">No active orders.</p>
            <div v-else v-for="order in myOrders" :key="order.id" class="list-item">
              <div class="order-header" @click="toggleOrder(order.id)">
                <h3>Order #{{ order.id }}</h3>
                <div class="status-chip" :style="{
                  backgroundColor: orderStatusColors[order.status].background,
                  color: orderStatusColors[order.status].text
                }">
                  {{ order.status }}
                </div>
                <span class="toggle-icon">{{ expandedOrders[order.id] ? '▼' : '▶' }}</span>
              </div>
              
              <div v-if="expandedOrders[order.id]" class="order-details">
                <p>Delivery Address: {{ order.deliveryAddress }}</p>
                <p>Items: {{ order.items.length }}</p>
                <p>Created: {{ new Date(order.createdAt).toLocaleString() }}</p>
                
                <div class="order-actions">
                  <button 
                    v-if="order.status === OrderStatus.DRAFT" 
                    @click="handleCancelOrder(order.id)"
                    class="action-button cancel"
                  >
                    Cancel Order
                  </button>
                  <button 
                    v-if="order.status === OrderStatus.DRAFT" 
                    @click="handleEditOrder(order)"
                    class="action-button edit"
                  >
                    Edit Order
                  </button>
                  <button 
                    v-if="order.status === OrderStatus.DRAFT" 
                    @click="handlePayOrder(order.id)"
                    class="action-button pay"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Order History</h2>
          <div class="list-container">
            <p v-if="!orderHistory.length">No order history.</p>
            <div v-else v-for="order in orderHistory" :key="order.id" class="list-item">
              <div class="order-header" @click="toggleOrder(order.id)">
                <h3>Order #{{ order.id }}</h3>
                <div class="status-chip" :style="{
                  backgroundColor: orderStatusColors[order.status].background,
                  color: orderStatusColors[order.status].text
                }">
                  {{ order.status }}
                </div>
                <span class="toggle-icon">{{ expandedOrders[order.id] ? '▼' : '▶' }}</span>
              </div>
              
              <div v-if="expandedOrders[order.id]" class="order-details">
                <p>Delivery Address: {{ order.deliveryAddress }}</p>
                <p>Items: {{ order.items.length }}</p>
                <p>Created: {{ new Date(order.createdAt).toLocaleString() }}</p>
                <p>Completed: {{ new Date(order.updatedAt).toLocaleString() }}</p>
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
import ProfileInfo from '@/components/ProfileInfo.vue'
import Order from '@/components/Order.vue'
import type { Order as OrderType } from '@/models/Order'
import { getClientOrders, upsertOrder, getProfileByUserId, updateOrderState } from '../api/api'
import { useUserStore } from '../stores/userStore'
import { toast } from 'vue3-toastify'
import { orderStatusColors } from '@/constants/orderStatusColors'
import { OrderStatus } from '@/models/Order'
import { ACTIVE_ORDER_STATUSES, HISTORY_ORDER_STATUSES } from '@/utils/consts'

const userStore = useUserStore()

const tabs = [
  { id: 'profile', label: 'My Profile' },
  { id: 'order', label: 'Place Order' },
  { id: 'myOrders', label: 'My Orders' },
  { id: 'history', label: 'History' }
]

const currentTab = ref('order')
const myOrders = ref<OrderType[]>([])
const orderHistory = ref<OrderType[]>([])
const loadingOrders = ref(false)
const error = ref('')
const expandedOrders = ref<Record<string, boolean>>({})

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
    const orders = await getClientOrders(userStore.user.id)
    myOrders.value = orders.filter(order => ACTIVE_ORDER_STATUSES.includes(order.status))
    orderHistory.value = orders.filter(order => HISTORY_ORDER_STATUSES.includes(order.status))
  } catch (e) {
    error.value = e.message
  } finally {
    loadingOrders.value = false
  }
}

const handleOrderCreated = async (orderData: OrderType) => {
  if (!userStore.user?.id) {
    console.error('No user logged in')
    toast.error('Please log in to create an order')
    return
  }

  if (!userStore.user?.profile) {
    console.error('No profile found for user')
    toast.error('Please create a profile before placing an order')
    return
  }

  try {
    // Create the order with the correct IDs
    const order = await upsertOrder({
      ...orderData,
      clientId: userStore.user.id,
      clientProfileId: userStore.user.profile.id
    })

    if (order) {
      toast.success('Order created successfully!')
      await fetchOrders()
    }
  } catch (error) {
    console.error('Error creating order:', error)
    toast.error(error.message || 'Error creating order')
  }
}

const handleCancelOrder = async (orderId: string) => {
  try {
    await updateOrderState(orderId, OrderStatus.CANCELLED_BY_CLIENT)
    toast.success('Order cancelled successfully')
    await fetchOrders()
  } catch (error) {
    console.error('Error cancelling order:', error)
    toast.error('Failed to cancel order')
  }
}

const handlePayOrder = async (orderId: string) => {
  try {
    // TODO: Implement payment integration
    toast.success('Payment processed successfully')
    await fetchOrders()
  } catch (error) {
    console.error('Error processing payment:', error)
    toast.error('Failed to process payment')
  }
}

const handleEditOrder = async (order: OrderType) => {
  // TODO: Implement order editing
  toast.info('Order editing coming soon')
}

const toggleOrder = (orderId: string) => {
  expandedOrders.value[orderId] = !expandedOrders.value[orderId]
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