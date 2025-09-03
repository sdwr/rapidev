<template>
  <div class="view login-view">
    <h1>Login</h1>
    
    <div class="login-container">
      <!-- Dev Mode Quick Login -->
      <div v-if="isDevMode" class="dev-login-section">
        <div class="dev-mode-header">
          <span class="dev-mode-badge">DEV MODE</span>
          <span class="dev-mode-text">Quick Login</span>
        </div>
        <div class="dev-login-buttons">
          <button 
            @click="devLoginAsClient" 
            class="dev-button client-button"
            :disabled="loading"
          >
            Client
          </button>
          <button 
            @click="devLoginAsCourier" 
            class="dev-button courier-button"
            :disabled="loading"
          >
            Courier
          </button>
          <button 
            @click="devLoginAsAdmin" 
            class="dev-button admin-button"
            :disabled="loading"
          >
            Admin
          </button>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="text" 
            id="email" 
            v-model="email" 
            placeholder="Enter your email"
            required
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Enter your password"
            required
          >
        </div>

        <div class="form-group">
          <label for="userType">Login as</label>
          <select id="userType" v-model="userType">
            <option value="CLIENT">Client</option>
            <option value="COURIER">Courier</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { loginOrRegister } from '../api/api'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const email = ref('')
const password = ref('')
const userType = ref('client')
const loading = ref(false)
const error = ref('')

// Check if we're in dev mode
const isDevMode = computed(() => {
  return import.meta.env.VITE_API_ENV !== 'production'
})

const handleLogin = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter both email and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const user = await loginOrRegister(email.value, password.value, userType.value)
    
    if (!user) {
      throw new Error('Login failed')
    }
    
    // Store user info using the store
    userStore.setUser(user)
    
    // Show success message
    toast.success(`Logged in successfully as ${userType.value}`)
    
    // Redirect based on user type
    switch (userType.value) {
      case 'CLIENT':
        router.push('/client')
        break
      case 'COURIER':
        router.push('/courier')
        break
      case 'ADMIN':
        router.push('/admin')
        break
      default:
        router.push('/login')
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
    toast.error('Login failed')
  } finally {
    loading.value = false
  }
}

// Dev login methods
const devLoginAsClient = async () => {
  email.value = 'dev-client@test.com'
  password.value = 'devpass123'
  userType.value = 'CLIENT'
  await handleLogin()
}

const devLoginAsCourier = async () => {
  email.value = 'dev-courier@test.com'
  password.value = 'devpass123'
  userType.value = 'COURIER'
  await handleLogin()
}

const devLoginAsAdmin = async () => {
  email.value = 'dev-admin@test.com'
  password.value = 'devpass123'
  userType.value = 'ADMIN'
  await handleLogin()
}
</script>

<style scoped>
.login-view {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-container {
  width: 100%;
  max-width: 400px;
  margin-top: 2rem;
}

.login-form {
  background: var(--color-background-soft);
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background: #45a049;
}

.login-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Dev Mode Styles */
.dev-login-section {
  margin-bottom: 1.5rem;
  background: #fffbf0;
  border: 2px dashed #ffa726;
  border-radius: 8px;
  padding: 1rem;
}

.dev-mode-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.dev-mode-badge {
  background: #ff9800;
  color: white;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: bold;
  letter-spacing: 0.5px;
}

.dev-mode-text {
  font-size: 0.9rem;
  color: #f57c00;
  font-weight: 500;
}

.dev-login-buttons {
  display: flex;
  gap: 0.5rem;
}

.dev-button {
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.client-button {
  background: #2196F3;
}

.client-button:hover:not(:disabled) {
  background: #1976D2;
}

.courier-button {
  background: #9C27B0;
}

.courier-button:hover:not(:disabled) {
  background: #7B1FA2;
}

.admin-button {
  background: #F44336;
}

.admin-button:hover:not(:disabled) {
  background: #D32F2F;
}

.dev-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Dark mode adjustments */
@media (prefers-color-scheme: dark) {
  .dev-login-section {
    background: rgba(255, 152, 0, 0.1);
    border-color: #ff9800;
  }
  
  .dev-mode-header h3 {
    color: #ffa726;
  }
}
</style> 