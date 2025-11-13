<template>
  <div class="driver-reports-table">
    <div class="table-header">
      <h3 class="table-title">Reporte por Conductor</h3>

      <div class="table-actions">
        <div class="search-box">
          <svg
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

          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar conductor..."
            class="search-input"
          />
        </div>

        <select v-model="sortBy" class="sort-select">
          <option value="name">Ordenar por nombre</option>
          <option value="trips">Ordenar por viajes</option>
          <option value="alerts">Ordenar por alertas</option>
          <option value="safety">Ordenar por seguridad</option>
        </select>
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
        <tr>
          <th>Conductor</th>
          <th>Placa</th>
          <th>Viajes</th>
          <th>Alertas</th>
          <th>Tasa Seguridad</th>
          <th>Horas</th>
          <th>Estado</th>
        </tr>
        </thead>

        <tbody>
        <tr v-if="filteredDrivers.length === 0">
          <td colspan="7" class="empty-row">
            <div class="empty-state">
              <p>No se encontraron conductores</p>
            </div>
          </td>
        </tr>

        <tr
          v-for="driver in filteredDrivers"
          :key="driver.id"
          class="table-row"
          @click="handleRowClick(driver)"
        >
          <td>
            <div class="driver-cell">
              <img
                :src="driver.avatar"
                :alt="driver.name"
                class="driver-avatar"
              />
              <span class="driver-name">{{ driver.name }}</span>
            </div>
          </td>

          <!-- ✅ CORREGIDO: Solo plate -->
          <td>{{ driver.vehicle }}</td>

          <td>
            <span class="badge badge-info">{{ driver.trips }}</span>
          </td>

          <td>
              <span class="badge" :class="getAlertBadgeClass(driver.alerts)">
                {{ driver.alerts }}
              </span>
          </td>

          <td>
            <div class="safety-cell">
                <span
                  class="safety-value"
                  :class="getSafetyClass(driver.safetyRate)"
                >
                  {{ driver.safetyRate }}%
                </span>

              <div class="safety-bar">
                <div
                  class="safety-bar-fill"
                  :style="{
                      width: `${driver.safetyRate}%`,
                      background: getSafetyColor(driver.safetyRate)
                    }"
                ></div>
              </div>
            </div>
          </td>

          <td>{{ driver.hours }}h</td>

          <td>
              <span class="status-badge" :class="driver.status">
                {{ getStatusText(driver.status) }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  drivers: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['row-click'])

const searchQuery = ref('')
const sortBy = ref('name')

// ✅ CORREGIDO: Transformar drivers del store al formato de la tabla
const transformedDrivers = computed(() => {
  return props.drivers.map(driver => {
    let safetyRate = 100
    if (driver.severity === 'Critical') {
      safetyRate = Math.max(50, 100 - (driver.alerts * 3))
    } else if (driver.severity === 'High') {
      safetyRate = Math.max(65, 100 - (driver.alerts * 2))
    } else if (driver.severity === 'Medium') {
      safetyRate = Math.max(75, 100 - (driver.alerts * 1.5))
    } else {
      safetyRate = Math.max(85, 100 - (driver.alerts * 0.5))
    }

    // Soporta vehicle como objeto con .plate, como string o null/undefined
    const plate = driver.vehicle && typeof driver.vehicle === 'object'
      ? (driver.vehicle.plate ?? '')
      : (driver.vehicle ?? '')

    return {
      id: driver.id,
      name: driver.name,
      vehicle: plate || '—', // mostrar guion si no hay placa
      trips: Math.floor(Math.random() * 30) + 20,
      alerts: driver.alerts,
      safetyRate: Math.round(safetyRate),
      hours: Math.floor(Math.random() * 200) + 100,
      status: driver.status,
      avatar: driver.avatar
    }
  })
})

const filteredDrivers = computed(() => {
  let result = [...transformedDrivers.value]

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(driver =>
      driver.name.toLowerCase().includes(query) ||
      (driver.vehicle || '').toLowerCase().includes(query)
    )
  }

  result.sort((a, b) => {
    switch (sortBy.value) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'trips':
        return b.trips - a.trips
      case 'alerts':
        return b.alerts - a.alerts
      case 'safety':
        return b.safetyRate - a.safetyRate
      default:
        return 0
    }
  })

  return result
})






const getAlertBadgeClass = (alerts) => {
  if (alerts <= 5) return 'badge-success'
  if (alerts <= 15) return 'badge-warning'
  return 'badge-danger'
}

const getSafetyClass = (rate) => {
  if (rate >= 85) return 'safety-high'
  if (rate >= 70) return 'safety-medium'
  return 'safety-low'
}

const getSafetyColor = (rate) => {
  if (rate >= 85) return 'linear-gradient(90deg, #00CA75 0%, #00A060 100%)'
  if (rate >= 70) return 'linear-gradient(90deg, #FFCD18 0%, #FFA500 100%)'
  return 'linear-gradient(90deg, #C13515 0%, #8B2810 100%)'
}

const getStatusText = (status) => {
  const statusMap = {
    active: 'Activo',
    resting: 'Descansando',
    offline: 'Desconectado'
  }
  return statusMap[status] || status
}

const handleRowClick = (driver) => {
  emit('row-click', driver)
}
</script>

<style scoped>
.driver-reports-table {
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

.driver-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.driver-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.driver-name {
  font-weight: 600;
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

.safety-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.safety-value {
  font-weight: 600;
  font-size: 14px;
}

.safety-value.safety-high {
  color: #00CA75;
}

.safety-value.safety-medium {
  color: #FFA500;
}

.safety-value.safety-low {
  color: #C13515;
}

.safety-bar {
  width: 80px;
  height: 6px;
  background: #F5F7FA;
  border-radius: 3px;
  overflow: hidden;
}

.safety-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #E8F8F0;
  color: #00CA75;
}

.status-badge.resting {
  background: #FFF8E1;
  color: #FFA500;
}

.status-badge.offline {
  background: #F5F7FA;
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
}
</style>
