<template>
  <div class="view client-view">
    <h1>Client View</h1>
    <ProfileInfo @profile-saved="handleProfileSave" />
    <div class="card">
      <h2>Place Your Order</h2>
      <button @click="createOrder" type="button">New Order</button>
      <div class="order-status">{{ orderStatus }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProfileInfo from '@/components/ProfileInfo.vue'

const orderStatus = ref('')

const createOrder = () => {
  console.log('Creating new order...')
  orderStatus.value = 'Processing your order...'
}

const handleProfileSave = (profileData) => {
  console.log('Profile saved in parent:', profileData)
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