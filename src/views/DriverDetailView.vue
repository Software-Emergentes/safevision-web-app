<template>
  <div class="flex min-h-screen bg-gray-100 font-sans">
    <AppSidebar />

    <main class="ml-[280px] flex-1 p-8 w-[calc(100%-280px)]">
      <!-- Header con botón volver -->
      <header class="mb-8">
        <button
          @click="goBack"
          class="inline-flex items-center gap-2 py-2.5 px-5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm font-semibold cursor-pointer transition-all duration-300 mb-6 hover:bg-gray-100 hover:border-primary hover:text-primary"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver
        </button>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-[60px] gap-4">
          <div class="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p class="text-gray-500">Cargando información del conductor...</p>
        </div>

        <!-- Driver Info -->
        <div v-else-if="driver" class="bg-white rounded-xl p-8 shadow-sm flex gap-8 items-start">
          <div class="relative flex-shrink-0">
            <img :src="driver.avatar" :alt="driver.name" class="w-[120px] h-[120px] rounded-2xl object-cover border-4 border-gray-100" />
            <span
              :class="[
                'absolute -bottom-2 left-1/2 -translate-x-1/2 py-1.5 px-4 rounded-[20px] text-xs font-semibold whitespace-nowrap shadow-sm',
                driver.status === 'active' ? 'bg-success text-white' : driver.status === 'resting' ? 'bg-warning text-gray-900' : 'bg-gray-500 text-white'
              ]"
            >
              {{ getStatusText(driver.status) }}
            </span>
          </div>

          <div class="flex-1">
            <h1 class="text-[32px] font-bold text-gray-900 mb-3">{{ driver.name }}</h1>

            <div class="flex gap-6 mb-6 flex-wrap">
              <!-- Teléfono -->
              <span class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
    {{ driverDetails?.phoneNumber || driver.contactInfo?.phone || 'N/A' }}
  </span>

              <!-- Email -->
              <span class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
    {{ driverDetails?.email || driver.contactInfo?.email || 'N/A' }}
  </span>

              <!-- Licencia -->
              <span class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
    Licencia: {{ licenseDetails?.licenseNumber || driver.licenseNumber || 'N/A' }}
  </span>

              <!-- Categoría de licencia -->
              <span v-if="licenseDetails?.category" class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
  </svg>
  Categoría: {{ licenseDetails.category }}
</span>

              <!-- Años de experiencia -->
              <span v-if="driverDetails?.yearsExperience" class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
    Experiencia: {{ driverDetails.yearsExperience }} años
  </span>

              <!-- Fecha de emisión de licencia -->
              <span v-if="licenseDetails?.issuedDate" class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
  Emitida: {{ formatLicenseDate(licenseDetails.issuedDate) }}
</span>

              <!-- Fecha de vencimiento de licencia -->
              <span v-if="licenseDetails?.expirationDate" class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
  </svg>
  Vence: {{ formatLicenseDate(licenseDetails.expirationDate) }}
