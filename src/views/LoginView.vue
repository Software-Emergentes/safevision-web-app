<template>
  <div class="flex min-h-screen font-sans">
    <!-- Left Panel -->
    <div class="flex-1 bg-gradient-to-br from-primary to-primary-dark text-white p-[60px] flex flex-col justify-between">
      <div class="mb-20">
        <div class="mb-6">
          <div class="w-16 h-16 bg-white/15 rounded-2xl flex items-center justify-center backdrop-blur-[10px]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>

        <h1 class="text-[42px] font-bold mb-2 tracking-tight">SafeVision</h1>
        <p class="text-lg font-normal opacity-90 text-white/85">Panel de Gestión de Flota</p>
      </div>

      <div class="flex flex-col gap-8">
        <div v-for="feature in features" :key="feature.title" class="flex gap-5 items-start">
          <div :class="['w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/15', feature.iconClass]">
            <span v-html="feature.icon"></span>
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold mb-1.5 text-white">{{ feature.title }}</h3>
            <p class="text-sm leading-relaxed opacity-85 text-white/80">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="flex-1 bg-white flex items-center justify-center p-10">
      <div class="w-full max-w-[440px]">
        <div class="mb-10">
          <h2 class="text-[32px] font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
          <p class="text-base text-gray-500 font-normal">Accede al panel de gestión</p>
        </div>

        <form @submit.prevent="handleLogin" class="flex flex-col gap-6">
          <div class="flex flex-col gap-2">
            <label for="email" class="text-sm font-medium text-gray-900">Correo Electrónico</label>
            <input
              id="email"
              v-model="loginData.email"
              type="email"
              class="w-full py-3.5 px-4 border-[1.5px] border-gray-300 rounded-lg text-[15px] text-gray-900 bg-white transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(193,53,21,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-gray-400"
              placeholder="gerente@empresa.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="text-sm font-medium text-gray-900">Contraseña</label>
            <div class="relative flex items-center">
              <input
                id="password"
                v-model="loginData.password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full pr-12 py-3.5 px-4 border-[1.5px] border-gray-300 rounded-lg text-[15px] text-gray-900 bg-white transition-all duration-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(193,53,21,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 placeholder:text-gray-400"
                placeholder="••••••••"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="absolute right-3 bg-transparent border-none cursor-pointer p-2 flex items-center justify-center text-gray-500 transition-all duration-300 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                :disabled="isLoading"
              >
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="flex justify-between items-center -mt-2">
            <label class="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
              <input
                v-model="loginData.rememberMe"
                type="checkbox"
                class="w-[18px] h-[18px] cursor-pointer accent-primary disabled:cursor-not-allowed"
                :disabled="isLoading"
              />
              <span>Recordarme</span>
            </label>
            <a href="#" class="text-sm text-primary no-underline font-medium transition-all duration-300 hover:underline">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            class="w-full py-4 bg-primary text-white border border-black/8 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset] rounded-lg text-base font-semibold cursor-pointer transition-all duration-300 mt-2 hover:bg-primary-dark hover:border-black/[0.18] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(167,46,18,0.18)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(167,46,18,0.12)] focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(193,53,21,0.12)] disabled:bg-gray-300 disabled:border-black/[0.06] disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none disabled:text-gray-500"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Ingresar al Dashboard</span>
            <span v-else class="flex items-center justify-center gap-2.5">
              <span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Ingresando...
            </span>
          </button>

          <div v-if="errorMessage" class="py-3 px-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {{ errorMessage }}
          </div>
        </form>

        <div class="mt-8 text-center text-sm text-gray-500">
          <p>¿No tienes cuenta? <a href="#" class="text-primary no-underline font-medium transition-all duration-300 hover:underline">Contáctanos</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const loginData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const features = [
  {
    title: 'Monitoreo en Tiempo Real',
    description: 'Supervisa el estado de todos tus conductores simultáneamente',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
    iconClass: 'bg-white/15'
  },
  {
    title: 'Alertas Inteligentes',
    description: 'Recibe notificaciones críticas al instante',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    iconClass: 'bg-white/15'
  },
  {
    title: 'Reportes Detallados',
    description: 'Analiza métricas y patrones de conducción',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',
    iconClass: 'bg-white/15'
  }
]

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  errorMessage.value = ''

  if (!loginData.value.email || !loginData.value.password) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const mockUser = {
      id: 1,
      name: 'Usuario Administrador',
      email: loginData.value.email,
      role: 'Manager'
    }

    const mockToken = 'mock-jwt-token-' + Date.now()

    authStore.login(mockUser, mockToken)

    console.log('✅ Login exitoso (MOCK):', mockUser)

    router.push({ name: 'dashboard' })

  } catch (error) {
    errorMessage.value = 'Error al iniciar sesión. Por favor intenta de nuevo.'
    console.error('Error en login:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
@media (max-width: 1024px) {
  .flex-1:first-child {
    padding: 40px;
  }

  h1 {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .flex {
    flex-direction: column;
  }

  .flex-1:first-child {
    padding: 32px 24px;
    min-height: auto;
  }

  .flex-1:first-child > div:nth-child(1) {
    margin-bottom: 40px;
  }

  .flex-1:first-child > div:nth-child(2) {
    display: none;
  }

  .flex-1:last-child {
    padding: 32px 24px;
  }

  h2 {
    font-size: 28px;
  }
}
</style>
