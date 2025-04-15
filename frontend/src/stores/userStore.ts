import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getProfileByUserId } from '../api/api'

interface User {
  id: string
  username: string
  userType: 'client' | 'courier' | 'admin'
  profile?: {
    id: string
    name: string
    email: string
    phone: string
    address: string
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  async function setUser(newUser: User | null) {
    if (newUser) {
      // Load profile data if user exists
      const response = await getProfileByUserId(newUser.id)
      user.value = {
        ...newUser,
        profile: response?.profile || null
      }
      localStorage.setItem('user', JSON.stringify(user.value))
    } else {
      user.value = null
      localStorage.removeItem('user')
    }
  }

  async function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      // Reload profile data
      const response = await getProfileByUserId(parsedUser.id)
      user.value = {
        ...parsedUser,
        profile: response?.profile || null
      }
    }
  }

  return {
    user,
    isLoggedIn,
    setUser,
    loadUserFromStorage
  }
}) 