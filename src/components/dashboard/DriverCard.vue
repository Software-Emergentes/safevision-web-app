<template>
  <div
    class="driver-card"
    :class="getSeverityClass(driver.severity)"
    @click="handleClick"
  >
    <div class="driver-header">
      <div class="driver-avatar">
        <img :src="driver.avatar" :alt="driver.name" />
        <span class="status-indicator" :class="driver.status"></span>
      </div>

      <div class="driver-info">
        <h3 class="driver-name">{{ driver.name }}</h3>
        <p class="driver-vehicle">🚌 {{ driver.vehicle?.plate || 'N/A' }}</p>
      </div>

      <div v-if="driver.alerts === 0" class="alert-badge severity-safe">
        <span class="alert-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </span>
      </div>
      <div v-else class="alert-badge" :class="getSeverityClass(driver.severity)">
        <span class="alert-icon" v-html="getSeverityIcon(driver.severity)"></span>
      </div>
    </div>

    <div class="driver-details">
      <div class="detail-item">
        <span class="detail-label">Ruta</span>
        <span class="detail-value">{{ driver.currentTrip?.route || 'Sin ruta activa' }}</span>
      </div>

      <div class="detail-item">
        <span class="detail-label">Licencia</span>
        <span class="detail-value">{{ driver.licenseNumber || 'N/A' }}</span>
      </div>

      <div class="detail-item" v-if="driver.currentTrip">
        <span class="detail-label">Tiempo en ruta</span>
        <span class="detail-value">{{ calculateTripDuration(driver.currentTrip.startTime) }}</span>
      </div>
    </div>

    <div class="driver-footer">
      <div class="footer-info">
        <span v-if="driver.alerts === 0" class="no-alerts">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Sin alertas
        </span>
        <template v-else>
          <span class="alert-count">⚠️ {{ driver.alerts }} {{ driver.alerts === 1 ? 'alerta' : 'alertas' }}</span>
          <span class="last-alert">{{ driver.lastAlert }}</span>
        </template>
      </div>
      <button class="view-details-btn" @click.stop="viewDetails">Ver detalles →</button>
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

const getSeverityClass = (severity) => {
  const classMap = {
    'Safe': 'severity-safe',
    'Low': 'severity-low',
    'Medium': 'severity-medium',
    'High': 'severity-high',
    'Critical': 'severity-critical'
  }
  return classMap[severity] || 'severity-safe'
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

const calculateTripDuration = (startTime) => {
  if (!startTime) return '0 min'
  const start = new Date(startTime)
  if (Number.isNaN(start.getTime())) return '0 min'
  const now = new Date()
  const diffMs = now - start
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours === 0) {
    return `${minutes} min`
  }

  return `${hours}h ${minutes}min`
}

const handleClick = () => emit('click', props.driver)

const viewDetails = () => {
  emit('view-details', props.driver)
  router.push({ name: 'driver-detail', params: { id: props.driver.id } })
}
</script>

<style scoped>
.driver-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid transparent;
}

.driver-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

/* ✅ BORDE VERDE PARA SEGUROS (SIN ALERTAS) */
.driver-card.alert-safe {
  border-left-color: #00CA75;
  background: linear-gradient(135deg, #fff 0%, #E8F8F0 100%);
}

.driver-card.alert-critical,
.driver-card.severity-critical {
  border-left-color: #c13515;
  background: linear-gradient(135deg, #fff 0%, #fff5f5 100%);
}

.driver-card.alert-high,
.driver-card.severity-high {
  border-left-color: #ff8c00;
  background: linear-gradient(135deg, #fff 0%, #fff8e1 100%);
}

.driver-card.alert-medium,
.driver-card.alert-warning,
.driver-card.severity-medium {
  border-left-color: #ffcd18;
  background: linear-gradient(135deg, #fff 0%, #fffbea 100%);
}

.driver-card.alert-low,
.driver-card.severity-low {
  border-left-color: #0066CC;
  background: linear-gradient(135deg, #fff 0%, #f0f7ff 100%);
}

.driver-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.driver-avatar {
  position: relative;
  width: 56px;
  height: 56px;
  flex-shrink: 0;
}

.driver-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid white;
}

.status-indicator.active {
  background: #00ca75;
}

.status-indicator.resting {
  background: #ffcd18;
}

.status-indicator.offline {
  background: #74788d;
}

.driver-info {
  flex: 1;
  min-width: 0;
}

.driver-name {
  font-size: 16px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.driver-vehicle {
  font-size: 14px;
  color: #74788d;
  margin: 0;
}

.alert-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

/* ✅ BADGE VERDE PARA SEGUROS */
.alert-badge.severity-safe {
  background: #E8F8F0;
  color: #00CA75;
}

.alert-badge.severity-low {
  background: #f0f7ff;
  color: #0066CC;
}

.alert-badge.severity-medium {
  background: #fffbea;
  color: #ffcd18;
}

.alert-badge.severity-high {
  background: #fff8e1;
  color: #ff8c00;
}

.alert-badge.severity-critical {
  background: #ffe8e8;
  color: #c13515;
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.driver-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
  padding: 16px 0;
  border-top: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 12px;
  color: #74788d;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #222222;
  font-weight: 600;
}

.driver-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.no-alerts {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #00CA75;
  font-weight: 600;
}

.no-alerts svg {
  color: #00CA75;
}

.alert-count {
  font-size: 13px;
  color: #222222;
  font-weight: 600;
}

.last-alert {
  font-size: 12px;
  color: #74788d;
}

.view-details-btn {
  padding: 8px 16px;
  background: #c13515;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.view-details-btn:hover {
  background: #a72e12;
  transform: scale(1.05);
}
</style>
