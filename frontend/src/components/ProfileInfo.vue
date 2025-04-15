<template>
  <div class="profile-info">
    <h2>Profile Information</h2>
    <form @submit.prevent="handleSubmit" class="profile-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="formData.name" 
          required
        />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="formData.email" 
          required
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="formData.phone" 
          required
        />
      </div>

      <div class="form-group">
        <label for="address">Address</label>
        <textarea 
          id="address" 
          v-model="formData.address" 
          required
        ></textarea>
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Profile' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { upsertProfile } from '../api/api'
import { useUserStore } from '../stores/userStore'

const props = defineProps<{
  profileType: 'client' | 'courier'
}>()

const emit = defineEmits<{
  (e: 'profile-saved', data: any): void
}>()

const userStore = useUserStore()

const formData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!userStore.user?.id) {
    error.value = 'No user logged in'
    return
  }

  loading.value = true
  try {
    const profileData = {
      ...formData.value,
      userId: userStore.user.id
    }
    const savedProfile = await upsertProfile(profileData)
    emit('profile-saved', savedProfile)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (userStore.user?.profile) {
    formData.value = {
      name: userStore.user.profile.name || '',
      email: userStore.user.profile.email || '',
      phone: userStore.user.profile.phone || '',
      address: userStore.user.profile.address || ''
    }
  }
})
</script>

<style scoped>
.profile-info {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
}

input, textarea {
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover {
  background-color: #45a049;
}

button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style> 