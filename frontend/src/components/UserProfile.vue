<template>
  <div class="user-profile" v-if="isLoggedIn">
    <div class="profile-info">
      <span class="username">{{ user?.username }}</span>
      <span class="user-type">{{ user?.userType }}</span>
    </div>
    <button @click="handleLogout" class="logout-button">Logout</button>
  </div>
</template>

<script setup>
import { useUserStore } from '../stores/userStore'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'

const router = useRouter()
const userStore = useUserStore()
const { user, isLoggedIn } = storeToRefs(userStore)

const handleLogout = () => {
  userStore.setUser(null)
  toast.success('Logged out successfully')
  router.push('/login')
}
</script>

<style scoped>
.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 1rem;
  background: var(--color-background-soft);
  border-radius: 4px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.username {
  font-weight: 500;
}

.user-type {
  font-size: 0.875rem;
  color: var(--color-text-light);
  text-transform: capitalize;
}

.logout-button {
  padding: 0.5rem 1rem;
  background: var(--color-background-mute);
  border: none;
  border-radius: 4px;
  color: var(--color-text);
  cursor: pointer;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background: var(--color-background-hover);
}
</style> 