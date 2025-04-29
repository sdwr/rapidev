import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUser } from '../api/api'
import type { User } from '../../../shared/models/User'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => user.value !== null)

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
  }

  return {
    user,
    isLoggedIn,
    setUser,
    loadUserFromStorage
  }
}) 