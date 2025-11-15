<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-10 font-sans">
    <div class="text-center flex flex-col items-center gap-4">
      <h1 class="text-[120px] font-bold text-primary m-0 leading-none">404</h1>
      <h2 class="text-[32px] font-bold text-gray-900 m-0">Página no encontrada</h2>
      <p class="text-base text-gray-500 m-0 mb-5">La página que buscas no existe o ha sido movida</p>
      <button
        @click="goToHome"
        class="py-3 px-6 bg-primary text-white border-none rounded-lg cursor-pointer font-semibold text-[15px] transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5"
      >
        ← Volver al inicio
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goToHome = () => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'dashboard' })
  } else {
    router.push({ name: 'login' })
  }
}
</script>
