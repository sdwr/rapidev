<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { toast } from 'vue3-toastify'
import UserProfile from './components/UserProfile.vue'
import AboutMe from './components/AboutMe.vue'
import { useUserStore } from './stores/userStore'
import { onMounted, computed } from 'vue'
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

onMounted(async () => {
  userStore.loadUserFromStorage()
  await orderStore.fetchAllOrders()
  await orderItemStore.fetchAllOrderItems()
})
</script>

<template>
  <!-- Show About Me if user is logged in but profile is incomplete -->
  <AboutMe v-if="showAboutMe" />

  <!-- Show main app otherwise -->
  <div v-else class="app-container">
    <header>
      <div class="header-content">
        <div class="header-text">Rapid Delivery</div>
        <UserProfile />
      </div>
      <div v-if="isAdmin"class="content-container">
        <nav>
          
          <!-- Show appropriate links based on user role when logged in -->
          <template>
            
            <!-- Admin links -->
            <RouterLink v-if="isAdmin" to="/admin">Admin</RouterLink>
            
            <!-- Debug link - only for admins -->
            <RouterLink v-if="isAdmin" to="/debug">Debug</RouterLink>
          </template>
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
  width: 100% !important;
  max-width: 510 !important;
  margin: 0 !important;
  padding: 0 !important;
}

/* Reset default margins/paddings for consistency */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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
  width: 100%;
  max-width: 510px;
  margin: 0 auto;
  justify-items: center;
}

main {
  flex: 1;
  display: grid;
  align-items: start;
}

header {
  width: 100%;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
  background: var(--color-background);
  padding: 1rem 0;
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
