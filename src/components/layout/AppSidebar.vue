<template>
  <aside class="w-[280px] bg-white border-r border-gray-200 flex flex-col fixed h-screen left-0 top-0 z-[100]">
    <!-- Header -->
    <div class="p-8 border-b border-gray-200">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-[10px] flex items-center justify-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">SafeVision</h1>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-6 flex flex-col gap-2 overflow-y-auto">
      <button
        v-for="item in navigationItems"
        :key="item.path"
        @click="navigateTo(item.path)"
        :class="[
          'flex items-center gap-3 px-4 py-3 rounded-lg text-[15px] font-medium transition-all duration-300 cursor-pointer border-none bg-transparent w-full text-left',
          isActiveRoute(item.path)
            ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        ]"
      >
        <span class="flex items-center justify-center" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
      </button>
    </nav>

    <!-- Footer -->
    <div class="p-5 border-t border-gray-200">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-semibold text-base">
          {{ userInitials }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold text-gray-900 mb-0.5 truncate">
            {{ authStore.user?.name || 'Usuario' }}
          </p>
          <p class="text-xs text-gray-500 m-0">Gerente de Flota</p>
        </div>
      </div>
      <button
        @click="handleLogout"
        class="w-full py-2.5 px-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 hover:bg-red-50 hover:border-primary hover:text-primary"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Cerrar Sesión
      </button>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
  },
  {
    path: '/reports',
    label: 'Reportes',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
  }
]

const userInitials = computed(() => {
  const name = authStore.user?.name || 'U'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : name.substring(0, 2).toUpperCase()
})

const isActiveRoute = (path) => {
  return route.path.startsWith(path)
}

const navigateTo = (path) => {
  router.push(path).catch(err => console.error('Error al navegar:', err))
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
@media (max-width: 768px) {
  aside {
    transform: translateX(-100%);
  }
}
</style>