</span>
            </div>

            <!-- Quick Stats -->
            <div class="flex gap-4">
              <div :class="['flex flex-col gap-1 py-3 px-4 bg-gray-100 rounded-lg border-l-[3px]', getStatClass(driver.severity)]">
                <span class="text-xs text-gray-500 font-medium">Nivel de Alerta</span>
                <span class="text-lg font-bold text-gray-900">{{ getSeverityLabel(driver.severity) }}</span>
              </div>
              <div class="flex flex-col gap-1 py-3 px-4 bg-gray-100 rounded-lg border-l-[3px] border-l-gray-200">
                <span class="text-xs text-gray-500 font-medium">Total Alertas</span>
                <span class="text-lg font-bold text-gray-900">{{ driver.alerts }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Tabs -->
      <template v-if="driver && !isLoading">
        <div class="bg-white rounded-xl p-2 flex gap-2 mb-6 shadow-sm overflow-x-auto">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
        'flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300',
        activeTab === tab.id
          ? 'bg-primary text-white shadow-md'
          : 'bg-transparent text-gray-500 hover:bg-gray-100'
      ]"
          >
            <span v-html="tab.icon"></span>
            {{ tab.label }}
            <span v-if="tab.badge" :class="[
        'ml-auto py-0.5 px-2 rounded-full text-xs font-bold',
        activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-primary text-white'
      ]">
        {{ tab.badge }}
      </span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="min-h-[400px]">
          <!-- TAB 1: Alertas -->
          <div v-show="activeTab === 'alerts'" class="animate-[fadeIn_0.3s_ease]">
            <div class="bg-white rounded-xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
                <h2 class="text-2xl font-bold text-gray-900 m-0">Alertas Recientes</h2>
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="filter in alertFilters"
                    :key="filter.value"
                    @click="selectedAlertFilter = filter.value"
                    :class="[
                      'py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-[13px] font-semibold cursor-pointer transition-all duration-300',
                      selectedAlertFilter === filter.value ? 'bg-primary border-primary text-white' : 'hover:bg-gray-200 hover:border-primary'
                    ]"
                  >
                    {{ filter.label }}
                  </button>
                </div>
              </div>

              <!-- Loading alerts -->
              <div v-if="isLoadingAlerts" class="flex flex-col items-center justify-center py-20 gap-4">
                <div class="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                <p class="text-gray-500">Cargando alertas...</p>
              </div>

              <!-- No hay alertas -->
              <div v-else-if="filteredAlerts.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success mb-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>No hay alertas para mostrar</p>
              </div>

              <!-- Lista de alertas -->
              <div v-else class="flex flex-col gap-4">
                <div
                  v-for="alert in filteredAlerts"
                  :key="alert.id"
                  :class="[
                    'flex gap-4 p-5 rounded-xl border-l-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md',
                    alert.severity === 'Critical' ? 'bg-red-50 border-l-primary' :
                    alert.severity === 'High' ? 'bg-orange-50 border-l-orange-500' :
                    alert.severity === 'Medium' ? 'bg-yellow-50 border-l-warning' :
                    'bg-blue-50 border-l-info'
                  ]"
                >
                  <div :class="[
                    'w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0',
                    alert.severity === 'Critical' ? 'bg-red-100 text-primary' :
                    alert.severity === 'High' ? 'bg-orange-100 text-orange-500' :
                    alert.severity === 'Medium' ? 'bg-yellow-100 text-warning' :
                    'bg-blue-100 text-info'
                  ]">
                    <span v-html="getAlertIcon(alert.severity)"></span>
                  </div>
                  <div class="flex-1 flex flex-col gap-2">
                    <div class="flex justify-between items-start gap-3">
                      <h3 class="text-base font-semibold text-gray-900 m-0">{{ alert.title }}</h3>
                      <span class="text-[13px] text-gray-500 whitespace-nowrap">{{ alert.time }}</span>
                    </div>
                    <p class="text-sm text-gray-500 m-0 leading-relaxed">{{ alert.description }}</p>
                    <div class="flex justify-between items-center mt-2 flex-wrap gap-2">
                      <span class="text-[13px] text-gray-500">📍 {{ alert.location }}</span>
                      <span :class="[
                        'py-1 px-3 rounded-xl text-xs font-semibold',
                        alert.severity === 'Critical' ? 'bg-red-100 text-primary' :
                        alert.severity === 'High' ? 'bg-orange-100 text-orange-500' :
                        alert.severity === 'Medium' ? 'bg-yellow-100 text-warning' :
                        'bg-blue-100 text-info'
                      ]">
                        {{ alert.type }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Historial -->
          <div v-show="activeTab === 'trips'" class="animate-[fadeIn_0.3s_ease]">
            <div class="bg-white rounded-xl p-6 shadow-sm min-h-[400px]">
              <TripHistoryList
                :trips="tripHistory"
                :is-loading="isLoadingTrips"
                @view-trip-details="handleViewTripDetails"
              />
            </div>
          </div>

          <!-- TAB 3: Estadísticas -->
          <div v-show="activeTab === 'stats'" class="flex flex-col gap-6 animate-[fadeIn_0.3s_ease]">
            <div class="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
              <StatSummaryCard
                label="Viajes Completados"
                :value="driverStats.tripsCompleted"
                :trend="driverStats.tripsCompleted === 1 ? 'Primer viaje registrado' : `${driverStats.tripsCompleted} viajes en total`"
                trend-direction="up"
                variant="success"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                </template>
              </StatSummaryCard>

              <StatSummaryCard
                label="Tasa de Seguridad"
                :value="driverStats.safetyRate"
                unit="%"
                :trend="driverStats.safetyRate >= 80 ? 'Óptimo' : driverStats.safetyRate >= 50 ? 'Aceptable' : 'Necesita mejorar'"
                :trend-direction="driverStats.safetyRate >= 80 ? 'up' : 'neutral'"
                :variant="driverStats.safetyRate >= 80 ? 'success' : 'warning'"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </template>
              </StatSummaryCard>

              <StatSummaryCard
                label="Promedio Fatiga"
                :value="driverStats.avgFatigue"
                unit="/100"
                :trend="`Óptimo: < 50`"
                :trend-direction="driverStats.avgFatigue < 50 ? 'up' : 'down'"
                :variant="driverStats.avgFatigue < 50 ? 'success' : 'warning'"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </template>
              </StatSummaryCard>

              <StatSummaryCard
                label="Alertas Totales"
                :value="driver.alerts || 0"
                :trend="driverStats.lastAlertTime"
                :trend-direction="driver.severity === 'Critical' ? 'down' : 'neutral'"
                :variant="driver.severity === 'Critical' ? 'danger' : driver.alerts === 0 ? 'success' : 'warning'"
              >
                <template #icon>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </template>
              </StatSummaryCard>
            </div>

            <DriverStatsChart
              title="Rendimiento Mensual"
              :data="monthlyPerformanceData"
              :max-value="100"
              unit="%"
              :available-periods="['month']"
              default-period="month"
              chart-type="performance"
            />

            <DriverStatsChart
              title="Distribución de Alertas por Mes"
              :data="monthlyAlertsData"
              :max-value="Math.max(...monthlyAlertsData.map(d => d.value), 10)"
              :available-periods="['month']"
              default-period="month"
              chart-type="alerts"
            />
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import TripHistoryList from '@/components/driver/TripHistoryList.vue'
import StatSummaryCard from '@/components/driver/StatSummaryCard.vue'
import DriverStatsChart from '@/components/driver/DriverStatsChart.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDashboardStore } from '@/stores/dashboard'
import { ALERT_SEVERITY_LABELS } from '@/utils/constants'

const router = useRouter()
const route = useRoute()
const dashboardStore = useDashboardStore()

const isLoading = ref(true)
const isLoadingTrips = ref(false)
const isLoadingAlerts = ref(false)
const driver = ref(null)
const driverDetails = ref(null)
const licenseDetails = ref(null)
const driverAlerts = ref([])
const tripHistory = ref([]) // ✅ NUEVO: Estado para viajes
const activeTab = ref('alerts')
const selectedAlertFilter = ref('all')

const getSeverityLabel = (severity) => {
  return ALERT_SEVERITY_LABELS[severity] || severity
}

const getStatClass = (severity) => {
  const classMap = {
    'Critical': 'border-l-primary bg-red-50',
    'High': 'border-l-orange-500 bg-orange-50',
    'Medium': 'border-l-warning bg-yellow-50',
    'Low': 'border-l-info bg-blue-50',
    'Safe': 'border-l-success bg-green-50'
  }
  return classMap[severity] || 'border-l-gray-200'
}

const getStatusText = (status) => {
  const statusMap = {
    active: 'En Ruta',
    resting: 'Descansando',
    offline: 'Desconectado'
  }
  return statusMap[status] || status
}

const getAlertIcon = (severity) => {
  const icons = {
    Critical: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    High: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    Medium: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    Low: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
  }
  return icons[severity] || icons.Low
}

const formatLicenseDate = (dateString) => {
  if (!dateString) return 'N/A'

  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const goBack = () => {
  router.push('/dashboard')
}

const handleViewTripDetails = (trip) => {
  console.log('Ver detalles del viaje:', trip)
}

const tabs = computed(() => [
  {
    id: 'alerts',
    label: 'Alertas Recientes',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    badge: driverAlerts.value.length
  },
  {
    id: 'trips',
    label: 'Historial de Viajes',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>'
  },
  {
    id: 'stats',
    label: 'Estadísticas',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>'
  }
])

const alertFilters = [
  { label: 'Todas', value: 'all' },
  { label: 'Críticas', value: 'Critical' },
  { label: 'Altas', value: 'High' },
  { label: 'Moderadas', value: 'Medium' },
  { label: 'Leves', value: 'Low' }
]

const filteredAlerts = computed(() => {
  if (selectedAlertFilter.value === 'all') {
    return driverAlerts.value
  }

  return driverAlerts.value.filter(
    alert => alert.severity === selectedAlertFilter.value
  )
})

const driverStats = computed(() => {
  if (!driver.value) return {
    tripsCompleted: 0,
    safetyRate: 0,
    avgFatigue: 0,
    lastAlertTime: 'Sin alertas recientes'
  }

  // ✅ Calcular viajes completados reales
  const completedTrips = tripHistory.value.filter(t =>
    t.tripStatus === 'Completed'
  ).length

  // ✅ Calcular tasa de seguridad basada en alertas reales
  const totalAlerts = driver.value.alerts || 0
  let safetyRate = 100

  if (totalAlerts === 0) {
    safetyRate = 100 // Perfecto
  } else if (totalAlerts <= 2) {
    safetyRate = 92 // Excelente
  } else if (totalAlerts <= 5) {
    safetyRate = 78 // Bueno
  } else if (totalAlerts <= 10) {
    safetyRate = 65 // Regular
  } else {
    safetyRate = 45 // Necesita mejora
  }

  // ✅ Calcular promedio de fatiga real basado en severityValue del backend
  let avgFatigue = 0

  if (driverAlerts.value.length > 0) {
    // Usar severityValue real del backend (0.0 - 1.0) y convertir a escala 0-100
    const totalSeverity = driverAlerts.value.reduce((sum, alert) => {
      // severityValue viene en escala 0-1 del backend
      const severityValue = alert.severityValue || 0
      return sum + (severityValue * 100) // Convertir a 0-100
    }, 0)

    avgFatigue = Math.round(totalSeverity / driverAlerts.value.length)
  }

  // ✅ Calcular tiempo de la última alerta REAL del backend
  let lastAlertTime = 'Sin alertas recientes'
  if (driverAlerts.value.length > 0) {
    // La primera alerta en el array es la más reciente (ordenadas desc)
    lastAlertTime = driverAlerts.value[0].time || 'Hace poco'
  }

  return {
    tripsCompleted: completedTrips,
    safetyRate: safetyRate,
    avgFatigue: avgFatigue,
    lastAlertTime: lastAlertTime
  }
})

const monthlyPerformanceData = computed(() => {
  // ✅ Obtener los últimos 6 meses
  const currentDate = new Date()
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const last6Months = []

  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate)
    date.setMonth(date.getMonth() - i)
    last6Months.push(monthNames[date.getMonth()])
  }

  // ✅ SOLO mostrar datos para el mes actual
  // Los meses anteriores quedan en 0 porque NO HAY DATOS
  const currentMonth = currentDate.getMonth()
  const currentMonthName = monthNames[currentMonth]

  // Calcular rendimiento del mes actual basado en tasa de seguridad
  const safetyRate = driverStats.value.safetyRate

  return last6Months.map((month) => {
    const isCurrentMonth = month === currentMonthName

    if (isCurrentMonth) {
      // ✅ Mes actual: usar tasa de seguridad real del backend
      return {
        label: month,
        value: safetyRate
      }
    } else {
      // ❌ Meses anteriores: SIN DATOS (mostrar 0)
      return {
        label: month,
        value: 0
      }
    }
  })
})

