<template>
  <div class="view client-view">
    <h1>Client View</h1>
    <ProfileInfo @profile-saved="handleProfileSave" />
    <div class="card" v-if="!showOrderForm">
      <h2>Place Your Order</h2>
      <button @click="showOrderForm = true" type="button">New Order</button>
      <div class="order-status">{{ orderStatus }}</div>
    </div>
    <Order v-else @order-created="handleOrderCreated" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProfileInfo from '@/components/ProfileInfo.vue'
import Order from '@/components/Order.vue'

const orderStatus = ref('')
const showOrderForm = ref(false)

const handleProfileSave = (profileData) => {
  console.log('Profile saved in parent:', profileData)
  // Here you would typically send this to your backend
}

const handleOrderCreated = (orderData) => {
  console.log('Order created:', orderData)
  orderStatus.value = 'Order submitted successfully!'
  showOrderForm.value = false
  // Here you would typically send this to your backend
}
</script>

<style scoped>
.card {
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}
</style> 