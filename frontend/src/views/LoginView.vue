<template>
  <div class="view login-view">
    <h1>Login</h1>
    
    <div class="login-container">
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="Enter your username"
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
            <option value="client">Client</option>
            <option value="courier">Courier</option>
            <option value="admin">Admin</option>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { loginOrRegister } from '../api/api'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()
const username = ref('')
const password = ref('')
const userType = ref('client')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Please enter both username and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const user = await loginOrRegister(username.value, password.value, userType.value)
    
    if (!user) {
      throw new Error('Login failed')
    }
    
    // Store user info using the store
    userStore.setUser(user)
    
    // Show success message
    toast.success(`Logged in successfully as ${userType.value}`)
    
    // Redirect based on user type
    switch (userType.value) {
      case 'client':
        router.push('/')
        break
      case 'courier':
        router.push('/courier')
        break
      case 'admin':
        router.push('/admin')
        break
    }
  } catch (err) {
    error.value = 'Login failed. Please try again.'
    toast.error('Login failed')
  } finally {
    loading.value = false
  }
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
</style> 