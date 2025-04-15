<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { toast } from 'vue3-toastify'
import UserProfile from './components/UserProfile.vue'
import { useUserStore } from './stores/userStore'
import { onMounted } from 'vue'

const userStore = useUserStore()

onMounted(() => {
  userStore.loadUserFromStorage()
})


</script>

<template>
  <div class="app-container">
    <header>
      <div class="content-container">
        <div class="header-text">Rapid Delivery</div>
        <nav class="header-nav">
          <RouterLink to="/login">Login</RouterLink>
          <RouterLink to="/">Client</RouterLink>
          <RouterLink to="/admin">Admin</RouterLink>
          <RouterLink to="/courier">Courier</RouterLink>
          <RouterLink to="/debug">Debug</RouterLink>
        </nav>
        <UserProfile />
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
  padding: 0px !important;
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
  max-height: 100vh;
  overflow: hidden;
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
  display: flex;
  flex-direction: row;
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

.header-nav {
  display: flex;
  gap: 10px;
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
