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
              <span class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {{ driver.vehicle?.plate || 'N/A' }}
              </span>

              <span v-if="driver.currentTrip" class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ driver.currentTrip.route }}
              </span>

              <span class="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {{ driver.contactInfo?.email || 'N/A' }}
              </span>
            </div>

            <!-- Quick Stats -->
            <div class="flex gap-4">
              <div :class="['flex flex-col gap-1 py-3 px-4 bg-gray-100 rounded-lg border-l-[3px]', getStatClass(driver.severity)]">
                <span class="text-xs text-gray-500 font-medium">Nivel de Alerta</span>
                <span class="text-lg font-bold text-gray-900">{{ getSeverityLabel(driver.severity) }}</span>
              </div>
              <div v-if="driver.currentTrip" class="flex flex-col gap-1 py-3 px-4 bg-gray-100 rounded-lg border-l-[3px] border-l-gray-200">
                <span class="text-xs text-gray-500 font-medium">Tiempo en Ruta</span>
                <span class="text-lg font-bold text-gray-900">{{ calculateTripDuration(driver.currentTrip.startTime) }}</span>
              </div>
              <div v-if="driver.monitoring" class="flex flex-col gap-1 py-3 px-4 bg-gray-100 rounded-lg border-l-[3px] border-l-gray-200">
                <span class="text-xs text-gray-500 font-medium">Fatiga</span>
                <span class="text-lg font-bold text-gray-900">{{ driver.monitoring.fatigueScore }}/100</span>
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
              'flex-1 min-w-[160px] flex items-center justify-center gap-2 py-3 px-5 bg-transparent border-none rounded-lg text-gray-500 text-sm font-semibold cursor-pointer transition-all duration-300',
              activeTab === tab.id ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg' : 'hover:bg-gray-100 hover:text-gray-900'
            ]"
          >
            <span class="flex items-center justify-center" v-html="tab.icon"></span>
            <span>{{ tab.label }}</span>
            <span v-if="tab.badge !== undefined" :class="['py-0.5 px-2 rounded-xl text-xs font-bold', activeTab === tab.id ? 'bg-white/20' : 'bg-black/10']">
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

              <div v-if="filteredAlerts.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success mb-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <p>No hay alertas para mostrar</p>
              </div>

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
                :trips="driver.tripHistory || []"
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
                trend="+12% vs. mes anterior"
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
                trend="+5% vs. mes anterior"
                trend-direction="up"
                variant="success"
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
                :trend="`${driver.lastAlert || 'Sin alertas recientes'}`"
                :trend-direction="driver.severity === 'Critical' ? 'down' : 'up'"
                :variant="driver.severity === 'Critical' ? 'danger' : 'warning'"
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
            />

            <DriverStatsChart
              title="Distribución de Alertas por Mes"
              :data="monthlyAlertsData"
              :max-value="Math.max(...monthlyAlertsData.map(d => d.value)) + 5"
              :available-periods="['month']"
              default-period="month"
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
import { ALERT_SEVERITY, ALERT_SEVERITY_LABELS } from '@/utils/constants'

const router = useRouter()
const route = useRoute()
const dashboardStore = useDashboardStore()

const isLoading = ref(true)
const isLoadingTrips = ref(false)
const driver = ref(null)
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

const calculateTripDuration = (startTime) => {
  if (!startTime) return '0h 0m'

  const start = new Date(startTime)
  const now = new Date()
  const diffMs = now - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
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
    badge: driver.value?.alerts || 0
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
  { label: 'Críticas', value: ALERT_SEVERITY.CRITICAL },
  { label: 'Altas', value: ALERT_SEVERITY.HIGH },
  { label: 'Moderadas', value: ALERT_SEVERITY.MEDIUM },
  { label: 'Leves', value: ALERT_SEVERITY.LOW }
]

