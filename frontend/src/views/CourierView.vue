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
              @markPickedUp="handleOrderItemPickup"
              @markDelivered="handleMarkDelivered"
              @reportProblem="handleReportProblem"
            />
          </div>
        </div>

        <!-- Map View Tab -->
        <div v-if="currentTab === 'map'" class="tab-panel-no-scroll">
          <div class="map-container">
            <MapView 
              :locations="filteredLocations" 
              :nextLocation="selectedNextLocation"
              @setDestination="handleSetDestination"
              @markPickedUp="handleOrderPickup"
              @markDelivered="handleMarkDelivered"
              @reportProblem="handleReportProblem"
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

    <!-- Add the confirmation dialog -->
    <ConfirmationDialog
      v-model:show="showConfirmation"
      :action="confirmationAction"
      :orderItem="selectedOrderItem"
      @success="handleConfirmationSuccess"
      @error="handleConfirmationError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import OrderItemCard from '@/components/OrderItemCard.vue'
import MapView from '@/components/MapView.vue'
import { useUserStore } from '../stores/userStore'
import { toast } from 'vue3-toastify'
import { useOrderItemStore } from '../stores/orderItemStore'
import { useOrderStore } from '../stores/orderStore'
import { getCurrentStatus, getCurrentItemStatus } from '../utils'
import ConfirmationDialog from '@/components/ConfirmationDialog.vue'
import { OrderItemStatusEnum } from '../shared/enums/OrderItemEnums'
import { updateOrderItemStatus } from '../api/api'
const userStore = useUserStore()
const orderItemStore = useOrderItemStore()
const orderStore = useOrderStore()

const tabs = [
  { id: 'active', label: 'Active Deliveries' },
  { id: 'map', label: 'Delivery Map'},
  { id: 'history', label: 'Delivery History' },
]

const currentTab = ref('active')
const activeDeliveries = computed(() => orderItemStore.orderItems.filter(item => item.courierId === userStore.user?.id))
const deliveryHistory = computed(() => orderItemStore.orderItems.filter(item => item.courierId === userStore.user?.id && item.status === 'DELIVERED'))

// Map configurations

// Create locations array for the map
const allLocations = computed(() => {
  const locations = [];
  
  // Get all orders for the courier's active deliveries
  const courierOrderIds = activeDeliveries.value.map(item => item.orderId);
  const courierOrders = orderStore.orders.filter(order => courierOrderIds.includes(order.id));
  
  // Add pickup locations from orders
  courierOrders.forEach(order => {
    locations.push({
      address: order.pickupAddress,
      status: getCurrentStatus(order),
      type: 'PICKUP',
      orderId: order.id,
      label: `Pickup: Order #${order.id}`
    });
  });
  
  // Add delivery locations from order items
  activeDeliveries.value.forEach(item => {
    locations.push({
      address: item.deliveryAddress,
      status: getCurrentItemStatus(item),
      type: 'DELIVERY',
      orderId: item.orderId,
      itemId: item.id,
      label: `Delivery: Item #${item.id}`
    });
  });
  
  return locations;
});

// Filter locations based on checkboxes
const filteredLocations = computed(() => {
  return allLocations.value
});

const selectedNextLocation = ref(null);

// Add these handler functions
const handleSetDestination = (location) => {
  selectedNextLocation.value = location;
  // You might want to toast a confirmation
  toast.success(`Set destination to ${location.address}`);
};

// Simplified dialog state
const showConfirmation = ref(false);
const confirmationAction = ref(OrderItemStatusEnum.PICKED_UP);
const selectedOrderItem = ref(null);

// Method to open confirmation dialog for pickup
const handleOrderPickup = async (orderItem) => {
  selectedOrderItem.value = orderItem;
  confirmationAction.value = "ORDER_PICKUP";
  showConfirmation.value = true;
};

const handleOrderItemPickup = async (orderItem) => {
  selectedOrderItem.value = orderItem;
  confirmationAction.value = OrderItemStatusEnum.PICKED_UP;
  showConfirmation.value = true;
};

// Method to open confirmation dialog for delivery
const handleMarkDelivered = async (orderItem) => {
  selectedOrderItem.value = orderItem;
  confirmationAction.value = OrderItemStatusEnum.DELIVERED;
  showConfirmation.value = true;
};

// Method to open confirmation dialog for problem report
const handleReportProblem = async (orderItem) => {
  selectedOrderItem.value = orderItem;
  confirmationAction.value = OrderItemStatusEnum.PROBLEM;
  showConfirmation.value = true;
};

// Handle successful confirmation
const handleConfirmationSuccess = async (result) => {
    // Refresh data as needed
  await orderItemStore.fetchAllOrderItems();
  await orderStore.fetchAllOrders();
};

// Handle confirmation error
const handleConfirmationError = (error) => {
  console.error('Action failed:', error);
  // Additional error handling if needed
};

onMounted(async () => {
  await orderItemStore.fetchAllOrderItems();
  await orderStore.fetchAllOrders();
})
</script>

<style scoped>
.view, .courier-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
}

.view-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
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
  display: flex;
  flex-direction: column;

  flex: 1;
  overflow-y: hidden;
  min-height: 0;
}

.tab-panel {
  min-height: 200px;
  height: 100%;
  overflow-y: scroll;
  flex: 1;
}

.tab-panel-no-scroll {
  display: flex;
  flex-direction: column;
  min-height: 400px;
  height: 100%;
  flex: 1;
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

.map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.filter-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
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