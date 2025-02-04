<template>
  <div class="view courier-view">
    <h1>Courier View</h1>
    <div class="card">
      <h2>Available Deliveries</h2>
      <div class="deliveries-list">{{ deliveriesMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const deliveriesMessage = ref('No deliveries available')
</script>

<style scoped>
.card {
  padding: 2rem;
  background: var(--color-background-soft);
  border-radius: 8px;
}
</style> 