const filteredAlerts = computed(() => {
  if (!driver.value?.alertHistory) return []

  if (selectedAlertFilter.value === 'all') {
    return driver.value.alertHistory
  }

  return driver.value.alertHistory.filter(
    alert => alert.severity === selectedAlertFilter.value
  )
})

const driverStats = computed(() => {
  if (!driver.value) return {
    tripsCompleted: 0,
    safetyRate: 0,
    avgFatigue: 0
  }

  const tripHistory = driver.value.tripHistory || []

  return {
    tripsCompleted: tripHistory.length,
    safetyRate: driver.value.severity === 'Safe' ? 92 :
      driver.value.severity === 'Low' ? 85 :
        driver.value.severity === 'Medium' ? 75 : 58,
    avgFatigue: driver.value.monitoring?.fatigueScore || 0
  }
})

const monthlyPerformanceData = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return months.map((month, index) => ({
    label: month,
    value: 65 + (index * 3) + Math.floor(Math.random() * 10)
  }))
})

const monthlyAlertsData = computed(() => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return months.map((month, index) => ({
    label: month,
    value: Math.max(1, 15 - (index * 2) + Math.floor(Math.random() * 5))
  }))
})

const generateMockAlerts = (driver) => {
  const numAlerts = driver.alerts || driver.totalAlerts || 0

  if (numAlerts === 0) {
    return []
  }

  const driverSeverity = driver.severity === 'Safe' ? 'Low' : driver.severity

  const alertTypesBySeverity = {
    Critical: [
      { title: 'Micro-sueño detectado', type: 'Fatiga', severity: 'Critical', symptoms: ['MicroSleep', 'EyeClosure'] },
      { title: 'Fatiga severa detectada', type: 'Fatiga', severity: 'Critical', symptoms: ['MicroSleep', 'EyeClosure', 'HeadDroop'] },
      { title: 'Pérdida de control del vehículo', type: 'Conducción', severity: 'Critical', symptoms: ['MicroSleep'] }
    ],
    High: [
      { title: 'Parpadeo excesivo', type: 'Fatiga', severity: 'High', symptoms: ['EyeClosure'] },
      { title: 'Desviación de carril', type: 'Conducción', severity: 'High', symptoms: ['HeadDroop'] },
      { title: 'Cambio brusco de carril', type: 'Conducción', severity: 'High', symptoms: ['HeadDroop'] }
    ],
    Medium: [
      { title: 'Bostezo detectado', type: 'Fatiga', severity: 'Medium', symptoms: ['Yawning'] },
      { title: 'Velocidad excesiva', type: 'Conducción', severity: 'Medium', symptoms: [] },
      { title: 'Distracción detectada', type: 'Conducción', severity: 'Medium', symptoms: [] }
    ],
    Low: [
      { title: 'Leve reducción de atención', type: 'Fatiga', severity: 'Low', symptoms: [] },
      { title: 'Ajuste menor de trayectoria', type: 'Conducción', severity: 'Low', symptoms: [] },
      { title: 'Variación de velocidad', type: 'Conducción', severity: 'Low', symptoms: [] }
    ]
  }

  const locations = [
    'Km 245 - Carretera Panamericana Sur',
    'Km 180 - Vía de Evitamiento',
    'Km 320 - Autopista del Sol',
    'Km 95 - Carretera Central',
    'Km 150 - Carretera Norte',
    'Km 410 - Ruta Interoceánica'
  ]

  const descriptions = {
    Critical: 'Evento crítico detectado. Se requiere acción inmediata. Detener el vehículo de forma segura.',
    High: 'Situación de alto riesgo. Requiere atención urgente. Considere detenerse pronto.',
    Medium: 'Situación que requiere atención. Monitoreo continuo recomendado.',
    Low: 'Evento menor registrado para análisis. Mantenga precaución.'
  }

  const availableAlerts = alertTypesBySeverity[driverSeverity] || alertTypesBySeverity.Low

  const alerts = []

  for (let i = 0; i < numAlerts; i++) {
    let alert
    if (Math.random() < 0.8) {
      alert = availableAlerts[Math.floor(Math.random() * availableAlerts.length)]
    } else {
      const allAlerts = Object.values(alertTypesBySeverity).flat()
      alert = allAlerts[Math.floor(Math.random() * allAlerts.length)]
    }

    const maxHours = 48
    const hoursAgo = Math.floor((maxHours / numAlerts) * i) + Math.floor(Math.random() * 3)

    alerts.push({
      id: `alert-${driver.id}-${i}`,
      ...alert,
      description: descriptions[alert.severity],
      location: locations[Math.floor(Math.random() * locations.length)],
      time: hoursAgo === 0 ? 'Hace unos minutos' : hoursAgo < 1 ? 'Hace menos de 1h' : `Hace ${hoursAgo}h`,
      timestamp: Date.now() - (hoursAgo * 60 * 60 * 1000),
      fatigueSymptoms: alert.symptoms,
      status: 'New',
      createdAt: new Date(Date.now() - (hoursAgo * 60 * 60 * 1000)).toISOString()
    })
  }

  return alerts.sort((a, b) => b.timestamp - a.timestamp)
}

