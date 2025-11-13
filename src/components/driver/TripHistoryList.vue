<template>
  <div class="trip-history-container">
    <!-- Header con filtros -->
    <div class="history-header">
      <h3 class="history-title">Historial de Viajes</h3>
      <div class="filter-buttons">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          @click="selectedStatus = filter.value"
          class="filter-btn"
          :class="{ active: selectedStatus === filter.value }"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando historial...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredTrips.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="1" y="3" width="15" height="13"></rect>
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
        <circle cx="5.5" cy="18.5" r="2.5"></circle>
        <circle cx="18.5" cy="18.5" r="2.5"></circle>
      </svg>
      <p>No hay viajes registrados</p>
    </div>

    <!-- Lista de viajes -->
    <div v-else class="trips-list">
      <TripHistoryCard
        v-for="trip in filteredTrips"
        :key="trip.id"
        :trip="trip"
        @view-details="handleViewTripDetails"
      />
    </div>

    <!-- Paginación (opcional) -->
    <div v-if="filteredTrips.length > 0" class="pagination">
      <p class="pagination-info">
        Mostrando {{ filteredTrips.length }} de {{ trips.length }} viajes
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TripHistoryCard from './TripHistoryCard.vue'
import { ALERT_SEVERITY } from '@/utils/constants'  // ✅ AGREGAR AL TOP

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

// Estado local
const selectedStatus = ref('all')

// ✅ FILTROS BASADOS EN SEVERITY DEL DB
const statusFilters = [
  { label: 'Todos', value: 'all' },
  { label: 'Críticos', value: ALERT_SEVERITY.CRITICAL },
  { label: 'Altos', value: ALERT_SEVERITY.HIGH },
  { label: 'Moderados', value: ALERT_SEVERITY.MEDIUM },
  { label: 'Leves', value: ALERT_SEVERITY.LOW }
]

// Computed: filtrar viajes por estado
const filteredTrips = computed(() => {
  if (selectedStatus.value === 'all') {
    return props.trips
  }
  return props.trips.filter(trip => trip.status === selectedStatus.value)
})

// Métodos
const handleViewTripDetails = (trip) => {
  emit('view-trip-details', trip)
}
</script>

<style scoped>
.trip-history-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Header */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 8px;
}

.history-title {
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 8px 16px;
  background: #F5F7FA;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  color: #74788D;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: #E9ECEF;
  border-color: #C13515;
}

.filter-btn.active {
  background: #C13515;
  border-color: #C13515;
  color: white;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  color: #74788D;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E9ECEF;
  border-top-color: #C13515;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #74788D;
}

.empty-state svg {
  color: #ADB5BD;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

/* Lista de viajes */
.trips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}

.pagination-info {
  font-size: 14px;
  color: #74788D;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .history-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-buttons {
    width: 100%;
  }

  .filter-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>
