<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-900">Reporte por Ruta</h3>

      <div class="flex gap-3">
        <!-- Buscar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar ruta..."
            class="w-64 py-2 px-4 pl-10 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:bg-white transition-all"
          >
          <svg
            class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </div>

        <!-- Ordenar -->
        <select
          v-model="sortBy"
          class="py-2 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:border-primary transition-all"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="alerts">Ordenar por alertas</option>
          <option value="risk">Ordenar por riesgo</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">RUTA</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">VIAJES</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">ALERTAS CRÍTICAS</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">ALERTAS TOTALES</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">ÍNDICE DE RIESGO</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">CONDUCTORES</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="route in filteredAndSortedRoutes"
          :key="route.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <!-- Ruta -->
          <td class="py-4 px-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
                  <circle cx="12" cy="10" r="3"></circle>
                  <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ route.name }}</p>
                <p class="text-xs text-gray-500">{{ route.description }}</p>
              </div>
            </div>
          </td>

          <!-- Viajes -->
          <td class="py-4 px-4 text-center">
            <span class="text-lg font-bold text-gray-900">{{ route.trips }}</span>
          </td>

          <!-- Alertas Críticas -->
          <td class="py-4 px-4 text-center">
            <div class="flex items-center justify-center gap-2">
              <svg v-if="route.criticalAlerts > 0" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-500">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <span
                class="text-lg font-bold"
                :class="{
                    'text-red-600': route.criticalAlerts > 3,
                    'text-orange-600': route.criticalAlerts > 0 && route.criticalAlerts <= 3,
                    'text-green-600': route.criticalAlerts === 0
                  }"
              >
                  {{ route.criticalAlerts }}
                </span>
            </div>
          </td>

          <!-- Alertas -->
          <td class="py-4 px-4 text-center">
              <span
                class="inline-flex items-center justify-center w-12 h-12 rounded-full text-lg font-bold"
                :class="{
                  'bg-red-100 text-red-700': route.totalAlerts > 10,
                  'bg-orange-100 text-orange-700': route.totalAlerts > 5 && route.totalAlerts <= 10,
                  'bg-yellow-100 text-yellow-700': route.totalAlerts > 0 && route.totalAlerts <= 5,
                  'bg-green-100 text-green-700': route.totalAlerts === 0
                }"
              >
                {{ route.totalAlerts }}
              </span>
          </td>

          <!-- Índice de Riesgo -->
          <td class="py-4 px-4">
            <div class="flex flex-col items-center gap-2">
              <div class="flex items-center gap-2">
                  <span
                    class="text-lg font-bold"
                    :class="{
                      'text-green-600': route.riskScore < 30,
                      'text-yellow-600': route.riskScore >= 30 && route.riskScore < 60,
                      'text-orange-600': route.riskScore >= 60 && route.riskScore < 80,
                      'text-red-600': route.riskScore >= 80
                    }"
                  >
                    {{ route.riskScore }}/100
                  </span>
              </div>
              <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300"
                  :class="{
                      'bg-green-500': route.riskScore < 30,
                      'bg-yellow-500': route.riskScore >= 30 && route.riskScore < 60,
                      'bg-orange-500': route.riskScore >= 60 && route.riskScore < 80,
                      'bg-red-500': route.riskScore >= 80
                    }"
                  :style="{ width: route.riskScore + '%' }"
                ></div>
              </div>
            </div>
          </td>

          <!-- Conductores -->
          <td class="py-4 px-4">
            <div class="flex items-center justify-center gap-1">
              <div
                v-for="(driver, index) in route.drivers.slice(0, 3)"
                :key="driver.id"
                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
                :style="{
                    backgroundColor: driver.avatarColor,
                    marginLeft: index > 0 ? '-8px' : '0',
                    zIndex: 10 - index
                  }"
                :title="driver.name"
              >
                {{ driver.initials }}
              </div>
              <span
                v-if="route.drivers.length > 3"
                class="ml-2 text-xs font-semibold text-gray-600"
              >
                  +{{ route.drivers.length - 3 }}
                </span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div
        v-if="filteredAndSortedRoutes.length === 0"
        class="text-center py-12"
      >
        <svg
          class="mx-auto mb-4 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="10" r="3"></circle>
          <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z"></path>
        </svg>
        <p class="text-gray-500 text-sm">No se encontraron rutas</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    required: true,
    default: () => []
  }
})

const searchQuery = ref('')
const sortBy = ref('name')

