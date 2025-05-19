<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { toast } from 'vue3-toastify'
import UserProfile from './components/UserProfile.vue'
import AboutMe from './components/AboutMe.vue'
import { useUserStore } from './stores/userStore'
import { onBeforeMount, computed } from 'vue'
import { useOrderStore } from './stores/orderStore'
import { useOrderItemStore } from './stores/orderItemStore'

const userStore = useUserStore()
const orderStore = useOrderStore()
const orderItemStore = useOrderItemStore()

// Check if user profile is complete
const isProfileComplete = computed(() => {
  return userStore.user && 
         userStore.user.name && 
         userStore.user.name.trim() !== '' && 
         userStore.user.phone && 
         userStore.user.phone.trim() !== '';
})

// Check if user is logged in but profile is incomplete
const showAboutMe = computed(() => {
  return userStore.user && !isProfileComplete.value;
})

// Check if user is logged in
const isLoggedIn = computed(() => {
  return !!userStore.user;
})

// Check user type
const isClient = computed(() => {
  return isLoggedIn.value && userStore.user.userType === 'CLIENT';
})

const isCourier = computed(() => {
  return isLoggedIn.value && userStore.user.userType === 'COURIER';
})

const isAdmin = computed(() => {
  return isLoggedIn.value && userStore.user.userType === 'ADMIN';
})

// Load user authentication state before mounting the app
onBeforeMount(async () => {
  await userStore.loadUserFromStorage()
  // These can be loaded after router navigation happens:
  orderStore.fetchAllOrders()
  orderItemStore.fetchAllOrderItems()
})
</script>

<template>
  <!-- Add a loading state while auth is loading -->
  <div v-if="userStore.isLoadingAuth" class="loading-overlay">
    <div class="loading-spinner"></div>
  </div>

  <!-- Show About Me if user is logged in but profile is incomplete -->
  <AboutMe v-if="showAboutMe" />

  <!-- Show main app otherwise -->
  <div v-else class="app-container">
    <header>
      <div class="header-content">
        <div class="header-text">Rapid Delivery</div>
        <UserProfile />
      </div>
      <div v-if="isAdmin" class="content-container">
        <nav>
          <!-- Show appropriate links based on user role when logged in -->
          <RouterLink to="/admin">Admin</RouterLink>
          <RouterLink to="/debug">Debug</RouterLink>
        </nav>
      </div>
    </header>

    <main class="content-container">
      <RouterView />
    </main>
  </div>
</template>

<style>
/* Global styles */
.app {
  margin: 0 !important;
  padding: 10px !important;
}
.view, 
.view-container,
.tab-content {
  display: flex;
  flex-direction: column;
  max-height: 100%;
  min-height: 100%;
  height: 100%;
  width: 100% !important;
  max-width: 510 !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow-y: hidden;
}

/* Reset default margins/paddings for consistency */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Add these styles for loading indicator */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
}

.header-text {
  font-size: 24px;
  font-weight: bold;
}

.content-container {
  max-height: calc(100vh - 150px);
  height: calc(100vh - 150px);
  width: 100%;
  max-width: 510px;
  margin: 0 auto;
  justify-items: center;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 100%;
}

header {
  width: 100%;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  padding: 0.5rem 0;
}

nav {
  display: flex;
  gap: 20px;
  padding: 1rem 0;
}

nav a {
  text-decoration: none;
  color: #333;
  padding: 0.5rem 1rem;
}

nav a:hover {
  background: var(--color-background-soft);
}

nav a.router-link-active {
  background: var(--color-background-soft);
  font-weight: bold;
}
</style>
