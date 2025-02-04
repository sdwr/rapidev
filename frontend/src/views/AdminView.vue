<template>
  <div class="view admin-view">
    <h1>Admin View</h1>
    <div class="card">
      <h2>Manage Orders</h2>
      <div class="orders-list">{{ ordersMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const ordersMessage = ref('No orders to display')
</script>

<style scoped>
.card {
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}
</style> 