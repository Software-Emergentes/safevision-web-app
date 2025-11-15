<template>
  <div :class="['bg-white rounded-xl p-5 border-l-4 transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md', borderClass]">
    <div class="flex justify-between items-start mb-4 gap-3">
      <div class="flex-1 min-w-0">
        <h4 class="text-base font-semibold text-gray-900 m-0">{{ trip.route }}</h4>
        <span class="text-[13px] text-gray-500">{{ formatDate(trip.startTime) }}</span>
      </div>
      <span :class="['py-1.5 px-3 rounded-[20px] text-xs font-semibold whitespace-nowrap', statusClass]">
        {{ getStatusText(trip.status) }}
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
            <span class="text-sm text-gray-900 font-semibold">{{ calculateDuration(trip.startTime, trip.endTime) }}</span>
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
          <span class="text-lg">📍</span>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs text-gray-500 font-medium">Ruta</span>
            <span class="text-sm text-gray-900 font-semibold">{{ trip.route }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-start items-center gap-3">
      <div class="flex-1">
        <span class="inline-flex items-center gap-1.5 text-[13px] text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          Duración: {{ calculateDuration(trip.startTime, trip.endTime) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ALERT_SEVERITY_LABELS } from '@/utils/constants'

const props = defineProps({
  trip: { type: Object, required: true }
})

defineEmits(['view-details'])

const borderClass = computed(() => {
  const classes = {
    'Critical': 'border-l-primary bg-gradient-to-r from-red-50 to-white',
    'High': 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white',
    'Medium': 'border-l-warning bg-gradient-to-r from-yellow-50 to-white',
    'Low': 'border-l-info bg-gradient-to-r from-blue-50 to-white',
    'Safe': 'border-l-info bg-gradient-to-r from-blue-50 to-white'
  }
  return classes[props.trip.status] || classes['Low']
})

const statusClass = computed(() => {
  const classes = {
    'Critical': 'bg-red-100 text-primary',
    'High': 'bg-orange-100 text-orange-500',
    'Medium': 'bg-yellow-100 text-warning',
    'Low': 'bg-blue-100 text-info',
    'Safe': 'bg-blue-100 text-info'
  }
  return classes[props.trip.status] || classes['Low']
})

const calculateDuration = (startTime, endTime) => {
  if (!startTime) return '0h 0m'
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diffMs = end - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
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

const getStatusText = (status) => {
  return ALERT_SEVERITY_LABELS[status] || status
}
</script>
