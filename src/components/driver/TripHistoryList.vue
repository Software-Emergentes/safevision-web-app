<template>
  <div class="flex flex-col gap-5">
    <!-- Header con filtros -->
    <div class="flex justify-between items-center flex-wrap gap-4 mb-2">
      <h3 class="text-xl font-semibold text-gray-900 m-0">Historial de Viajes</h3>
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          :class="[
            'py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 text-[13px] font-semibold cursor-pointer transition-all duration-300',
            selectedStatus === filter.value ? 'bg-primary border-primary text-white' : 'hover:bg-gray-200 hover:border-primary'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-[60px] gap-4 text-gray-500">
      <div class="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
      <p>Cargando historial...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTrips.length === 0" class="flex flex-col items-center justify-center py-[60px] text-gray-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 mb-4">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <p>No hay viajes registrados</p>
    </div>

    <!-- Lista de viajes -->
    <div v-else class="flex flex-col gap-4">
      <TripHistoryCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :trip="trip"
        @view-details="handleViewTripDetails"
      />
    </div>

    <!-- Paginación -->
    <div v-if="filteredTrips.length > 0" class="flex justify-center pt-2">
      <p class="text-sm text-gray-500 m-0">
        Mostrando {{ filteredTrips.length }} de {{ trips.length }} viajes
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TripHistoryCard from './TripHistoryCard.vue'
import { ALERT_SEVERITY } from '@/utils/constants'

const props = defineProps({
  trips: {
    type: Array,
    required: true,
    default: () => []
  },
  isLoading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['view-trip-details'])

const selectedStatus = ref('all')

const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Críticos', value: ALERT_SEVERITY.CRITICAL },
  { label: 'Altos', value: ALERT_SEVERITY.HIGH },
  { label: 'Moderados', value: ALERT_SEVERITY.MEDIUM },
  { label: 'Leves', value: ALERT_SEVERITY.LOW }
]

const filteredTrips = computed(() => {
  if (selectedStatus.value === 'all') {
    return props.trips
  }
  return props.trips.filter(trip => trip.status === selectedStatus.value)
})

const handleViewTripDetails = (trip) => {
  emit('view-trip-details', trip)
}
</script>
