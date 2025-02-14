<template>
  <div class="debug-view">
    <h2>Debug Data</h2>
    
    <div v-for="(table, name) in tables" :key="name" class="table-section">
      <h3>{{ name }}</h3>
      <pre>{{ JSON.stringify(table, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAllOrders, getAllOrderStatuses } from '../api/api'

const tables = ref({})

onMounted(async () => {
  tables.value = {
    orders: await getAllOrders(),
    orderStatuses: await getAllOrderStatuses()
  }
})
</script>

<style scoped>
.debug-view {
  padding: 20px;
}
.table-section {
  margin: 20px 0;
  padding: 10px;
  border: 1px solid #ddd;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 