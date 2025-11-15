<template>
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex justify-between items-center mb-6 flex-wrap gap-4">
      <h3 class="text-lg font-semibold text-gray-900 m-0">Reporte por Ruta</h3>
      <div class="flex gap-3 flex-wrap">
        <div class="relative flex items-center">
          <svg class="absolute left-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar ruta..."
            class="py-2 px-3 pl-9 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-100 transition-all duration-300 w-[200px] focus:outline-none focus:border-primary focus:bg-white placeholder:text-gray-400"
          />
        </div>
        <select
          v-model="sortBy"
          class="py-2 px-3 border border-gray-200 rounded-lg text-sm text-gray-900 bg-white cursor-pointer transition-all duration-300 focus:outline-none focus:border-primary"
        >
          <option value="name">Ordenar por nombre</option>
          <option value="trips">Ordenar por viajes</option>
          <option value="alerts">Ordenar por alertas</option>
        </select>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full border-collapse">
        <thead>
        <tr class="border-b-2 border-gray-200">
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ruta</th>
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Viajes</th>
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Duración Promedio</th>
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Alertas Totales</th>
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Índice de Riesgo</th>
          <th class="py-3 px-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Conductores</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredRoutes.length === 0">
          <td colspan="6" class="py-10 text-center">
            <div class="flex flex-col items-center justify-center text-gray-500">
              <p>No se encontraron rutas</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="route in filteredRoutes"
          :key="route.id"
          class="border-b border-gray-100 transition-all duration-300 cursor-pointer hover:bg-gray-50"
          @click="handleRowClick(route)"
        >
          <td class="py-4 px-3 text-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-[10px] bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="font-semibold text-sm text-gray-900">{{ route.name }}</span>
              </div>
            </div>
          </td>
          <td class="py-4 px-3">
            <span class="inline-block py-1 px-3 bg-blue-50 text-info rounded-xl text-xs font-semibold">{{ route.trips }}</span>
          </td>
          <td class="py-4 px-3 text-sm text-gray-900">{{ route.avgDuration }}</td>
          <td class="py-4 px-3">
              <span :class="['inline-block py-1 px-3 rounded-xl text-xs font-semibold', getAlertBadgeClass(route.totalAlerts)]">
                {{ route.totalAlerts }}
              </span>
          </td>
          <td class="py-4 px-3">
            <div class="flex flex-col gap-1.5">
                <span :class="['font-semibold text-sm', getRiskClass(route.riskIndex)]">
                  {{ route.riskIndex }}/100
                </span>
              <div class="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  :style="{
                      width: `${route.riskIndex}%`,
                      background: getRiskColor(route.riskIndex)
                    }"
                  class="h-full rounded-full transition-all duration-600"
                ></div>
              </div>
            </div>
          </td>
          <td class="py-4 px-3">
            <div class="flex items-center gap-1">
              <img
                v-for="(driver, index) in route.drivers.slice(0, 3)"
                :key="index"
                :src="driver.avatar"
                :alt="driver.name"
                class="w-7 h-7 rounded-full border-2 border-white object-cover cursor-pointer transition-all duration-300 hover:scale-120 hover:z-10"
                :title="driver.name"
              />
              <span v-if="route.drivers.length > 3" class="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-semibold text-gray-500">
                  +{{ route.drivers.length - 3 }}
                </span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-5 pt-4 border-t border-gray-200 flex justify-center">
      <p class="text-sm text-gray-500 m-0">
        Mostrando {{ filteredRoutes.length }} de {{ routes.length }} rutas
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'

const dashboardStore = useDashboardStore()
const emit = defineEmits(['row-click', 'view-details'])

const searchQuery = ref('')
const sortBy = ref('name')

const routes = computed(() => {
  const routesMap = {}

  dashboardStore.drivers.forEach(driver => {
    const routeName = driver.currentTrip?.route || 'Sin ruta asignada'

    if (!routesMap[routeName]) {
      routesMap[routeName] = {
        id: Object.keys(routesMap).length + 1,
        name: routeName,
        trips: 0,
        totalAlerts: 0,
        drivers: [],
        durations: []
      }
    }

    if (driver.currentTrip) {
      routesMap[routeName].trips += 1
    }

    routesMap[routeName].totalAlerts += driver.alerts
    routesMap[routeName].drivers.push({
      name: driver.name,
      avatar: driver.avatar
    })

    if (driver.currentTrip?.startTime) {
      const start = new Date(driver.currentTrip.startTime)
      const now = new Date()
      const diffMs = now - start
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      routesMap[routeName].durations.push(hours)
    }
  })

  return Object.values(routesMap).map(route => {
    const avgHours = route.durations.length > 0
      ? Math.floor(route.durations.reduce((a, b) => a + b, 0) / route.durations.length)
      : 0

    const avgMinutes = Math.floor(Math.random() * 60)

    const avgAlertsPerDriver = route.drivers.length > 0
      ? route.totalAlerts / route.drivers.length
      : 0

    let riskIndex = 0
    if (avgAlertsPerDriver >= 5) {
      riskIndex = Math.min(100, Math.floor(avgAlertsPerDriver * 10))
    } else if (avgAlertsPerDriver >= 3) {
      riskIndex = Math.floor(avgAlertsPerDriver * 8)
    } else {
      riskIndex = Math.floor(avgAlertsPerDriver * 5)
    }

    return {
      ...route,
      avgDuration: `${avgHours}h ${avgMinutes}min`,
      riskIndex: riskIndex
    }
  })
})

const filteredRoutes = computed(() => {
  let result = [...routes.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(route =>
      route.name.toLowerCase().includes(query)
    )
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'trips':
        return b.trips - a.trips
      case 'alerts':
        return b.totalAlerts - a.totalAlerts
      default:
        return 0
    }
  })

  return result
})

const getAlertBadgeClass = (alerts) => {
  if (alerts <= 20) return 'bg-green-50 text-success'
  if (alerts <= 40) return 'bg-yellow-50 text-warning'
  return 'bg-red-50 text-primary'
}

const getRiskClass = (risk) => {
  if (risk <= 40) return 'text-success'
  if (risk <= 70) return 'text-warning'
  return 'text-primary'
}

const getRiskColor = (risk) => {
  if (risk <= 40) return 'linear-gradient(90deg, #00CA75 0%, #00A060 100%)'
  if (risk <= 70) return 'linear-gradient(90deg, #FFCD18 0%, #FFA500 100%)'
  return 'linear-gradient(90deg, #C13515 0%, #8B2810 100%)'
}

const handleRowClick = (route) => {
  emit('row-click', route)
}
</script>
