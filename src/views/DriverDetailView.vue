<template>
  <div class="driver-detail-container">
    <AppSidebar />

    <main class="main-content">
      <!-- Header -->
      <header class="page-header">
        <button @click="goBack" class="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver
        </button>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-header">
          <div class="spinner"></div>
          <p>Cargando información del conductor...</p>
        </div>

        <!-- Driver Info -->
        <div v-else-if="driver" class="driver-header-info">
          <div class="driver-avatar-large">
            <img :src="driver.avatar" :alt="driver.name" />
            <span class="status-badge" :class="driver.status">
              {{ getStatusText(driver.status) }}
            </span>
          </div>

          <div class="driver-details-header">
            <h1 class="driver-name">{{ driver.name }}</h1>

            <div class="driver-meta">
              <span class="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                {{ driver.vehicle?.plate || 'N/A' }}
              </span>

              <span class="meta-item" v-if="driver.currentTrip">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {{ driver.currentTrip.route }}
              </span>

              <span class="meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                {{ driver.contactInfo?.email || 'N/A' }}
              </span>
            </div>

            <!-- Quick Stats -->
            <div class="quick-stats">
              <div class="stat-item" :class="getStatClass(driver.severity)">
                <span class="stat-label">Nivel de Alerta</span>
                <span class="stat-value">{{ getSeverityLabel(driver.severity) }}</span>
              </div>
              <div class="stat-item" v-if="driver.currentTrip">
                <span class="stat-label">Tiempo en Ruta</span>
                <span class="stat-value">{{ calculateTripDuration(driver.currentTrip.startTime) }}</span>
              </div>
              <div class="stat-item" v-if="driver.monitoring">
                <span class="stat-label">Fatiga</span>
                <span class="stat-value">{{ driver.monitoring.fatigueScore }}/100</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Alertas</span>
                <span class="stat-value">{{ driver.alerts }}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Tabs -->
      <template v-if="driver && !isLoading">
        <div class="tabs-container">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="tab-button"
            :class="{ active: activeTab === tab.id }"
          >
            <span class="tab-icon" v-html="tab.icon"></span>
            <span class="tab-label">{{ tab.label }}</span>
            <span v-if="tab.badge !== undefined" class="tab-badge">{{ tab.badge }}</span>
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- TAB 1: Alertas -->
          <div v-show="activeTab === 'alerts'" class="alerts-tab">
            <div class="section-header">
              <h2>Alertas Recientes</h2>
              <div class="filter-group">
                <button
                  v-for="filter in alertFilters"
                  :key="filter.value"
                  @click="selectedAlertFilter = filter.value"
                  class="filter-btn"
                  :class="{ active: selectedAlertFilter === filter.value }"
                >
                  {{ filter.label }}
                </button>
              </div>
            </div>

            <div v-if="filteredAlerts.length === 0" class="empty-state">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <p>No hay alertas para mostrar</p>
            </div>

            <div v-else class="alerts-list">
              <div
                v-for="alert in filteredAlerts"
                :key="alert.id"
                class="alert-card"
                :class="`severity-${alert.severity.toLowerCase()}`"
              >
                <div class="alert-icon" :class="`icon-${alert.severity.toLowerCase()}`">
                  <span v-html="getAlertIcon(alert.severity)"></span>
                </div>
                <div class="alert-content">
                  <div class="alert-header">
                    <h3 class="alert-title">{{ alert.title }}</h3>
                    <span class="alert-time">{{ alert.time }}</span>
                  </div>
                  <p class="alert-description">{{ alert.description }}</p>
                  <div class="alert-footer">
                    <span class="alert-location">📍 {{ alert.location }}</span>
                    <span class="alert-type-badge" :class="`badge-${alert.severity.toLowerCase()}`">
                      {{ alert.type }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Historial -->
          <div v-show="activeTab === 'trips'" class="trips-tab">
            <TripHistoryList
              :trips="driver.tripHistory || []"
              :is-loading="isLoadingTrips"
              @view-trip-details="handleViewTripDetails"
            />
          </div>

          <!-- TAB 3: Estadísticas -->
          <div v-show="activeTab === 'stats'" class="stats-tab">
            <div class="stats-summary-grid">
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

// Estado local
const isLoading = ref(true)
const isLoadingTrips = ref(false)
const driver = ref(null)
const activeTab = ref('alerts')
const selectedAlertFilter = ref('all')

// ✅ Funciones helper
const getSeverityLabel = (severity) => {
  return ALERT_SEVERITY_LABELS[severity] || severity
}

const getStatClass = (severity) => {
  const classMap = {
    'Critical': 'alert-critical',
    'High': 'alert-high',
    'Medium': 'alert-medium',
    'Low': 'alert-low',
    'Safe': 'alert-safe'
  }
  return classMap[severity] || 'alert-safe'
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

// Tabs computed
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

// ✅ GENERAR ALERTAS BASADAS EN EL DRIVER
const generateMockAlerts = (driver) => {
  const numAlerts = driver.alerts || driver.totalAlerts || 0

  if (numAlerts === 0) {
    return []
  }

  // ✅ DETERMINAR SEVERITY PREDOMINANTE DEL DRIVER
  const driverSeverity = driver.severity === 'Safe' ? 'Low' : driver.severity

  // ✅ ALERTAS ALINEADAS CON EL SEVERITY DEL DRIVER
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

  // ✅ SELECCIONAR ALERTAS SEGÚN EL SEVERITY DEL DRIVER
  const availableAlerts = alertTypesBySeverity[driverSeverity] || alertTypesBySeverity.Low

  const alerts = []

  for (let i = 0; i < numAlerts; i++) {
    // ✅ 80% de las alertas serán del mismo severity del driver, 20% de otros niveles
    let alert
    if (Math.random() < 0.8) {
      // Misma severidad
      alert = availableAlerts[Math.floor(Math.random() * availableAlerts.length)]
    } else {
      // Ocasionalmente una alerta de nivel diferente (pero relacionado)
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

// ✅ GENERAR HISTORIAL DE VIAJES
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

// Lifecycle
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
/* Todos los estilos existentes permanecen igual */
.driver-detail-container {
  display: flex;
  min-height: 100vh;
  background: #F5F7FA;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 32px;
  width: calc(100% - 280px);
}

.page-header {
  margin-bottom: 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  color: #222222;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.back-button:hover {
  background: #F5F7FA;
  border-color: #C13515;
  color: #C13515;
}

.loading-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E9ECEF;
  border-top-color: #C13515;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.driver-header-info {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.driver-avatar-large {
  position: relative;
  flex-shrink: 0;
}

.driver-avatar-large img {
  width: 120px;
  height: 120px;
  border-radius: 16px;
  object-fit: cover;
  border: 4px solid #F5F7FA;
}

.status-badge {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-badge.active {
  background: #00CA75;
  color: white;
}

.status-badge.resting {
  background: #FFCD18;
  color: #222222;
}

.status-badge.offline {
  background: #74788D;
  color: white;
}

.driver-details-header {
  flex: 1;
}

.driver-name {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin: 0 0 12px 0;
}

.driver-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #74788D;
  font-size: 14px;
  font-weight: 500;
}

.meta-item svg {
  color: #C13515;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: #F5F7FA;
  border-radius: 8px;
  border-left: 3px solid #E9ECEF;
}

.stat-item.alert-critical {
  background: #FFF5F5;
  border-left-color: #C13515;
}

.stat-item.alert-high {
  background: #FFF8E1;
  border-left-color: #FFA500;
}

.stat-item.alert-medium {
  background: #FFFBEB;
  border-left-color: #FFCD18;
}

.stat-item.alert-low {
  background: #F0F9FF;
  border-left-color: #0066CC;
}

.stat-item.alert-safe {
  background: #E8F8F0;
  border-left-color: #00CA75;
}

.stat-label {
  font-size: 12px;
  color: #74788D;
  font-weight: 500;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #222222;
}

/* TABS */
.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  min-width: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #74788D;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #F5F7FA;
  color: #222222;
}

.tab-button.active {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(193, 53, 21, 0.3);
}

.tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tab-badge {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.tab-button.active .tab-badge {
  background: rgba(255, 255, 255, 0.2);
}

/* TAB CONTENT */
.tab-content {
  min-height: 400px;
}

.alerts-tab, .trips-tab, .stats-tab {
  animation: fadeIn 0.3s ease;
}

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

/* ALERTS TAB */
.alerts-tab {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #222222;
  margin: 0;
}

.filter-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: #F5F7FA;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  color: #74788D;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #E9ECEF;
  border-color: #C13515;
}

.filter-btn.active {
  background: #C13515;
  border-color: #C13515;
  color: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #74788D;
  text-align: center;
}

.empty-state svg {
  color: #00CA75;
  margin-bottom: 16px;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.alert-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: #F5F7FA;
  border-radius: 12px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
}

.alert-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.alert-card.severity-critical {
  background: #FFF5F5;
  border-left-color: #C13515;
}

.alert-card.severity-high {
  background: #FFF8E1;
  border-left-color: #FFA500;
}

.alert-card.severity-medium {
  background: #FFFBEB;
  border-left-color: #FFCD18;
}

.alert-card.severity-low {
  background: #F0F9FF;
  border-left-color: #0066CC;
}

.alert-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon.icon-critical {
  background: #FFE8E8;
  color: #C13515;
}

.alert-icon.icon-high {
  background: #FFF8E1;
  color: #FFA500;
}

.alert-icon.icon-medium {
  background: #FFFBEB;
  color: #FFCD18;
}

.alert-icon.icon-low {
  background: #E3F2FD;
  color: #0066CC;
}

.alert-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.alert-title {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.alert-time {
  font-size: 13px;
  color: #74788D;
  white-space: nowrap;
}

.alert-description {
  font-size: 14px;
  color: #74788D;
  margin: 0;
  line-height: 1.6;
}

.alert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.alert-location {
  font-size: 13px;
  color: #74788D;
}

.alert-type-badge {
  padding: 4px 12px;
  background: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: #222222;
}

.alert-type-badge.badge-critical {
  background: #FFE8E8;
  color: #C13515;
}

.alert-type-badge.badge-high {
  background: #FFF8E1;
  color: #FFA500;
}

.alert-type-badge.badge-medium {
  background: #FFFBEB;
  color: #FFCD18;
}

.alert-type-badge.badge-low {
  background: #E3F2FD;
  color: #0066CC;
}

/* TRIPS TAB */
.trips-tab {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 400px;
}

/* STATS TAB */
.stats-tab {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .driver-header-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .driver-meta {
    justify-content: center;
  }

  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs-container {
    overflow-x: auto;
  }

  .tab-button {
    flex-shrink: 0;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-group {
    width: 100%;
  }

  .alert-card {
    flex-direction: column;
  }

  .stats-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
