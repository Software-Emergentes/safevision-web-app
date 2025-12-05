<template>
  <div
    :class="[
      'bg-white rounded-xl p-5 shadow-sm transition-all duration-300 cursor-pointer border-l-4',
      'hover:-translate-y-1 hover:shadow-xl',
      borderColors[driver.severity] || borderColors['Safe']
    ]"
    @click="handleClick"
  >
    <!-- Header -->
    <div class="flex items-center gap-4 mb-4">
      <div class="relative w-14 h-14 flex-shrink-0">
        <img :src="driver.avatar" :alt="driver.name" class="w-full h-full rounded-full object-cover" />
        <span :class="['absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white', statusColors[driver.status]]"></span>
      </div>

      <div class="flex-1 min-w-0">
        <h3 class="text-base font-semibold text-gray-900 m-0 truncate">{{ driver.name }}</h3>
        <p class="text-sm text-gray-500 m-0">🚌 {{ driver.vehicle?.plate || 'N/A' }}</p>
      </div>

      <div
        v-if="driver.alerts === 0"
        class="w-10 h-10 rounded-[10px] flex items-center justify-center bg-green-50 text-success"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      <div
        v-else
        :class="['w-10 h-10 rounded-[10px] flex items-center justify-center text-xl flex-shrink-0', badgeColors[driver.severity] || badgeColors['Safe']]"
      >
        <span class="flex items-center justify-center" v-html="getSeverityIcon(driver.severity)"></span>
      </div>
    </div>

    <!-- Details -->
    <div class="grid grid-cols-2 gap-3 mb-4 py-4 border-t border-b border-gray-200">
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 font-medium">Ruta</span>
        <span class="text-sm text-gray-900 font-semibold">{{ driver.currentTrip?.route || 'Sin ruta activa' }}</span>
      </div>
      <div class="flex flex-col gap-1">
        <span class="text-xs text-gray-500 font-medium">Licencia</span>
        <span class="text-sm text-gray-900 font-semibold">{{ driver.licenseNumber || 'N/A' }}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="flex justify-between items-center gap-3">
      <div class="flex flex-col gap-1 flex-1">
        <span v-if="driver.alerts === 0" class="flex items-center gap-1.5 text-[13px] text-success font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Sin alertas
        </span>
        <template v-else>
          <span class="text-[13px] text-gray-900 font-semibold">⚠️ {{ driver.alerts }} {{ driver.alerts === 1 ? 'alerta' : 'alertas' }}</span>
          <span class="text-xs text-gray-500">{{ driver.lastAlert }}</span>
        </template>
      </div>
      <button
        @click.stop="viewDetails"
        class="py-2 px-4 bg-primary text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap hover:bg-primary-dark hover:scale-105"
      >
        Ver detalles →
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  driver: { type: Object, required: true }
})

const emit = defineEmits(['click', 'view-details'])
const router = useRouter()

const borderColors = {
  'Safe': 'border-l-success bg-gradient-to-r from-green-50 to-white',
  'Low': 'border-l-info bg-gradient-to-r from-blue-50 to-white',
  'Medium': 'border-l-warning bg-gradient-to-r from-yellow-50 to-white',
  'High': 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white',
  'Critical': 'border-l-primary bg-gradient-to-r from-red-50 to-white'
}

const badgeColors = {
  'Safe': 'bg-green-50 text-success',
  'Low': 'bg-blue-50 text-info',
  'Medium': 'bg-yellow-50 text-warning',
  'High': 'bg-orange-50 text-orange-500',
  'Critical': 'bg-red-50 text-primary'
}

const statusColors = {
  active: 'bg-success',
  resting: 'bg-warning',
  offline: 'bg-gray-500'
}

const getSeverityIcon = (severity) => {
  const icons = {
    'Low': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="9"></circle><line x1="12" y1="8" x2="12" y2="12"></line><circle cx="12" cy="16" r="1"></circle></svg>',
    'Medium': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
    'High': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    'Critical': '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13" stroke="white" stroke-width="2"></line><line x1="12" y1="17" x2="12.01" y2="17" stroke="white" stroke-width="2"></line></svg>'
  }
  return icons[severity] || icons['Low']
}

const handleClick = () => emit('click', props.driver)

const viewDetails = () => {
  emit('view-details', props.driver)
  router.push({ name: 'driver-detail', params: { id: props.driver.id } })
}
</script>
