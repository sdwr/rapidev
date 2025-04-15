<template>
  <div class="debug-view">
    <h2>Debug Data</h2>
    
    <div v-for="(table, name) in tables" :key="name" class="table-section">
      <h3>{{ name }}</h3>
      <pre>{{ JSON.stringify(table, null, 2) }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllOrders, getAllOrderStatuses, getAllUsers } from '../api/api'
import type { User } from '@/models/User'
import type { Order } from '@/models/Order'

const tables = ref<{
  users: User[]
  clients: User[]
  couriers: User[]
  admins: User[]
  orders: Order[]
  orderStatuses: any[]
}>({
  users: [],
  clients: [],
  couriers: [],
  admins: [],
  orders: [],
  orderStatuses: []
})

onMounted(async () => {
  try {
    const [users, orders, orderStatuses] = await Promise.all([
      getAllUsers(),
      getAllOrders(),
      getAllOrderStatuses()
    ])

    tables.value = {
      users,
      clients: users.filter(user => user.userType === 'client'),
      couriers: users.filter(user => user.userType === 'courier'),
      admins: users.filter(user => user.userType === 'admin'),
      orders,
      orderStatuses
    }
  } catch (error) {
    console.error('Error fetching debug data:', error)
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