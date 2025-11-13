import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const isAuthenticated = computed(() => !!token.value)

  const login = (userData, authToken) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('authToken', authToken)
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
  }

  const setUser = (userData) => {
    user.value = userData
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    setUser
  }
})
