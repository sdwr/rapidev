<template>
  <div class="about-me-container">
    <div class="about-me-card">
      <h1>Welcome to Rapid Delivery!</h1>
      <p class="subtitle">Please complete your profile to continue</p>
      
      <form @submit.prevent="saveProfile" class="about-me-form">
        <div class="form-group">
          <label for="name">Name</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            placeholder="Enter your full name"
            required
          />
        </div>

        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            v-model="formData.phone" 
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="save-button" :disabled="loading || !isFormValid">
          {{ loading ? 'Saving...' : 'Save Profile' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/userStore'
import { updateUser } from '../api/api'
import { toast } from 'vue3-toastify'

const userStore = useUserStore()
const error = ref('')
const loading = ref(false)

// Initialize form data with existing user data
const formData = ref({
  name: userStore.user?.name || '',
  phone: userStore.user?.phone || '',
})

// Validate form
const isFormValid = computed(() => {
  return formData.value.name.trim() !== '' && 
         formData.value.phone.trim() !== '';
})

const saveProfile = async () => {
  if (!userStore.user?.id) {
    error.value = 'User not logged in'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Update the user data
    const updatedUser = await updateUser(
      userStore.user.id, 
      {
        ...userStore.user,
        name: formData.value.name.trim(),
        phone: formData.value.phone.trim()
      }
    )
    
    // Update the user store
    userStore.setUser(updatedUser)
    
    toast.success('Profile updated successfully!')
  } catch (err) {
    console.error('Failed to update profile:', err)
    error.value = 'Failed to save profile. Please try again.'
    toast.error('Failed to update profile')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.about-me-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: var(--color-background);
}

.about-me-card {
  background: var(--color-background-soft);
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 0.5rem;
  color: var(--color-heading);
  text-align: center;
}

.subtitle {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-text-light);
}

.about-me-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
  font-size: 1rem;
}

.error-message {
  color: #f44336;
  font-size: 0.9rem;
}

.save-button {
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
}

.save-button:hover {
  background: #45a049;
}

.save-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
</style> 