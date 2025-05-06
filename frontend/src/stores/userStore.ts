import { defineStore } from 'pinia'
import { ref, computed, onMounted } from 'vue'
import { getUser } from '../api/api'
import type { User } from '../../../shared/models/User'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)
  const isLoadingAuth = ref(true)

  async function setUser(newUser: User | null) {
    if (newUser) {
      // Load profile data if user exists
      user.value = newUser
      localStorage.setItem('user', JSON.stringify(user.value))
    } else {
      user.value = null
      localStorage.removeItem('user')
    }
  }

  async function loadUserFromStorage() {
    isLoadingAuth.value = true
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        // Reload profile data
        const user = await getUser(parsedUser.id)
        if (user) {
          setUser(user)
        } else {
          setUser(null)
        }
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    } finally {
      isLoadingAuth.value = false
    }
  }

  return {
    user,
    isLoggedIn,
    isLoadingAuth,
    setUser,
    loadUserFromStorage
  }
}) 