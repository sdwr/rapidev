<template>
  <div class="view debug-view">
    <h1>Debug View</h1>
    
    <div class="debug-container">
      <!-- Users Section -->
      <div class="section">
        <h2>Users</h2>
        <div class="list-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th></th>
                <th>User Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.userType }}</td>
                <td>
                  <button @click="deleteUser(user.id)" class="delete-button">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Profiles Section -->
      <div class="section">
        <h2>Profiles</h2>
        <div class="list-container">
          <div v-for="profile in profiles" :key="profile.id" class="list-item">
            <div class="item-content">
              <p><strong>ID:</strong> {{ profile.id }}</p>
              <p><strong>User ID:</strong> {{ profile.userId }}</p>
              <p><strong>Profile Type:</strong> {{ profile.profileType }}</p>
            </div>
            <button @click="deleteProfile(profile.id)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="section">
        <h2>Orders</h2>
        <div class="list-container">
          <div v-for="order in orders" :key="order.id" class="list-item">
            <div class="item-content">
              <p><strong>ID:</strong> {{ order.id }}</p>
              <p><strong>Client ID:</strong> {{ order.clientId }}</p>
              <p><strong>Courier ID:</strong> {{ order.courierId }}</p>
              <p><strong>Status:</strong> {{ order.status }}</p>
            </div>
            <button @click="deleteOrder(order.id)" class="delete-button">Delete</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAllUsers, getAllProfiles, getAllOrders, deleteUser as deleteUserApi, deleteOrder as deleteOrderApi } from '../api/api'
import { toast } from 'vue3-toastify'

const users = ref([])
const profiles = ref([])
const orders = ref([])

const loadData = async () => {
  try {
    users.value = await getAllUsers()
    orders.value = await getAllOrders()
    profiles.value = await getAllProfiles()
  } catch (error) {
    toast.error('Failed to load debug data')
  }
}

const deleteUser = async (userId: string) => {
  try {
    await deleteUserApi(userId)
    toast.success('User deleted successfully')
    loadData() // Reload the data
  } catch (error) {
    toast.error('Failed to delete user')
  }
}

const deleteOrder = async (orderId: string) => {
  try {
    await deleteOrderApi(orderId)
    toast.success('Order deleted successfully')
    loadData() // Reload the data
  } catch (error) {
    toast.error('Failed to delete order')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.debug-view {
  padding: 2rem;
}

.debug-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.section {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--color-background);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.item-content {
  flex: 1;
}

.delete-button {
  padding: 0.5rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-button:hover {
  background: #c82333;
}
</style> 