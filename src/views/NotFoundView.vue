<template>
  <div class="not-found-view">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Página no encontrada</h2>
      <p class="error-message">La página que buscas no existe o ha sido movida</p>
      <button @click="goToHome" class="home-button">
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

<style scoped>
.not-found-view {
  min-height: 100vh;
  background: #F5F7FA;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  font-family: 'Poppins', sans-serif;
}

.not-found-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.error-code {
  font-size: 120px;
  font-weight: 700;
  color: #C13515;
  margin: 0;
  line-height: 1;
}

.error-title {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin: 0;
}

.error-message {
  font-size: 16px;
  color: #74788D;
  margin: 0 0 20px 0;
}

.home-button {
  padding: 12px 24px;
  background: #C13515;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
}

.home-button:hover {
  background: #A72E12;
  transform: translateY(-2px);
}
</style>
