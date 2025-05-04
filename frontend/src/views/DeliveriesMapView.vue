<template>
  <div class="view map-view">
    <h1>Delivery Map</h1>
    
    <div class="filter-controls">
      <label>
        <input type="checkbox" v-model="showPickups"> 
        Show Pickup Locations
      </label>
      <label>
        <input type="checkbox" v-model="showDeliveries"> 
        Show Delivery Locations
      </label>
    </div>
    
    <MapView :locations="filteredLocations" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import MapView from '../components/MapView.vue';
import { useOrderStore } from '../stores/orderStore';

const orderStore = useOrderStore();
const showPickups = ref(true);
const showDeliveries = ref(true);

// Fetch orders when component mounts
onMounted(async () => {
  if (orderStore.orders.length === 0) {
    await orderStore.fetchAllOrders();
  }
});

// Create an array of locations from all orders
const allLocations = computed(() => {
  const locations = [];
  
  orderStore.orders.forEach(order => {
    // Add pickup location
    locations.push({
      address: order.pickupAddress,
      type: 'PICKUP',
      orderId: order.id
    });
    
    // Add delivery locations from order items
    if (order.items) {
      order.items.forEach(item => {
        locations.push({
          address: item.deliveryAddress,
          type: 'DELIVERY',
          orderId: order.id,
          itemId: item.id
        });
      });
    }
  });
  
  return locations;
});

// Filter locations based on checkboxes
const filteredLocations = computed(() => {
  return allLocations.value.filter(location => {
    if (location.type === 'PICKUP' && !showPickups.value) return false;
    if (location.type === 'DELIVERY' && !showDeliveries.value) return false;
    return true;
  });
});
</script>

<style scoped>
.map-view {
  padding: 1rem;
}

.filter-controls {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
}

.filter-controls label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}
</style> 