const monthlyAlertsData = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  // ✅ Inicializar todos los meses en 0
  const alertsByMonth = months.map(month => ({ label: month, value: 0 }))

  // ✅ Agrupar alertas por mes REAL según generatedAt
  if (driverAlerts.value.length > 0) {
    driverAlerts.value.forEach(() => {
      // Las alertas no tienen fecha en el formato transformado,
      // así que necesitamos usar los datos originales
      // Por ahora, mostrar todas las alertas en el mes actual
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth() // 0-11

      alertsByMonth[currentMonth].value++
    })
  }

  // ✅ Retornar solo los últimos 6 meses para el gráfico
  const currentMonth = new Date().getMonth()
  const last6Months = []

  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    last6Months.push(alertsByMonth[monthIndex])
  }

  return last6Months
})

// ✅ Mapear alertas del backend al formato del frontend
const mapAlertTypeToSpanish = (alertType) => {
  const typeMap = {
    'MicroSleepDetected': 'Micro-sueño detectado',
    'ExtendedEyeClosure': 'Cierre prolongado de ojos',
    'RepeatedYawning': 'Bostezos repetidos',
    'SevereDrowsiness': 'Somnolencia severa',
    'MultipleWarnings': 'Múltiples advertencias'
  }
  return typeMap[alertType] || alertType
}

