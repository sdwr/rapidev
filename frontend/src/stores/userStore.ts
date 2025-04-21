import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  userType: 'CLIENT' | 'COURIER' | 'ADMIN'
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
      user.value = parsedUser
    }
  }

  return {
    user,
    isLoggedIn,
    setUser,
    loadUserFromStorage
  }
}) 