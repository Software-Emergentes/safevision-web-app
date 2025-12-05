<template>
  <div :class="['bg-white rounded-xl p-5 border-l-4 transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md', borderClass]">
    <div class="flex justify-between items-start mb-4 gap-3">
      <div class="flex-1 min-w-0">
        <h4 class="text-base font-semibold text-gray-900 m-0">{{ trip.route }}</h4>
        <span class="text-[13px] text-gray-500">{{ formatDate(trip.startTime) }}</span>
      </div>
      <span :class="['py-1.5 px-3 rounded-[20px] text-xs font-semibold whitespace-nowrap', statusClass]">
        {{ getStatusBadgeText(trip) }}
      </span>
    </div>

    <div class="flex flex-col gap-3 mb-4 py-4 border-t border-b border-gray-100">
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-2.5">
          <span class="text-lg">📅</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-medium">Fecha</span>
            <span class="text-sm text-gray-900 font-semibold">{{ formatFullDate(trip.startTime) }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-lg">⏱️</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-medium">Duración</span>
            <span class="text-sm text-gray-900 font-semibold">{{ getTripDuration(trip) }}</span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center gap-2.5">
          <span class="text-lg">⚠️</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-medium">Alertas</span>
            <span class="text-sm text-gray-900 font-semibold">{{ trip.alerts || 0 }}</span>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-lg">📊</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-medium">Estado</span>
            <span class="text-sm text-gray-900 font-semibold">{{ getTripStatusText(trip.tripStatus) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between items-center gap-3">
      <div class="flex-1">
        <span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ getTripDuration(trip) }}
        </span>
      </div>

      <span v-if="trip.alerts > 0" :class="['inline-flex items-center gap-1.5 text-[13px] font-semibold', getSeverityTextClass(trip.status)]">
        {{ getSeverityLabel(trip.status) }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  trip: { type: Object, required: true }
})

defineEmits(['view-details'])

// ✅ Mapeo de severity (basado en alertas) a colores
const borderClass = computed(() => {
  const classes = {
    'Critical': 'border-l-primary bg-gradient-to-r from-red-50 to-white',
    'High': 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white',
    'Medium': 'border-l-warning bg-gradient-to-r from-yellow-50 to-white',
    'Low': 'border-l-info bg-gradient-to-r from-blue-50 to-white',
    'Safe': 'border-l-success bg-gradient-to-r from-green-50 to-white'
  }
  return classes[props.trip.status] || classes['Low']
})

const statusClass = computed(() => {
  const classes = {
    'Critical': 'bg-red-100 text-primary',
    'High': 'bg-orange-100 text-orange-500',
    'Medium': 'bg-yellow-100 text-warning',
    'Low': 'bg-blue-100 text-info',
    'Safe': 'bg-green-100 text-success'
  }
  return classes[props.trip.status] || classes['Low']
})

// ✅ Obtener duración del viaje
const getTripDuration = (trip) => {
  if (trip.durationMinutes) {
    const hours = Math.floor(trip.durationMinutes / 60)
    const minutes = trip.durationMinutes % 60

    if (hours === 0) {
      return `${minutes}min`
    }
    return `${hours}h ${minutes}min`
  }

  // Fallback: calcular desde startTime y endTime
  if (!trip.startTime) return '0min'

  const start = new Date(trip.startTime)
  const end = trip.endTime ? new Date(trip.endTime) : new Date()
  const diffMs = end - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes}min`
  }
  return `${hours}h ${minutes}min`
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatFullDate = (date) => {
  if (!date) return 'N/A'
  const d = new Date(date)
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ✅ Mapeo de tripStatus (string del backend) a texto español
const getTripStatusText = (statusString) => {
  const statusMap = {
    'Initiated': 'Iniciado',
    'InProgress': 'En Progreso',
    'Completed': 'Completado',
    'Cancelled': 'Cancelado',
    'Unknown': 'Desconocido'
  }
  return statusMap[statusString] || statusString
}

// ✅ Badge del estado basado en la cantidad de alertas
const getStatusBadgeText = (trip) => {
  if (trip.alerts === 0) {
    return '✓ Seguro'
  } else if (trip.alerts >= 10) {
    return '⚠ Crítico'
  } else if (trip.alerts >= 5) {
    return '⚠ Alto'
  } else if (trip.alerts >= 2) {
    return '⚠ Moderado'
  } else {
    return '⚠ Leve'
  }
}

const getSeverityLabel = (severity) => {
  const labels = {
    'Critical': 'Nivel Crítico',
    'High': 'Nivel Alto',
    'Medium': 'Nivel Moderado',
    'Low': 'Nivel Leve',
    'Safe': 'Seguro'
  }
  return labels[severity] || severity
}

const getSeverityTextClass = (severity) => {
  const classes = {
    'Critical': 'text-primary',
    'High': 'text-orange-500',
    'Medium': 'text-warning',
    'Low': 'text-info',
    'Safe': 'text-success'
  }
  return classes[severity] || 'text-gray-500'
}
</script>
