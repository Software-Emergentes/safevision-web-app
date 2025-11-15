import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'
import { ALERT_SEVERITY } from '@/utils/constants'
import { determineAlertSeverity, getRelativeTime } from '@/utils/helpers'

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
    drivers.value.filter(d => d.alerts === 0).length // ✅ Conductores seguros = 0 alertas
  )
  const filteredDrivers = computed(() => {
    if (selectedFilter.value === 'all') return drivers.value
    if (selectedFilter.value === 'active') {
      return drivers.value.filter(d => d.status === 'active')
    }
    return drivers.value.filter(d => d.severity === selectedFilter.value)
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

  // ✅ SOLO calcular severity según DB (Low, Medium, High, Critical)
  const severity = totalAlerts === 0 ? 'Safe' : determineAlertSeverity(fatigueScore, totalAlerts)

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

    // ✅ SOLO SEVERITY
    severity: severity,

    // ✅ Síntomas de fatiga
    fatigueSymptoms: backendDriver.fatigueSymptoms || [],

    lastAlert: backendDriver.lastAlert
      ? getRelativeTime(backendDriver.lastAlert)
      : null,

    status: backendDriver.status || 'offline',

    avatar: backendDriver.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(backendDriver.name)}&background=random&size=128`
  }
}

// ✅ FUNCIÓN MOCK - SOLO USA SEVERITY (Low, Medium, High, Critical)
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
  const statusWeights = [0.60, 0.25, 0.15] // 60% activo, 25% descansando, 15% offline

  const getWeightedStatus = () => {
    const random = Math.random()
    let sum = 0
    for (let i = 0; i < statusWeights.length; i++) {
      sum += statusWeights[i]
      if (random <= sum) return statuses[i]
    }
    return statuses[0]
  }

  // ✅ DISTRIBUCIÓN EQUILIBRADA DE SEVERITY
  // 2 Critical, 3 High, 3 Medium, 2 Low, 2 Safe (sin alertas)
  const severityDistribution = [
    'Critical', 'Critical',
    'High', 'High', 'High',
    'Medium', 'Medium', 'Medium',
    'Low', 'Low',
    'Safe', 'Safe'
  ]

  const shuffled = severityDistribution.sort(() => Math.random() - 0.5)

  const driversData = names.map((name, index) => {
    const status = getWeightedStatus()
    const hasActiveTrip = status === 'active'
    const assignedSeverity = shuffled[index]

    let randomAlerts = 0
    let randomFatigue = 0

    if (hasActiveTrip) {
      switch (assignedSeverity) {
        case 'Critical':
          randomAlerts = Math.floor(Math.random() * 2) + 5 // 5-6 alertas
          randomFatigue = Math.floor(Math.random() * 20) + 80 // 80-100
          break
        case 'High':
          randomAlerts = Math.floor(Math.random() * 2) + 3 // 3-4 alertas
          randomFatigue = Math.floor(Math.random() * 20) + 60 // 60-80
          break
        case 'Medium':
          randomAlerts = Math.floor(Math.random() * 2) + 1 // 1-2 alertas
          randomFatigue = Math.floor(Math.random() * 20) + 40 // 40-60
          break
        case 'Low':
          randomAlerts = 1 // Exactamente 1 alerta
          randomFatigue = Math.floor(Math.random() * 40) // 0-40
          break
        case 'Safe':
          randomAlerts = 0
          randomFatigue = Math.floor(Math.random() * 30)
          break
      }
    } else {
      randomAlerts = 0
      randomFatigue = 0
    }

    // ✅ SOLO USAR SEVERITY
    const severity = randomAlerts === 0 ? 'Safe' : assignedSeverity

    const allSymptoms = ['Yawning', 'EyeClosure', 'HeadDroop', 'MicroSleep']
    const symptomCount = randomAlerts > 4 ? 3 : randomAlerts > 2 ? 2 : randomAlerts > 0 ? 1 : 0
    const symptoms = allSymptoms.slice(0, symptomCount)

    let lastAlertTime = null
    if (randomAlerts > 0) {
      const minMinutes = 5
      const maxMinutes = 360
      const randomMinutes = Math.floor(Math.random() * (maxMinutes - minMinutes + 1)) + minMinutes
      lastAlertTime = new Date(Date.now() - randomMinutes * 60 * 1000).toISOString()
    }

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
      severity: severity, // ✅ SOLO SEVERITY
      fatigueSymptoms: symptoms,
      lastAlert: lastAlertTime ? getRelativeTime(lastAlertTime) : null,
      lastAlertTimestamp: lastAlertTime ? new Date(lastAlertTime).getTime() : 0,
      status: status,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=128`
    }
  })

  driversData.sort((a, b) => {
    if (a.alerts > 0 && b.alerts === 0) return -1
    if (a.alerts === 0 && b.alerts > 0) return 1
    return b.lastAlertTimestamp - a.lastAlertTimestamp
  })

  return driversData
}
