<template>
  <div class="login-container">
    <div class="left-panel">
      <div class="brand-section">
        <div class="logo-container">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </div>
        </div>

        <h1 class="brand-title">SafeVision</h1>
        <p class="brand-subtitle">Panel de Gestión de Flota</p>
      </div>

      <div class="features-section">
        <div class="feature-item">
          <div class="feature-icon chart-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Monitoreo en Tiempo Real</h3>
            <p class="feature-description">Supervisa el estado de todos tus conductores simultáneamente</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon bell-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Alertas Inteligentes</h3>
            <p class="feature-description">Recibe notificaciones críticas al instante</p>
          </div>
        </div>

        <div class="feature-item">
          <div class="feature-icon report-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="feature-content">
            <h3 class="feature-title">Reportes Detallados</h3>
            <p class="feature-description">Analiza métricas y patrones de conducción</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lado derecho: Formulario de login -->
    <div class="right-panel">
      <div class="login-form-container">
        <div class="form-header">
          <h2 class="form-title">Iniciar Sesión</h2>
          <p class="form-subtitle">Accede al panel de gestión</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email" class="form-label">Correo Electrónico</label>
            <input
              id="email"
              v-model="loginData.email"
              type="email"
              class="form-input"
              placeholder="gerente@empresa.com"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="loginData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="••••••••"
                required
                :disabled="isLoading"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
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

          <div class="form-options">
            <label class="checkbox-label">
              <input
                v-model="loginData.rememberMe"
                type="checkbox"
                class="checkbox-input"
                :disabled="isLoading"
              />
              <span>Recordarme</span>
            </label>
            <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
          </div>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Ingresar al Dashboard</span>
            <span v-else class="loading-text">
              <span class="spinner"></span>
              Ingresando...
            </span>
          </button>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
        </form>

        <div class="form-footer">
          <p>¿No tienes cuenta? <a href="#" class="contact-link">Contáctanos</a></p>
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

// Estado reactivo del formulario
const loginData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  errorMessage.value = ''

  // Validación básica
  if (!loginData.value.email || !loginData.value.password) {
    errorMessage.value = 'Por favor completa todos los campos'
    return
  }

  isLoading.value = true

  await new Promise(resolve => setTimeout(resolve, 1000))

  try {
    // CREDENCIALES MOCK - Acepta cualquier email/password
    const mockUser = {
      id: 1,
      name: 'Usuario Administrador',
      email: loginData.value.email,
      role: 'Manager'
    }

    const mockToken = 'mock-jwt-token-' + Date.now()

    // Guardar en el store
    authStore.login(mockUser, mockToken)

    console.log('✅ Login exitoso (MOCK):', mockUser)

    // Redirigir al dashboard
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
/* Variables CSS basadas en tu design system */
:root {
  --primary-red: #C13515;
  --dark-red: #5A0000;
  --text-primary: #222222;
  --text-secondary: #74788D;
  --text-light: #757575;
  --white: #FFFFFF;
  --gray-100: #F8F9FA;
  --gray-200: #E9ECEF;
  --gray-300: #DEE2E6;
  --border-radius: 12px;
  --transition: all 0.3s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-container {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* ===== PANEL IZQUIERDO ===== */
.left-panel {
  flex: 1;
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: var(--white);
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-section {
  margin-bottom: 80px;
}

.logo-container {
  margin-bottom: 24px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon svg {
  color: var(--white);
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.brand-subtitle {
  font-size: 18px;
  font-weight: 400;
  opacity: 0.9;
  color: rgba(255, 255, 255, 0.85);
}

.features-section {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.feature-item {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chart-icon {
  background: rgba(255, 255, 255, 0.15);
}

.bell-icon {
  background: rgba(255, 255, 255, 0.15);
}

.report-icon {
  background: rgba(255, 255, 255, 0.15);
}

.feature-icon svg {
  color: var(--white);
}

.feature-content {
  flex: 1;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--white);
}

.feature-description {
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.85;
  color: rgba(255, 255, 255, 0.8);
}

/* ===== PANEL DERECHO ===== */
.right-panel {
  flex: 1;
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.login-form-container {
  width: 100%;
  max-width: 440px;
}

.form-header {
  margin-bottom: 40px;
}

.form-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 400;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--gray-300);
  border-radius: 8px;
  font-size: 15px;
  font-family: inherit;
  color: var(--text-primary);
  background: var(--white);
  transition: var(--transition);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-red);
  box-shadow: 0 0 0 3px rgba(193, 53, 21, 0.1);
}

.form-input:disabled {
  background: var(--gray-100);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-input::placeholder {
  color: #ADB5BD;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-input {
  padding-right: 48px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: var(--transition);
}

.password-toggle:hover {
  color: var(--primary-red);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-light);
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary-red);
}

.checkbox-input:disabled {
  cursor: not-allowed;
}

.forgot-password {
  font-size: 14px;
  color: var(--primary-red);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 16px;
  background: var(--primary-red);
  color: var(--white);
  border: 1px solid rgba(0, 0, 0, 0.08); /* borde visible por defecto */
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.06) inset; /* ligera luz interna */
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: var(--transition), border-color 0.2s ease, box-shadow 0.2s ease;
  margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
  background: #A72E12;
  border-color: rgba(0, 0, 0, 0.18); /* borde más marcado en hover */
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(167, 46, 18, 0.18); /* sombra externa visible */
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(167, 46, 18, 0.12);
}

.submit-button:focus {
  outline: none;
  border-color: rgba(193, 53, 21, 0.6);
  box-shadow: 0 0 0 4px rgba(193, 53, 21, 0.12); /* halo para accesibilidad */
}

.submit-button:disabled {
  background: #E0E0E0;
  border-color: rgba(0, 0, 0, 0.06);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  color: #9A9A9A;
}


.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-message {
  padding: 12px 16px;
  background: #FEE;
  border: 1px solid #FCC;
  border-radius: 8px;
  color: #C00;
  font-size: 14px;
  text-align: center;
}

.form-footer {
  margin-top: 32px;
  text-align: center;
  font-size: 14px;
  color: var(--text-light);
}

.contact-link {
  color: var(--primary-red);
  text-decoration: none;
  font-weight: 500;
  transition: var(--transition);
}

.contact-link:hover {
  text-decoration: underline;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .left-panel {
    padding: 40px;
  }

  .brand-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .left-panel {
    padding: 32px 24px;
    min-height: auto;
  }

  .brand-section {
    margin-bottom: 40px;
  }

  .features-section {
    display: none;
  }

  .right-panel {
    padding: 32px 24px;
  }

  .form-title {
    font-size: 28px;
  }
}
</style>