const generateMockTrips = (driverId) => {
  const routes = [
    'Lima - Arequipa', 'Lima - Cusco', 'Lima - Trujillo',
    'Lima - Chiclayo', 'Lima - Piura', 'Lima - Ica'
  ]

  const severities = ['Low', 'Medium', 'High', 'Critical']
  const severityWeights = [0.5, 0.3, 0.15, 0.05]

  const getWeightedSeverity = () => {
    const random = Math.random()
    let sum = 0
    for (let i = 0; i < severityWeights.length; i++) {
      sum += severityWeights[i]
      if (random <= sum) return severities[i]
    }
    return severities[0]
  }

  return Array.from({ length: 15 }, (_, i) => {
    const daysAgo = i * 2 + Math.floor(Math.random() * 2)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    const endDate = new Date(startDate.getTime() + (Math.random() * 8 + 4) * 3600 * 1000)

    const severity = getWeightedSeverity()

    let alerts = 0
    if (severity === 'Critical') alerts = Math.floor(Math.random() * 8) + 10
    else if (severity === 'High') alerts = Math.floor(Math.random() * 5) + 5
    else if (severity === 'Medium') alerts = Math.floor(Math.random() * 5) + 2
    else alerts = Math.floor(Math.random() * 2)

    return {
      id: `trip-${driverId}-${i}`,
      route: routes[Math.floor(Math.random() * routes.length)],
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      alerts,
      status: severity,
      timestamp: startDate.getTime()
    }
  }).sort((a, b) => b.timestamp - a.timestamp)
}

onMounted(async () => {
  const driverId = route.params.id

  try {
    if (dashboardStore.drivers.length === 0) {
      await dashboardStore.fetchDrivers()
    }

    const foundDriver = dashboardStore.drivers.find(d => d.id === parseInt(driverId))

    if (foundDriver) {
      driver.value = {
        ...foundDriver,
        alertHistory: generateMockAlerts(foundDriver),
        tripHistory: generateMockTrips(foundDriver.id)
      }

      console.log(`✅ Driver cargado: ${foundDriver.name}`)
      console.log(`✅ Alertas totales: ${foundDriver.alerts}`)
      console.log(`✅ Alertas generadas para detalle: ${driver.value.alertHistory.length}`)
    } else {
      console.error('❌ Conductor no encontrado')
      router.push({ name: 'dashboard' })
    }
  } catch (error) {
    console.error('❌ Error al cargar conductor:', error)
    router.push({ name: 'dashboard' })
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  main {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .flex.gap-8 {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .flex.gap-6 {
    justify-content: center;
  }

  .grid.grid-cols-\[repeat\(auto-fit\,minmax\(240px\,1fr\)\)\] {
    grid-template-columns: 1fr;
  }
}
</style>
