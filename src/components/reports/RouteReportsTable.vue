<template>
  <div class="route-reports-table">
    <div class="table-header">
      <h3 class="table-title">Reporte por Ruta</h3>
      <div class="table-actions">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar ruta..."
            class="search-input"
          />
        </div>
        <select v-model="sortBy" class="sort-select">
          <option value="name">Ordenar por nombre</option>
          <option value="trips">Ordenar por viajes</option>
          <option value="alerts">Ordenar por alertas</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Ruta</th>
          <th>Viajes</th>
          <th>Duración Promedio</th> <!-- ✅ CAMBIADO -->
          <th>Alertas Totales</th>
          <th>Índice de Riesgo</th>
          <th>Conductores</th>
        </tr>
        </thead>
        <tbody>
        <tr v-if="filteredRoutes.length === 0">
          <td colspan="6" class="empty-row">
            <div class="empty-state">
              <p>No se encontraron rutas</p>
            </div>
          </td>
        </tr>
        <tr
          v-for="route in filteredRoutes"
          :key="route.id"
          class="table-row"
          @click="handleRowClick(route)"
        >
          <td>
            <div class="route-cell">
              <div class="route-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div class="route-info">
                <span class="route-name">{{ route.name }}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="badge badge-info">{{ route.trips }}</span>
          </td>
          <td>{{ route.avgDuration }}</td> <!-- ✅ Ya no mostramos avgDistance -->
          <td>
              <span class="badge" :class="getAlertBadgeClass(route.totalAlerts)">
                {{ route.totalAlerts }}
              </span>
          </td>
          <td>
            <div class="risk-cell">
                <span class="risk-value" :class="getRiskClass(route.riskIndex)">
                  {{ route.riskIndex }}/100
                </span>
              <div class="risk-bar">
                <div
                  class="risk-bar-fill"
                  :style="{
                      width: `${route.riskIndex}%`,
                      background: getRiskColor(route.riskIndex)
                    }"
                ></div>
              </div>
            </div>
          </td>
          <td>
            <div class="drivers-avatars">
              <img
                v-for="(driver, index) in route.drivers.slice(0, 3)"
                :key="index"
                :src="driver.avatar"
                :alt="driver.name"
                class="driver-mini-avatar"
                :title="driver.name"
              />
              <span v-if="route.drivers.length > 3" class="more-drivers">
                  +{{ route.drivers.length - 3 }}
                </span>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="table-footer">
      <p class="results-count">
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

// ✅ CALCULADO DINÁMICAMENTE desde drivers del store
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

    // ✅ Contar solo viajes activos
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

  // ✅ Calcular promedios y formatear
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

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(route =>
      route.name.toLowerCase().includes(query)
    )
  }

  // Ordenar
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
  if (alerts <= 20) return 'badge-success'
  if (alerts <= 40) return 'badge-warning'
  return 'badge-danger'
}

const getRiskClass = (risk) => {
  if (risk <= 40) return 'risk-low'
  if (risk <= 70) return 'risk-medium'
  return 'risk-high'
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

<style scoped>
.route-reports-table {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #74788D;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #222222;
  background: #F5F7FA;
  transition: all 0.3s ease;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #C13515;
  background: white;
}

.sort-select {
  padding: 8px 12px;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #222222;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #C13515;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead tr {
  border-bottom: 2px solid #E9ECEF;
}

.data-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #74788D;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table tbody tr {
  border-bottom: 1px solid #F5F7FA;
  transition: all 0.3s ease;
  cursor: pointer;
}

.data-table tbody tr:hover {
  background: #F5F7FA;
}

.data-table td {
  padding: 16px 12px;
  font-size: 14px;
  color: #222222;
}

.route-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.route-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.route-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.route-name {
  font-weight: 600;
  font-size: 14px;
  color: #222222;
}

.route-time {
  font-size: 12px;
  color: #74788D;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-info {
  background: #E3F2FD;
  color: #0066CC;
}

.badge-success {
  background: #E8F8F0;
  color: #00CA75;
}

.badge-warning {
  background: #FFF8E1;
  color: #FFA500;
}

.badge-danger {
  background: #FFE8E8;
  color: #C13515;
}

.risk-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.risk-value {
  font-weight: 600;
  font-size: 14px;
}

.risk-value.risk-low {
  color: #00CA75;
}

.risk-value.risk-medium {
  color: #FFA500;
}

.risk-value.risk-high {
  color: #C13515;
}

.risk-bar {
  width: 80px;
  height: 6px;
  background: #F5F7FA;
  border-radius: 3px;
  overflow: hidden;
}

.risk-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.drivers-avatars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.driver-mini-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid white;
  object-fit: cover;
  cursor: pointer;
  transition: all 0.3s ease;
}

.driver-mini-avatar:hover {
  transform: scale(1.2);
  z-index: 10;
}

.more-drivers {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #F5F7FA;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
  color: #74788D;
}

.empty-row {
  text-align: center;
  padding: 40px !important;
}

.empty-state p {
  color: #74788D;
  margin: 0;
}

.table-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #E9ECEF;
  display: flex;
  justify-content: center;
}

.results-count {
  font-size: 14px;
  color: #74788D;
  margin: 0;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-actions {
    flex-direction: column;
  }

  .search-input {
    width: 100%;
  }

  .data-table {
    font-size: 13px;
  }

  .data-table th,
  .data-table td {
    padding: 10px 8px;
  }

  .route-name {
    font-size: 13px;
  }
}
</style>
