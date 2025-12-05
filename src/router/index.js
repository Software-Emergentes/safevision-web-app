import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ReportsView from '@/views/ReportsView.vue'
import DriverDetailView from '@/views/DriverDetailView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login' // ✅ CAMBIO: Redirigir a login por defecto
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false } // ✅ No requiere autenticación
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true } // ✅ NUEVO: Requiere autenticación
  },
  {
    path: '/reports',
    name: 'reports',
    component: ReportsView,
    meta: { requiresAuth: true } // ✅ NUEVO: Requiere autenticación
  },
  {
    path: '/driver/:id',
    name: 'driver-detail',
    component: DriverDetailView,
    meta: { requiresAuth: true } // ✅ NUEVO: Requiere autenticación
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login' // ✅ Rutas no encontradas van a login
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ========================================
// 🔒 GUARD DE AUTENTICACIÓN (NUEVO)
// ========================================

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = !!localStorage.getItem('authToken')

  console.log('🔐 Navigation Guard:', {
    to: to.path,
    requiresAuth,
    isAuthenticated
  })

  // Si intenta ir a raíz "/" y está autenticado, mandarlo a dashboard
  if (to.path === '/' && isAuthenticated) {
    console.log('✅ Usuario autenticado en raíz, redirigiendo a dashboard')
    next('/dashboard')
    return
  }

  // Si intenta ir a raíz "/" y NO está autenticado, mandarlo a login
  if (to.path === '/' && !isAuthenticated) {
    console.log('❌ Usuario no autenticado en raíz, redirigiendo a login')
    next('/login')
    return
  }

  if (requiresAuth && !isAuthenticated) {
    console.log('❌ No autenticado. Redirigiendo a /login')
    next('/login')
  } else if (to.path === '/login' && isAuthenticated) {
    console.log('✅ Ya autenticado. Redirigiendo a /dashboard')
    next('/dashboard')
  } else {
    console.log('✅ Navegación permitida')
    next()
  }
})

export default router
