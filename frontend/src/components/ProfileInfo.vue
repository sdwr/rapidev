<template>
  <div class="profile-info">
    <h2>{{ title || 'Profile Information' }}</h2>
    <form @submit.prevent="handleSubmit" class="profile-form">
      <div class="form-group">
        <label for="name">Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="formData.name" 
          required
          :disabled="!editable"
        />
      </div>

      <div class="form-group">
        <label for="phone">Phone</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="formData.phone" 
          required
          :disabled="!editable"
        />
      </div>

      <div class="form-group">
        <label for="address">Address</label>
        <textarea 
          id="address" 
          v-model="formData.address" 
          required
          :disabled="!editable"
        ></textarea>
      </div>

      <button v-if="editable" type="submit" :disabled="loading">
        {{ loading ? 'Saving...' : 'Save Profile' }}
      </button>
      
      <slot name="actions"></slot>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue'
import { upsertProfile } from '../api/api'
import { useUserStore } from '../stores/userStore'
import type { ProfileType } from '../../../shared/enums/ProfileEnums'

const props = defineProps({
  profileType: {
    type: String,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  },
  profileData: {
    type: Object,
    default: null
  },
  title: {
    type: String,
    default: ''
  }
})

const emit = defineEmits<{
  (e: 'profile-saved', data: any): void
}>()

const userStore = useUserStore()

const formData = ref({
  name: '',
  phone: '',
  address: '',
  profileType: props.profileType
})

const loading = ref(false)
const error = ref('')

// Watch for changes in profileData prop
watch(() => props.profileData, (newProfileData) => {
  if (newProfileData) {
    formData.value = {
      name: newProfileData.name || '',
      phone: newProfileData.phone || '',
      address: newProfileData.address || '',
      profileType: newProfileData.profileType || props.profileType
    }
  }
}, { immediate: true })

const handleSubmit = async () => {
  if (!userStore.user?.id) {
    error.value = 'No user logged in'
    return
  }

  loading.value = true
  try {
    const profileData = {
      ...formData.value,
      userId: userStore.user.id,
      profileType: props.profileType
    }
    
    const savedProfile = await upsertProfile(profileData)
    
    if (savedProfile) {
      // Update the user store with the new profile
      userStore.setUser({
        ...userStore.user,
        profile: savedProfile
      })
      emit('profile-saved', savedProfile)
    }
  } catch (e) {
    console.error('Error saving profile:', e)
    error.value = e.message || 'Failed to save profile'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  //pass
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

input:disabled, textarea:disabled {
  background: var(--color-background-mute);
  cursor: not-allowed;
  opacity: 0.8;
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