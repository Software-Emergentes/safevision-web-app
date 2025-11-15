<template>
  <div class="trip-card" :class="`status-${trip.status}`">
    <!-- Header del card -->
    <div class="trip-header">
      <div class="trip-route">
        <h4 class="route-title">{{ trip.route }}</h4>
        <span class="trip-date">{{ formatDate(trip.startTime) }}</span>
      </div>
      <span class="status-badge" :class="trip.status">
        {{ getStatusText(trip.status) }}
      </span>
    </div>

    <!-- Información del viaje -->
    <div class="trip-details">
      <div class="detail-row">
        <div class="detail-item">
          <span class="detail-icon">📅</span>
          <div class="detail-content">
            <span class="detail-label">Fecha</span>
            <span class="detail-value">{{ formatFullDate(trip.startTime) }}</span>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-icon">⏱️</span>
          <div class="detail-content">
            <span class="detail-label">Duración</span>
            <span class="detail-value">{{ calculateDuration(trip.startTime, trip.endTime) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-row">
        <div class="detail-item">
          <span class="detail-icon">⚠️</span>
          <div class="detail-content">
            <span class="detail-label">Alertas</span>
            <span class="detail-value">{{ trip.alerts || 0 }}</span>
          </div>
        </div>

        <div class="detail-item">
          <span class="detail-icon">📍</span>
          <div class="detail-content">
            <span class="detail-label">Ruta</span>
            <span class="detail-value">{{ trip.route }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="trip-footer">
      <div class="trip-stats">
    <span class="stat-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
import { ALERT_SEVERITY_LABELS } from '@/utils/constants'

// ✅ Definir props primero
const props = defineProps({
  trip: {
    type: Object,
    required: true
  }
})

// ✅ Definir emits
const emit = defineEmits(['view-details'])

// ✅ Funciones helper
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
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

const getStatusText = (status) => {
  return ALERT_SEVERITY_LABELS[status] || status
}
</script>

<style scoped>
/* ... todos los estilos permanecen igual ... */
.trip-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid transparent;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.trip-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.trip-card.status-safe {
  border-left-color: #00CA75;
  background: linear-gradient(to right, #F0FFF4 0%, white 10%);
}

.trip-card.status-moderate {
  border-left-color: #FFCD18;
  background: linear-gradient(to right, #FFFBEB 0%, white 10%);
}

.trip-card.status-critical {
  border-left-color: #C13515;
  background: linear-gradient(to right, #FFF5F5 0%, white 10%);
}

/* Header */
.trip-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.trip-route {
  flex: 1;
  min-width: 0;
}

.route-title {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 4px 0;
}

.trip-date {
  font-size: 13px;
  color: #74788D;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.safe {
  background: #E8F8F0;
  color: #00CA75;
}

.status-badge.moderate {
  background: #FFF8E1;
  color: #FFA500;
}

.status-badge.critical {
  background: #FFE8E8;
  color: #C13515;
}

/* Detalles */
.trip-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px 0;
  border-top: 1px solid #F5F7FA;
  border-bottom: 1px solid #F5F7FA;
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.detail-icon {
  font-size: 18px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-label {
  font-size: 12px;
  color: #74788D;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #222222;
  font-weight: 600;
}

.trip-footer {
  display: flex;
  justify-content: flex-start; /* ✅ Cambiado de space-between */
  align-items: center;
  gap: 12px;
}

.trip-stats {
  flex: 1;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #74788D;
}

.stat-item svg {
  color: #C13515;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #C13515;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #A72E12;
  transform: translateX(4px);
}

/* Responsive */
@media (max-width: 640px) {
  .trip-header {
    flex-direction: column;
  }

  .status-badge {
    align-self: flex-start;
  }

  .detail-row {
    grid-template-columns: 1fr;
  }

  .trip-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .view-btn {
    justify-content: center;
  }
}

/* ✅ BADGE AZUL PARA LEVE (NO VERDE) */
.status-badge.Low,
.status-badge.low,
.status-badge.safe {
  background: #E3F2FD;
  color: #0066CC;
  border-left-color: #0066CC;
}

.status-badge.Critical,
.status-badge.critical {
  background: #FFE8E8;
  color: #C13515;
  border-left-color: #C13515;
}

.status-badge.High,
.status-badge.high {
  background: #FFF8E1;
  color: #FFA500;
  border-left-color: #FFA500;
}

.status-badge.Medium,
.status-badge.moderate {
  background: #FFFBEB;
  color: #FFCD18;
  border-left-color: #FFCD18;
}

/* Card borders basados en severity */
.trip-card.status-Critical,
.trip-card.status-critical {
  border-left-color: #C13515;
  background: linear-gradient(to right, #FFF5F5 0%, white 10%);
}

.trip-card.status-High,
.trip-card.status-high {
  border-left-color: #FFA500;
  background: linear-gradient(to right, #FFF8E1 0%, white 10%);
}

.trip-card.status-Medium,
.trip-card.status-moderate {
  border-left-color: #FFCD18;
  background: linear-gradient(to right, #FFFBEB 0%, white 10%);
}

/* ✅ AZUL PARA LEVE (NO VERDE) */
.trip-card.status-Low,
.trip-card.status-safe {
  border-left-color: #0066CC;
  background: linear-gradient(to right, #E3F2FD 0%, white 10%);
}
</style>
