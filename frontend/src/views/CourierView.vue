<template>
  <div class="view courier-view">
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
          <ProfileInfo 
            profileType="PICKUP"
            @profile-saved="handleProfileSave" />
        </div>

        <!-- Active Deliveries Tab -->
        <div v-if="currentTab === 'active'" class="tab-panel">
          <div class="list-container">
            <p v-if="!activeDeliveries.length">No active deliveries.</p>
            <OrderItemCard
              v-else
              v-for="orderItem in activeDeliveries"
              :key="orderItem.id"
              :orderItem="orderItem"
              :userType="'COURIER'"
            />
          </div>
        </div>

        <!-- Delivery History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <div class="list-container">
            <p v-if="!deliveryHistory.length">No delivery history.</p>
            <OrderItemCard
              v-else
              v-for="orderItem in deliveryHistory"
              :key="orderItem.id"
              :orderItem="orderItem"
              :userType="'COURIER'"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ProfileInfo from '@/components/ProfileInfo.vue'
import OrderItemCard from '@/components/OrderItemCard.vue'
import { useUserStore } from '../stores/userStore'
import { toast } from 'vue3-toastify'
import { useOrderItemStore } from '../stores/orderItemStore'

const userStore = useUserStore()
const orderItemStore = useOrderItemStore()
const tabs = [
  { id: 'active', label: 'Active Deliveries' },
  { id: 'history', label: 'Delivery History' },
  { id: 'profile', label: 'My Profile' }
]

const currentTab = ref('active')
const activeDeliveries = computed(() => orderItemStore.orderItems.filter(item => item.courierId === userStore.user?.id))
const deliveryHistory = computed(() => orderItemStore.orderItems.filter(item => item.courierId === userStore.user?.id && item.status === 'DELIVERED'))

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

onMounted(async () => {
  await orderItemStore.fetchAllOrderItems()
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