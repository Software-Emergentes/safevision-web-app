<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-bold text-gray-900">Reporte por Conductor</h3>

      <div class="flex gap-3">
        <!-- Buscar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar conductor..."
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
          <option value="safetyRate">Ordenar por seguridad</option>
        </select>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
        <tr class="border-b border-gray-200">
          <th class="text-left py-3 px-4 text-sm font-semibold text-gray-600">CONDUCTOR</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">ALERTAS</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">SEGURIDAD</th>
          <th class="text-center py-3 px-4 text-sm font-semibold text-gray-600">ESTADO</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="driver in filteredAndSortedDrivers"
          :key="driver.id"
          class="border-b border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <!-- Conductor -->
          <td class="py-4 px-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                :style="{ backgroundColor: driver.avatarColor }"
              >
                {{ driver.initials }}
              </div>
              <div>
                <p class="font-semibold text-gray-900">{{ driver.name }}</p>
                <p class="text-xs text-gray-500">ID: {{ driver.id }}</p>
              </div>
            </div>
          </td>

          <!-- Alertas -->
          <td class="py-4 px-4 text-center">
            <div class="flex items-center justify-center gap-2">
                <span
                  class="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold"
                  :class="{
                    'bg-red-100 text-red-700': driver.alerts > 5,
                    'bg-orange-100 text-orange-700': driver.alerts > 0 && driver.alerts <= 5,
                    'bg-green-100 text-green-700': driver.alerts === 0
                  }"
                >
                  {{ driver.alerts }}
                </span>
              <span
                v-if="driver.severity"
                class="px-2 py-1 rounded text-xs font-semibold"
                :class="{
                    'bg-red-100 text-red-700': driver.severity === 'Critical',
                    'bg-orange-100 text-orange-700': driver.severity === 'High',
                    'bg-yellow-100 text-yellow-700': driver.severity === 'Medium',
                    'bg-blue-100 text-blue-700': driver.severity === 'Low'
                  }"
              >
                  {{ getSeverityLabel(driver.severity) }}
                </span>
            </div>
          </td>

          <!-- Seguridad -->
          <td class="py-4 px-4">
            <div class="flex flex-col items-center gap-1">
                <span
                  class="text-sm font-bold"
                  :class="{
                    'text-green-600': driver.safetyRate >= 80,
                    'text-yellow-600': driver.safetyRate >= 50 && driver.safetyRate < 80,
                    'text-red-600': driver.safetyRate < 50
                  }"
                >
                  {{ driver.safetyRate }}%
                </span>
              <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-300"
                  :class="{
                      'bg-green-500': driver.safetyRate >= 80,
                      'bg-yellow-500': driver.safetyRate >= 50 && driver.safetyRate < 80,
                      'bg-red-500': driver.safetyRate < 50
                    }"
                  :style="{ width: driver.safetyRate + '%' }"
                ></div>
              </div>
            </div>
          </td>

          <!-- Estado -->
          <td class="py-4 px-4 text-center">
              <span
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                :class="{
                  'bg-green-100 text-green-700': driver.status === 'active',
                  'bg-yellow-100 text-yellow-700': driver.status === 'resting',
                  'bg-gray-100 text-gray-700': driver.status === 'offline'
                }"
              >
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-green-500': driver.status === 'active',
                    'bg-yellow-500': driver.status === 'resting',
                    'bg-gray-500': driver.status === 'offline'
                  }"
                ></span>
                {{ getStatusLabel(driver.status) }}
              </span>
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Sin resultados -->
      <div
        v-if="filteredAndSortedDrivers.length === 0"
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
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <p class="text-gray-500 text-sm">No se encontraron conductores</p>
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

// ✅ Función para obtener iniciales
const getInitials = (name) => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// ✅ Función para generar color de avatar consistente
const getAvatarColor = (name) => {
  const colors = [
    '#6A5ACD', // Púrpura
    '#20B2AA', // Turquesa
    '#CD853F', // Marrón
    '#4169E1', // Azul
    '#FF8C00', // Naranja
    '#9370DB', // Violeta
    '#3CB371', // Verde
    '#DC143C', // Rojo
    '#4682B4'  // Azul acero
  ]

  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)

  return colors[Math.abs(hash) % colors.length]
}

// ✅ Calcular tasa de seguridad basada en alertas
const calculateSafetyRate = (alerts) => {
  if (alerts === 0) return 100
  if (alerts <= 2) return 92
  if (alerts <= 5) return 78
  if (alerts <= 10) return 65
  return 45
}

// ✅ Mapear datos de conductores con cálculos reales
const mappedDrivers = computed(() => {
  return props.drivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    initials: getInitials(driver.name),
    avatarColor: getAvatarColor(driver.name),
    alerts: driver.alerts || 0,
    severity: driver.severity,
    safetyRate: calculateSafetyRate(driver.alerts || 0),
    status: driver.status || 'offline'
  }))
})

// ✅ Filtrar por búsqueda
const filteredDrivers = computed(() => {
  if (!searchQuery.value) return mappedDrivers.value

  const query = searchQuery.value.toLowerCase()
  return mappedDrivers.value.filter(driver =>
    driver.name.toLowerCase().includes(query) ||
    driver.id.toString().includes(query)
  )
})

// ✅ Ordenar
const filteredAndSortedDrivers = computed(() => {
  const drivers = [...filteredDrivers.value]

  switch (sortBy.value) {
    case 'name':
      return drivers.sort((a, b) => a.name.localeCompare(b.name))
    case 'alerts':
      return drivers.sort((a, b) => b.alerts - a.alerts)
    case 'safetyRate':
      return drivers.sort((a, b) => b.safetyRate - a.safetyRate)
    default:
      return drivers
  }
})

// ✅ Labels en español
const getSeverityLabel = (severity) => {
  const labels = {
    'Critical': 'Crítico',
    'High': 'Alto',
    'Medium': 'Medio',
    'Low': 'Bajo'
  }
  return labels[severity] || severity
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Activo',
    'resting': 'Descansando',
    'offline': 'Desconectado'
  }
  return labels[status] || status
}
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
