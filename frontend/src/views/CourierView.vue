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
        <!-- Active Deliveries Tab -->
        <div v-if="currentTab === 'active'" class="tab-panel">
          <h2>Active Deliveries</h2>
          <div class="list-container">
            <p v-if="!activeDeliveries.length">No active deliveries.</p>
            <div v-else v-for="delivery in activeDeliveries" :key="delivery.id" class="list-item">
              <h3>Order #{{ delivery.id }}</h3>
              <p>Status: {{ delivery.status }}</p>
              <p>Pickup: {{ delivery.pickupAddress }}</p>
              <p>Delivery: {{ delivery.deliveryAddress }}</p>
              <div class="delivery-actions">
                <button @click="updateDeliveryStatus(delivery.id, 'PICKED_UP')" v-if="delivery.status === 'ACCEPTED'">
                  Mark as Picked Up
                </button>
                <button @click="updateDeliveryStatus(delivery.id, 'DELIVERED')" v-if="delivery.status === 'PICKED_UP'">
                  Mark as Delivered
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Delivery History Tab -->
        <div v-if="currentTab === 'history'" class="tab-panel">
          <h2>Delivery History</h2>
          <div class="list-container">
            <p v-if="!deliveryHistory.length">No completed deliveries.</p>
            <div v-else v-for="delivery in deliveryHistory" :key="delivery.id" class="list-item">
              <h3>Order #{{ delivery.id }}</h3>
              <p>Status: {{ delivery.status }}</p>
              <p>Completed: {{ new Date(delivery.updatedAt).toLocaleString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Order } from '@/models/Order'

const tabs = [
  { id: 'active', label: 'Active Deliveries' },
  { id: 'history', label: 'Delivery History' }
]

const currentTab = ref('active')
const activeDeliveries = ref<Order[]>([])
const deliveryHistory = ref<Order[]>([])

const updateDeliveryStatus = (orderId: string, status: string) => {
  console.log(`Updating delivery ${orderId} to status: ${status}`)
  // Here you would typically make an API call to update the delivery status
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

.delivery-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.delivery-actions button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  background: #4CAF50;
  color: white;
  transition: opacity 0.2s;
}

.delivery-actions button:hover {
  opacity: 0.9;
}
</style> 