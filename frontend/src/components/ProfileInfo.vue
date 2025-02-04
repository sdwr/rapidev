<template>
  <div class="profile-info">
    <h2>Profile Information</h2>
    <form @submit.prevent="saveProfile">
      <div class="form-group">
        <label for="name">Full Name</label>
        <input 
          type="text" 
          id="name" 
          v-model="profile.name" 
          placeholder="Enter your full name"
          required
        >
      </div>

      <div class="form-group">
        <label for="phone">Phone Number</label>
        <input 
          type="tel" 
          id="phone" 
          v-model="profile.phone"
          placeholder="Enter your phone number"
          required
          pattern="[0-9]{10}"
          title="Please enter a valid 10-digit phone number"
        >
      </div>

      <div class="form-group">
        <label for="address">Pickup Address</label>
        <textarea 
          id="address" 
          v-model="profile.pickupAddress"
          placeholder="Enter your pickup address"
          rows="3"
          required
        ></textarea>
      </div>

      <button type="submit" class="save-button">Save Profile</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProfileInfo } from '@/models/ProfileInfo'

const emit = defineEmits<{
  (e: 'profile-saved', profile: ProfileInfo): void
}>()

const profile = ref<ProfileInfo>({
  name: '',
  phone: '',
  pickupAddress: ''
})

const saveProfile = () => {
  const profileData: ProfileInfo = {
    ...profile.value,
    updatedAt: new Date()
  }
  console.log('Saving profile:', profileData)
  emit('profile-saved', profileData)
}
</script>

<style scoped>
.profile-info {
  background: var(--color-background-soft);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background);
  color: var(--color-text);
}

.save-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 1rem;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.save-button:hover {
  background: #45a049;
}

.save-button:active {
  transform: translateY(1px);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style> 