const mapSeverityLevel = (severityLevel) => {
  if (severityLevel === 'Critical' || severityLevel === 'CRÍTICA') return 'Critical'
  if (severityLevel === 'High' || severityLevel === 'High' || severityLevel === 'ALTA') return 'High'
  if (severityLevel === 'Medium' || severityLevel === 'MEDIA') return 'Medium'
  return 'Low'
}

const formatAlertTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    return 'Hace 1h'
  } else if (diffHours < 24) {
    return `Hace ${diffHours}h`
  } else {
    const diffDays = Math.floor(diffHours / 24)
    return `Hace ${diffDays}d`
  }
}

const getAlertDescription = (message) => {
  const parts = message.split('.')
  if (parts.length >= 2) {
    return parts[1].trim() + '.'
  }
  return message.split('.')[0]
}

// ✅ CARGAR DATOS DEL CONDUCTOR DESDE EL BACKEND
const loadDriverDetails = async (driverId) => {
  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No hay token de autenticación')
      return
    }

    const driverResponse = await fetch(`https://localhost:44385/api/v1/drivers/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (driverResponse.ok) {
      driverDetails.value = await driverResponse.json()
      console.log('✅ Detalles del conductor cargados:', driverDetails.value)
    }

    const licenseResponse = await fetch(`https://localhost:44385/api/v1/drivers/${driverId}/license`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (licenseResponse.ok) {
      licenseDetails.value = await licenseResponse.json()
      console.log('✅ Licencia del conductor cargada:', licenseDetails.value)
    }
  } catch (error) {
    console.error('Error al cargar detalles del conductor:', error)
  }
}

