import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { ALERT_SEVERITY } from '@/utils/constants'
import { determineAlertSeverity, determineAlertLevel, getRelativeTime } from '@/utils/helpers'

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const drivers = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedFilter = ref('all')

  // Computadas
  const totalDrivers = computed(() => drivers.value.length)
  const activeDrivers = computed(() =>
    drivers.value.filter(d => d.status === 'active').length
  )
  const criticalAlerts = computed(() =>
    drivers.value.filter(d => d.severity === ALERT_SEVERITY.CRITICAL).length
  )
  const warningAlerts = computed(() =>
    drivers.value.filter(d =>
      d.severity === ALERT_SEVERITY.HIGH || d.severity === ALERT_SEVERITY.MEDIUM
    ).length
  )
  const safeDrivers = computed(() =>
    drivers.value.filter(d => d.severity === ALERT_SEVERITY.LOW).length
  )
  const filteredDrivers = computed(() => {
    if (selectedFilter.value === 'all') return drivers.value
    if (selectedFilter.value === 'active') {
      return drivers.value.filter(d => d.status === 'active')
    }
    return drivers.value.filter(d => d.alertLevel === selectedFilter.value)
  })
  const driversByRoute = computed(() => {
    const routes = {}
    drivers.value.forEach(driver => {
      const routeName = driver.currentTrip?.route || 'Sin ruta'
      if (!routes[routeName]) {
        routes[routeName] = []
      }
      routes[routeName].push(driver)
    })
    return routes
  })

  // Acción para obtener conductores
  const fetchDrivers = async () => {
    isLoading.value = true
    error.value = null

    try {
      const data = await api.driver.getAllDrivers()
      drivers.value = data.map(transformDriverDataLocal)
      console.log('✅ Conductores cargados del backend:', drivers.value.length)
    } catch (err) {
      console.warn('⚠️ Error al cargar del backend:', err.message)
      console.warn('⚠️ Usando datos MOCK')

      // Usar datos mock directamente
      drivers.value = generateMockDriversAlignedWithBackend()
      console.log('✅ Conductores MOCK generados:', drivers.value.length)
    } finally {
      isLoading.value = false
    }
  }

  const updateDriverStatus = (driverId, newStatus) => {
    const driver = drivers.value.find(d => d.id === driverId)
    if (driver) {
      driver.status = newStatus
    }
  }

  const setFilter = (filter) => {
    selectedFilter.value = filter
  }

  return {
    drivers,
    isLoading,
    error,
    selectedFilter,
    totalDrivers,
    activeDrivers,
    criticalAlerts,
    warningAlerts,
    safeDrivers,
    filteredDrivers,
    driversByRoute,
    fetchDrivers,
    updateDriverStatus,
    setFilter
  }
})

