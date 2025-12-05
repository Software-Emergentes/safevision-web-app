import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useDashboardStore = defineStore('dashboard', () => {
  // Estado
  const drivers = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  const selectedFilter = ref('all')

  // Computadas - CORREGIDAS PARA USAR STRINGS
  const totalDrivers = computed(() => drivers.value.length)

  const activeDrivers = computed(() =>
    drivers.value.filter(d => d.status === 'active').length
  )

  // Usar strings en lugar de constantes
  const criticalAlerts = computed(() =>
    drivers.value.filter(d => d.severity === 'Critical').length
  )

  const warningAlerts = computed(() =>
    drivers.value.filter(d =>
      d.severity === 'High' || d.severity === 'Medium'
    ).length
  )

  const safeDrivers = computed(() =>
    drivers.value.filter(d => d.alerts === 0).length
  )

  const filteredDrivers = computed(() => {
    if (selectedFilter.value === 'all') return drivers.value
    if (selectedFilter.value === 'active') {
      return drivers.value.filter(d => d.status === 'active')
    }
    if (selectedFilter.value === 'safe') {
      return drivers.value.filter(d => d.severity === 'None')
    }
    // Comparar con strings
    if (selectedFilter.value === 'critical') {
      return drivers.value.filter(d => d.severity === 'Critical')
    }
    if (selectedFilter.value === 'high') {
      return drivers.value.filter(d => d.severity === 'High')
    }
    if (selectedFilter.value === 'medium') {
      return drivers.value.filter(d => d.severity === 'Medium')
    }
    if (selectedFilter.value === 'low') {
      return drivers.value.filter(d => d.severity === 'Low')
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

  const fetchDrivers = async () => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🔄 Obteniendo conductores del backend...')

      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // 1. Obtener conductores
      const driversResponse = await fetch('https://localhost:44385/api/v1/drivers', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (!driversResponse.ok) {
        throw new Error(`Error ${driversResponse.status}`)
      }

      const driversData = await driversResponse.json()
      console.log('✅ Conductores recibidos:', driversData)

      // 2. Obtener datos completos de cada conductor
      const driversWithDetails = await Promise.all(
        driversData.map(async (driver) => {
          try {
            // Obtener licencia
            const licenseResponse = await fetch(
              `https://localhost:44385/api/v1/drivers/${driver.id}/license`,
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }
            )

            let licenseNumber = 'N/A'
            if (licenseResponse.ok) {
              const licenseData = await licenseResponse.json()
              licenseNumber = licenseData.licenseNumber || 'N/A'
            }

            // Obtener estado de fatiga
            let fatigueStatus = null
            let alertCount = 0
            let severity = 'None' // ✅ Por defecto sin alertas

            try {
              const fatigueResponse = await fetch(
                `https://localhost:44385/api/fatigue/status/${driver.id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }
              )

              if (fatigueResponse.ok) {
                fatigueStatus = await fatigueResponse.json()
                const hasActiveAlert = fatigueStatus.hasActiveAlert || false
                alertCount = fatigueStatus.recentEventsCount || 0

                // Determinar severity basado en currentSeverity
                if (fatigueStatus.currentSeverity >= 8) {
                  severity = 'Critical'
                } else if (fatigueStatus.currentSeverity >= 5) {
                  severity = 'High'
                } else if (fatigueStatus.currentSeverity >= 3) {
                  severity = 'Medium'
                } else if (alertCount > 0 || hasActiveAlert) {
                  severity = 'Low'
                }
              }
            } catch {
              console.log(`⚠️ No se pudo obtener estado de fatiga para conductor ${driver.id}`)
            }

            // Obtener alertas del conductor
            let alerts = []
            try {
              const alertsResponse = await fetch(
                `https://localhost:44385/api/alerts/reports/driver/${driver.id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }
              )

              if (alertsResponse.ok) {
                alerts = await alertsResponse.json()
                if (alerts.length > 0) {
                  alertCount = alerts.length

                  // Obtener la severidad más alta de las alertas usando strings
                  const severities = alerts.map(a => a.severityLevel || 'Low')

                  // Priorizar Critical > High > Medium > Low
                  if (severities.includes('Critical')) {
                    severity = 'Critical'
                  } else if (severities.includes('High')) {
                    severity = 'High'
                  } else if (severities.includes('Medium')) {
                    severity = 'Medium'
                  } else {
                    severity = 'Low'
                  }
                } else {
                  // Si no hay alertas, mantener 'None'
                  severity = 'None'
                  alertCount = 0
                }
              }
            } catch {
              console.log(`⚠️ No se pudieron obtener alertas para conductor ${driver.id}`)
            }

            // Buscar viaje del conductor
            let currentTrip = null
            try {
              const tripResponse = await fetch(
                `https://localhost:44385/api/trips/${driver.id}`,
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  }
                }
              )

              if (tripResponse.ok) {
                const tripData = await tripResponse.json()

                // ✅ CORREGIDO: Detectar viajes activos
                // Status: 0=NotStarted, 1=InProgress, 2=Completed, 3=Cancelled
                // Si status es 0, 1, o 2 con endTime null → Viaje activo
                if (tripData.status === 0 || tripData.status === 1 ||
                  (tripData.status === 2 && tripData.endTime === null)) {
                  currentTrip = {
                    id: tripData.id,
                    route: `Ruta Vehículo ${tripData.vehicleId}`,
                    startTime: tripData.startTime,
                    status: tripData.statusString,
                    vehicleId: tripData.vehicleId
                  }
                }
              }
            } catch {
              console.log(`⚠️ No se encontró viaje para conductor ${driver.id}`)
            }

            // Función para formatear tiempo relativo
            const formatRelativeTime = (dateString) => {
              if (!dateString) return null

              try {
                const date = new Date(dateString)
                const now = new Date()

                let diffMs = now - date

                if (diffMs < 0) {
                  diffMs = Math.abs(diffMs)
                }

                const diffMinutes = Math.floor(diffMs / (1000 * 60))
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

                if (diffDays > 0) {
                  return `Hace ${diffDays}d`
                } else if (diffHours > 0) {
                  const remainingMinutes = diffMinutes % 60
                  if (remainingMinutes > 0) {
                    return `Hace ${diffHours}h ${remainingMinutes}min`
                  }
                  return `Hace ${diffHours}h`
                } else if (diffMinutes > 0) {
                  return `Hace ${diffMinutes}min`
                } else {
                  return 'Justo ahora'
                }
              } catch (error) {
                console.error('Error formateando fecha:', error)
                return 'Reciente'
              }
            }

            return {
              id: driver.id,
              name: `${driver.firstName} ${driver.lastName}`,
              licenseNumber: licenseNumber,
              contactInfo: {
                phone: driver.phoneNumber,
                email: driver.email
              },
              vehicle: {
                plate: currentTrip ? `VEH-${currentTrip.vehicleId}` : 'N/A'
              },
              currentTrip: currentTrip,
              monitoring: {
                fatigueScore: fatigueStatus?.currentSeverity || 0,
                lastDetection: fatigueStatus?.lastEventTime || null
              },
              alerts: alertCount,
              totalAlerts: alertCount,
              severity: severity,
              fatigueSymptoms: [],
              lastAlert: alerts.length > 0 ? formatRelativeTime(alerts[0].generatedAt) : null,
              lastAlertTimestamp: alerts.length > 0 ? new Date(alerts[0].generatedAt).getTime() : 0,
              status: currentTrip ? 'active' : (driver.status === 'Active' ? 'active' : 'inactive'),
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(driver.firstName + '+' + driver.lastName)}&background=random&size=128`
            }
          } catch (err) {
            console.error(`Error obteniendo detalles del conductor ${driver.id}:`, err)
            return null
          }
        })
      )

      drivers.value = driversWithDetails.filter(d => d !== null)
      console.log('✅ Conductores con alertas y fatiga cargados:', drivers.value)
      console.log('📊 Conductores críticos:', drivers.value.filter(d => d.severity === 'Critical').length)
      console.log('📊 Conductores High:', drivers.value.filter(d => d.severity === 'High').length)
      console.log('📊 Conductores Medium:', drivers.value.filter(d => d.severity === 'Medium').length)
      console.log('📊 Conductores Low:', drivers.value.filter(d => d.severity === 'Low').length)

    } catch (err) {
      error.value = err.message || 'Error al cargar conductores'
      console.error('❌ Error al cargar conductores:', err)
      drivers.value = []
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
