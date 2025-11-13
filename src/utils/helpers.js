// Funciones de utilidad alineadas con el DATABASE DESIGN DIAGRAM

import {
  DRIVER_STATUS_LABELS,
  ALERT_SEVERITY,
  ALERT_SEVERITY_LABELS,
  ALERT_STATUS_LABELS,
  FATIGUE_SYMPTOMS_LABELS,
  FATIGUE_THRESHOLDS,
  ALERT_COUNT_THRESHOLDS,
  SEVERITY_COLORS
} from './constants'

// ==================== DATE HELPERS ====================

export function formatDate(isoDate, includeTime = false) {
  if (!isoDate) return 'N/A'

  const date = new Date(isoDate)
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' })
  }

  return date.toLocaleDateString('es-PE', options)
}

export function calculateDuration(startTime, endTime = null) {
  if (!startTime) return '0h 0m'

  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date()
  const diffMs = end - start

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${hours}h ${minutes}m`
}

export function getRelativeTime(isoDate) {
  if (!isoDate) return 'Fecha desconocida'

  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now - date

  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Hace unos segundos'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 7) return `Hace ${days} días`

  return formatDate(isoDate)
}

// ==================== STATUS HELPERS ====================

export function getDriverStatusText(status) {
  return DRIVER_STATUS_LABELS[status] || status
}

// ✅ NUEVA: Obtener texto de severidad según DB
export function getAlertSeverityText(severity) {
  return ALERT_SEVERITY_LABELS[severity] || severity
}

// ✅ NUEVA: Obtener texto de estado de alerta según DB
export function getAlertStatusText(status) {
  return ALERT_STATUS_LABELS[status] || status
}

// ✅ NUEVA: Determinar SEVERITY según DB (Low, Medium, High, Critical)
export function determineAlertSeverity(fatigueScore = 0, totalAlerts = 0) {
  // Según DATABASE: severity_level = Low | Medium | High | Critical

  if (fatigueScore >= 80 || totalAlerts > ALERT_COUNT_THRESHOLDS.HIGH) {
    return ALERT_SEVERITY.CRITICAL
  }

  if (fatigueScore >= 60 || totalAlerts > 5) {
    return ALERT_SEVERITY.HIGH
  }

  if (fatigueScore >= 40 || totalAlerts > ALERT_COUNT_THRESHOLDS.MEDIUM) {
    return ALERT_SEVERITY.MEDIUM
  }

  return ALERT_SEVERITY.LOW
}

// ✅ MANTENER: Para compatibilidad con UI (safe, warning, critical)
export function determineAlertLevel(monitoring = null, totalAlerts = 0) {
  if (!monitoring) return 'safe'

  const fatigueScore = monitoring.fatigueScore || 0

  if (fatigueScore >= FATIGUE_THRESHOLDS.CRITICAL || totalAlerts > 3) {
    return 'critical'
  }

  if (fatigueScore >= FATIGUE_THRESHOLDS.WARNING || totalAlerts > 1) {
    return 'warning'
  }

  return 'safe'
}

export function getAlertLevelText(level) {
  const levelMap = {
    safe: 'Seguro',
    warning: 'Advertencia',
    critical: 'Crítico'
  }
  return levelMap[level] || level
}

// ✅ NUEVA: Formatear síntomas de fatiga
export function formatFatigueSymptoms(symptoms) {
  if (!symptoms || !Array.isArray(symptoms)) return 'Sin síntomas'

  return symptoms.map(s => FATIGUE_SYMPTOMS_LABELS[s] || s).join(', ')
}

// ==================== VALIDATION HELPERS ====================

export function isValidEmail(email) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(email)
}

export function isValidPhone(phone) {
  const pattern = /^\+51\s?9\d{8}$/
  return pattern.test(phone)
}

export function isValidPlate(plate) {
  const pattern = /^[A-Z]{3}-\d{3}$/
  return pattern.test(plate)
}

// ==================== FORMAT HELPERS ====================

export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '0%'
  return `${value.toFixed(decimals)}%`
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

// ==================== COLOR HELPERS ====================

// ✅ NUEVA: Obtener color según severity del DB
export function getAlertSeverityColor(severity) {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS[ALERT_SEVERITY.LOW]
}

export function getAlertColor(level) {
  const colors = {
    safe: '#00CA75',
    warning: '#FFCD18',
    critical: '#C13515'
  }
  return colors[level] || colors.safe
}

export function getFatigueColor(score) {
  if (score >= FATIGUE_THRESHOLDS.CRITICAL) return '#C13515'
  if (score >= FATIGUE_THRESHOLDS.WARNING) return '#FFCD18'
  return '#00CA75'
}

// ==================== DATA TRANSFORMATION ====================

export function transformDriverData(backendDriver) {
  const fatigueScore = backendDriver.monitoring?.fatigueScore || 0
  const totalAlerts = backendDriver.totalAlerts || backendDriver.recentAlerts || 0

  return {
    id: backendDriver.id,
    name: backendDriver.name,
    licenseNumber: backendDriver.licenseNumber,

    contactInfo: backendDriver.contactInfo || {
      phone: 'N/A',
      email: 'N/A'
    },

    vehicle: {
      plate: backendDriver.vehicle?.plate || 'N/A'
    },

    trip: backendDriver.currentTrip || null,

    monitoring: backendDriver.monitoring ? {
      fatigueScore: backendDriver.monitoring.fatigueScore || 0,
      lastDetection: backendDriver.monitoring.lastDetection || null
    } : null,

    alerts: totalAlerts,

    // ✅ NUEVO: Severity según DB
    severity: determineAlertSeverity(fatigueScore, totalAlerts),

    // ✅ MANTENER: alertLevel para UI
    alertLevel: determineAlertLevel(backendDriver.monitoring, totalAlerts),

    // ✅ NUEVO: Síntomas de fatiga
    fatigueSymptoms: backendDriver.fatigueSymptoms || [],

    lastAlert: backendDriver.lastAlert
      ? getRelativeTime(backendDriver.lastAlert)
      : 'Sin alertas',

    status: backendDriver.status || 'offline',

    avatar: backendDriver.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(backendDriver.name)}&background=random&size=128`
  }
}

// ==================== EXPORT ALL ====================
export default {
  formatDate,
  calculateDuration,
  getRelativeTime,
  getDriverStatusText,
  getAlertSeverityText,
  getAlertStatusText,
  getAlertLevelText,
  determineAlertSeverity,
  determineAlertLevel,
  formatFatigueSymptoms,
  isValidEmail,
  isValidPhone,
  isValidPlate,
  formatNumber,
  formatPercentage,
  truncateText,
  getAlertSeverityColor,
  getAlertColor,
  getFatigueColor,
  transformDriverData
}