// ✅ Función para transformar datos del backend
function transformDriverDataLocal(backendDriver) {
  const fatigueScore = backendDriver.monitoring?.fatigueScore || 0
  const totalAlerts = backendDriver.totalAlerts || 0

  // ✅ Calcular severity según DB (Low, Medium, High, Critical)
  const severity = determineAlertSeverity(fatigueScore, totalAlerts)

  // ✅ Calcular alertLevel para UI (safe, warning, critical)
  const alertLevel = determineAlertLevel(backendDriver.monitoring, totalAlerts)

  return {
    id: backendDriver.id,
    name: backendDriver.name,
    licenseNumber: backendDriver.licenseNumber,

    contactInfo: backendDriver.contactInfo || {
      phone: 'N/A',
      email: 'N/A'
    },

    vehicle: {
      plate: backendDriver.vehicle?.plate || 'N/A'
    },

    currentTrip: backendDriver.currentTrip || null,

    monitoring: backendDriver.monitoring || null,

    alerts: totalAlerts,

    // ✅ NUEVO: Severity según DB
    severity: severity,

    // ✅ MANTENER: alertLevel para UI
    alertLevel: alertLevel,

    // ✅ NUEVO: Síntomas de fatiga
    fatigueSymptoms: backendDriver.fatigueSymptoms || [],

    lastAlert: backendDriver.lastAlert
      ? getRelativeTime(backendDriver.lastAlert)
      : 'Sin alertas',

    status: backendDriver.status || 'offline',

    avatar: backendDriver.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(backendDriver.name)}&background=random&size=128`
  }
}

// ✅ FUNCIÓN MOCK COMPLETAMENTE ALINEADA CON DB
function generateMockDriversAlignedWithBackend() {
  const names = [
    'Juan Pérez', 'María García', 'Carlos López', 'Ana Martínez',
    'Luis Rodríguez', 'Carmen Sánchez', 'José Torres', 'Laura Ramírez',
    'Miguel Flores', 'Isabel Castro', 'Francisco Morales', 'Rosa Jiménez'
  ]

  const routes = [
    'Lima - Arequipa', 'Lima - Cusco', 'Lima - Trujillo',
    'Lima - Chiclayo', 'Lima - Piura', 'Lima - Ica'
  ]

  const vehiclePlates = [
    'ABC-123', 'DEF-456', 'GHI-789', 'JKL-012',
    'MNO-345', 'PQR-678', 'STU-901', 'VWX-234',
    'YZA-567', 'BCD-890', 'EFG-123', 'HIJ-456'
  ]

  const statuses = ['active', 'resting', 'offline']
  const statusWeights = [0.33, 0.17, 0.50] // 33% activo, 17% descansando, 50% offline

  const getWeightedStatus = () => {
    const random = Math.random()
    let sum = 0
    for (let i = 0; i < statusWeights.length; i++) {
      sum += statusWeights[i]
      if (random <= sum) return statuses[i]
    }
    return statuses[2]
  }

  return names.map((name, index) => {
    const status = getWeightedStatus()
    const hasActiveTrip = status === 'active'

    // ✅ Fatiga realista basada en alertas
    const randomAlerts = Math.floor(Math.random() * 20) // 0-20 alertas
    let randomFatigue = 0

    if (hasActiveTrip) {
      if (randomAlerts >= 15) {
        randomFatigue = Math.floor(Math.random() * 20) + 80 // 80-100 (crítico)
      } else if (randomAlerts >= 10) {
        randomFatigue = Math.floor(Math.random() * 20) + 60 // 60-80 (high)
      } else if (randomAlerts >= 5) {
        randomFatigue = Math.floor(Math.random() * 20) + 40 // 40-60 (medium)
      } else {
        randomFatigue = Math.floor(Math.random() * 40) // 0-40 (low)
      }
    }

    // ✅ Calcular severity y alertLevel
    const severity = determineAlertSeverity(randomFatigue, randomAlerts)
    const alertLevel = determineAlertLevel({ fatigueScore: randomFatigue }, randomAlerts)

    // ✅ Generar síntomas aleatorios
    const allSymptoms = ['Yawning', 'EyeClosure', 'HeadDroop', 'MicroSleep']
    const symptomCount = randomAlerts > 10 ? 3 : randomAlerts > 5 ? 2 : randomAlerts > 0 ? 1 : 0
    const symptoms = allSymptoms.slice(0, symptomCount)

    const lastAlertTime = randomAlerts > 0
      ? new Date(Date.now() - Math.random() * 24 * 3600 * 1000).toISOString()
      : null

    return {
      id: index + 1,
      name: name,
      licenseNumber: `L${1000000 + index}`,

      contactInfo: {
        phone: `+51 9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        email: `${name.toLowerCase().replace(' ', '.')}@empresa.com`
      },

      vehicle: {
        plate: vehiclePlates[index]
      },

      currentTrip: hasActiveTrip ? {
        id: `trip-${index + 1}`,
        route: routes[index % routes.length],
        startTime: new Date(Date.now() - Math.random() * 8 * 3600 * 1000).toISOString(),
        status: 'En progreso'
      } : null,

      monitoring: hasActiveTrip ? {
        fatigueScore: randomFatigue,
        lastDetection: new Date(Date.now() - Math.random() * 3600 * 1000).toISOString()
      } : null,

      alerts: randomAlerts,

      // ✅ NUEVO: Severity según DB
      severity: severity,

      // ✅ MANTENER: alertLevel para UI
      alertLevel: alertLevel,

      // ✅ NUEVO: Síntomas
      fatigueSymptoms: symptoms,

      lastAlert: lastAlertTime ? getRelativeTime(lastAlertTime) : 'Sin alertas',
      status: status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
    }
  })
}