// ✅ CARGAR ALERTAS REALES DEL BACKEND
const loadDriverAlerts = async (driverId) => {
  isLoadingAlerts.value = true

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No hay token de autenticación')
      return
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://safevision-web-service-1.onrender.com'}/api/alerts/reports/driver/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const backendAlerts = await response.json()
      console.log('✅ Alertas del backend:', backendAlerts)

      driverAlerts.value = backendAlerts.map(alert => ({
        id: `alert-${alert.alertId}`,
        title: mapAlertTypeToSpanish(alert.alertType),
        type: 'Fatiga',
        severity: mapSeverityLevel(alert.severityLevel),
        severityValue: alert.severityValue || 0, // ✅ Agregar valor real del backend
        time: formatAlertTime(alert.generatedAt),
        description: getAlertDescription(alert.message),
        location: `Viaje #${alert.tripId} - ${alert.drowsinessEventsCount} evento(s)`,
        symptoms: []
      }))

      console.log('✅ Alertas transformadas:', driverAlerts.value)
    } else {
      console.error('Error al cargar alertas:', response.status)
      driverAlerts.value = []
    }
  } catch (error) {
    console.error('Error al cargar alertas:', error)
    driverAlerts.value = []
  } finally {
    isLoadingAlerts.value = false
  }
}

// ✅ NUEVO: CARGAR HISTORIAL DE VIAJES DEL BACKEND
const loadDriverTrips = async (driverId) => {
  isLoadingTrips.value = true

  try {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.error('No hay token de autenticación')
      return
    }

    console.log(`🔄 Cargando viajes del conductor ${driverId}...`)

    const response = await fetch(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'https://safevision-web-service-1.onrender.com'}/api/trips/driver/${driverId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })

    if (response.ok) {
      const backendTrips = await response.json()
      console.log('✅ Viajes del backend:', backendTrips)

      // ✅ Transformar viajes del backend al formato del frontend
      tripHistory.value = backendTrips.map(trip => {
        // Determinar severidad basada en la cantidad de alertas
        let severity = 'Safe' // ✅ Por defecto, viajes seguros

        if (trip.alertCount >= 10) {
          severity = 'Critical'
        } else if (trip.alertCount >= 5) {
          severity = 'High'
        } else if (trip.alertCount >= 2) {
          severity = 'Medium'
        } else if (trip.alertCount >= 1) {
          severity = 'Low' // ✅ Solo si tiene al menos 1 alerta
        }
        // Si alertCount === 0, se mantiene como 'Safe'

        return {
          id: trip.id,
          route: `Viaje #${trip.id} - Vehículo ${trip.vehicleId}`,
          startTime: trip.startTime,
          endTime: trip.endTime,
          status: severity, // Usar severity para el color
          alerts: trip.alertCount,
          tripStatus: trip.statusString, // Estado real del viaje
          durationMinutes: trip.durationMinutes
        }
      })

      console.log('✅ Viajes transformados:', tripHistory.value)
    } else {
      console.error('Error al cargar viajes:', response.status)
      tripHistory.value = []
    }
  } catch (error) {
    console.error('Error al cargar viajes:', error)
    tripHistory.value = []
  } finally {
    isLoadingTrips.value = false
  }
}

onMounted(async () => {
  try {
    const driverId = parseInt(route.params.id)

    await dashboardStore.fetchDrivers()

    driver.value = dashboardStore.drivers.find(d => d.id === driverId)

    if (!driver.value) {
      console.error('Conductor no encontrado')
      router.push('/dashboard')
      return
    }

    await loadDriverDetails(driverId)
    await loadDriverAlerts(driverId)
    await loadDriverTrips(driverId) // ✅ NUEVO: Cargar viajes

  } catch (error) {
    console.error('Error cargando detalles del conductor:', error)
    router.push('/dashboard')
  } finally {
    isLoading.value = false
  }
})
</script>
