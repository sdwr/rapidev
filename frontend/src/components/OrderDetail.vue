<template>
  <!-- Add this to your OrderDetail component -->
  <div class="order-map-section">
    <h3>Delivery Map</h3>
    <MapView :locations="orderLocations" />
  </div>
</template>

<script setup>
import MapView from './MapView.vue';
import { computed } from 'vue';

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
});

// Create locations array for this specific order
const orderLocations = computed(() => {
  const locations = [];
  
  // Add pickup location
  locations.push({
    address: props.order.pickupAddress,
    type: 'PICKUP',
    orderId: props.order.id
  });
  
  // Add delivery locations
  if (props.order.items) {
    props.order.items.forEach(item => {
      locations.push({
        address: item.deliveryAddress,
        type: 'DELIVERY',
        orderId: props.order.id,
        itemId: item.id
      });
    });
  }
  
  return locations;
});
</script> 