// ✅ Agrupar conductores por vehículo (ruta)
const routesData = computed(() => {
  const routesMap = new Map()

  props.drivers.forEach(driver => {
    // Determinar el ID del vehículo/ruta
    let vehicleId = null

    // Intentar obtener vehicleId de currentTrip primero
    if (driver.currentTrip && driver.currentTrip.vehicleId) {
      vehicleId = driver.currentTrip.vehicleId
    }
    // Si no, usar el vehicleId del campo vehicle (que viene del dashboard)
    else if (driver.vehicle && driver.vehicle.plate && driver.vehicle.plate !== 'N/A') {
      // Extraer número del formato "VEH-101"
      const match = driver.vehicle.plate.match(/VEH-(\d+)/)
      if (match) {
        vehicleId = parseInt(match[1])
      }
    }

    // Si no tiene vehículo, agrupar en "sin ruta"
    const routeKey = vehicleId || 'sin-ruta'
    const routeName = vehicleId ? `Ruta Vehículo ${vehicleId}` : 'Sin ruta asignada'
    const routeDescription = vehicleId ? `Vehículo ID: ${vehicleId}` : 'Conductores sin viaje activo'

    if (!routesMap.has(routeKey)) {
      routesMap.set(routeKey, {
        id: routeKey,
        vehicleId: vehicleId,
        name: routeName,
        description: routeDescription,
        drivers: [],
        totalAlerts: 0,
        criticalAlerts: 0,  // ✅ Contador de alertas críticas
        trips: 0
      })
    }

    const route = routesMap.get(routeKey)

    // ✅ Contar alertas críticas (severity === 'Critical')
    const isCritical = driver.severity === 'Critical'
    const driverCriticalAlerts = isCritical ? (driver.alerts || 0) : 0

    route.drivers.push({
      id: driver.id,
      name: driver.name,
      initials: getInitials(driver.name),
      avatarColor: getAvatarColor(driver.name),
      alerts: driver.alerts || 0,
      isCritical: isCritical
    })
    route.totalAlerts += (driver.alerts || 0)
    route.criticalAlerts += driverCriticalAlerts
    if (driver.currentTrip) {
      route.trips++
    }
  })

  // Convertir a array y calcular métricas
  return Array.from(routesMap.values()).map(route => {
    const riskScore = calculateRiskScore(route.totalAlerts, route.drivers.length)

    return {
      ...route,
      riskScore
    }
  })
})

// ✅ Funciones helper
const getInitials = (name) => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getAvatarColor = (name) => {
  const colors = [
    '#6A5ACD', '#20B2AA', '#CD853F', '#4169E1', '#FF8C00',
    '#9370DB', '#3CB371', '#DC143C', '#4682B4'
  ]
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return colors[Math.abs(hash) % colors.length]
}

const calculateRiskScore = (totalAlerts, driversCount) => {
  if (driversCount === 0) return 0
  const avgAlerts = totalAlerts / driversCount

  // Escala: 0-2 alertas = bajo, 3-5 = medio, 6-10 = alto, 11+ = crítico
  let score = 0
  if (avgAlerts <= 2) {
    score = avgAlerts * 15
  } else if (avgAlerts <= 5) {
    score = 30 + ((avgAlerts - 2) * 10)
  } else if (avgAlerts <= 10) {
    score = 60 + ((avgAlerts - 5) * 4)
  } else {
    score = 80 + ((avgAlerts - 10) * 2)
  }

  // ✅ Redondear a 1 decimal
  return Math.min(Math.round(score * 10) / 10, 100)
}

// ✅ Filtrar por búsqueda
const filteredRoutes = computed(() => {
  if (!searchQuery.value) return routesData.value

  const query = searchQuery.value.toLowerCase()
  return routesData.value.filter(route =>
    route.name.toLowerCase().includes(query) ||
    route.description.toLowerCase().includes(query)
  )
})

// ✅ Ordenar
const filteredAndSortedRoutes = computed(() => {
  const routes = [...filteredRoutes.value]

  switch (sortBy.value) {
    case 'name':
      return routes.sort((a, b) => a.name.localeCompare(b.name))
    case 'alerts':
      return routes.sort((a, b) => b.totalAlerts - a.totalAlerts)
    case 'risk':
      return routes.sort((a, b) => b.riskScore - a.riskScore)
    default:
      return routes
  }
})
</script>

<style scoped>
table {
  border-collapse: separate;
  border-spacing: 0;
}

tbody tr:last-child {
  border-bottom: none;
}
</style>
