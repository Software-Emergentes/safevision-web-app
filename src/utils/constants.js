// ✅ Constantes alineadas con el DATABASE DESIGN DIAGRAM del informe

// ==================== DRIVER STATUS (según drivers table) ====================
export const DRIVER_STATUS = {
  ACTIVE: 'active',
  RESTING: 'resting',
  OFFLINE: 'offline'
}

export const DRIVER_STATUS_LABELS = {
  [DRIVER_STATUS.ACTIVE]: 'En Ruta',
  [DRIVER_STATUS.RESTING]: 'Descansando',
  [DRIVER_STATUS.OFFLINE]: 'Desconectado'
}

// ==================== ALERT SEVERITY (según alerts table - severity_level) ====================
export const ALERT_SEVERITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical'
}

export const ALERT_SEVERITY_LABELS = {
  [ALERT_SEVERITY.LOW]: 'Leve',
  [ALERT_SEVERITY.MEDIUM]: 'Moderado',
  [ALERT_SEVERITY.HIGH]: 'Alto',
  [ALERT_SEVERITY.CRITICAL]: 'Crítico'
}

// ==================== ALERT STATUS (según alerts table - status) ====================
export const ALERT_STATUS = {
  NEW: 'New',
  REVIEWED: 'Reviewed',
  FALSE_POSITIVE: 'FalsePositive'
}

export const ALERT_STATUS_LABELS = {
  [ALERT_STATUS.NEW]: 'Nueva',
  [ALERT_STATUS.REVIEWED]: 'Revisada',
  [ALERT_STATUS.FALSE_POSITIVE]: 'Falsa Alarma'
}

// ==================== TRIP STATUS (según trips table - trip_status) ====================
export const TRIP_STATUS = {
  INITIATED: 'initiated',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const TRIP_STATUS_LABELS = {
  [TRIP_STATUS.INITIATED]: 'Iniciado',
  [TRIP_STATUS.IN_PROGRESS]: 'En Progreso',
  [TRIP_STATUS.COMPLETED]: 'Completado',
  [TRIP_STATUS.CANCELLED]: 'Cancelado'
}

// ==================== NOTIFICATION STATUS (según notifications table - status) ====================
export const NOTIFICATION_STATUS = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
  RETRYING: 'RETRYING'
}

export const NOTIFICATION_STATUS_LABELS = {
  [NOTIFICATION_STATUS.PENDING]: 'Pendiente',
  [NOTIFICATION_STATUS.SENT]: 'Enviada',
  [NOTIFICATION_STATUS.FAILED]: 'Fallida',
  [NOTIFICATION_STATUS.RETRYING]: 'Reintentando'
}

// ==================== FATIGUE SYMPTOMS (según fatigue_symptoms table - symptom_name) ====================
export const FATIGUE_SYMPTOMS = {
  YAWNING: 'Yawning',
  EYE_CLOSURE: 'EyeClosure',
  HEAD_DROOP: 'HeadDroop',
  MICRO_SLEEP: 'MicroSleep'
}

export const FATIGUE_SYMPTOMS_LABELS = {
  [FATIGUE_SYMPTOMS.YAWNING]: 'Bostezo',
  [FATIGUE_SYMPTOMS.EYE_CLOSURE]: 'Cierre de Ojos',
  [FATIGUE_SYMPTOMS.HEAD_DROOP]: 'Cabeceo',
  [FATIGUE_SYMPTOMS.MICRO_SLEEP]: 'Micro-Sueño'
}

// ==================== THRESHOLDS ====================
export const FATIGUE_THRESHOLDS = {
  SAFE: 0,
  WARNING: 50,
  CRITICAL: 80
}

export const ALERT_COUNT_THRESHOLDS = {
  LOW: 1,
  MEDIUM: 3,
  HIGH: 10
}

// ==================== COLORS ====================
export const COLORS = {
  PRIMARY_RED: '#C13515',
  DARK_RED: '#5A0000',
  WARNING_YELLOW: '#FFCD18',
  SUCCESS_GREEN: '#00CA75',
  INFO_BLUE: '#0066CC',
  TEXT_PRIMARY: '#222222',
  TEXT_SECONDARY: '#74788D',
  BORDER_GRAY: '#E9ECEF'
}

// ==================== SEVERITY COLORS (para mapear con DB) ====================
export const SEVERITY_COLORS = {
  [ALERT_SEVERITY.LOW]: '#0066CC',      // Azul
  [ALERT_SEVERITY.MEDIUM]: '#FFCD18',   // Amarillo
  [ALERT_SEVERITY.HIGH]: '#FFA500',     // Naranja
  [ALERT_SEVERITY.CRITICAL]: '#C13515'  // Rojo
}

// ==================== API ENDPOINTS (para referencia) ====================
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',

  // Drivers
  DRIVERS: '/drivers',
  DRIVER_BY_ID: '/drivers/:id',
  DRIVER_LICENSE: '/drivers/:id/license',

  // Trips
  TRIPS_START: '/trips/start',
  TRIPS_END: '/trips/:id/end',
  TRIPS_CANCEL: '/trips/:id/cancel',
  TRIPS_BY_DRIVER: '/trips/driver/:driverId',

  // Monitoring
  MONITORING_CURRENT: '/monitoring/driver/:driverId/current',
  MONITORING_BY_TRIP: '/monitoring/trip/:tripId',

  // Notifications
  NOTIFICATIONS_BY_DRIVER: '/notifications/driver/:driverId',
  ALERTS_BY_USER: '/alerts/user/:userId',

  // Management
  REPORTS: '/reports',
  REPORTS_EXPORT: '/reports/export',
  RISK_PATTERNS: '/risk-patterns'
}

// ==================== REGEX PATTERNS ====================
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+51\s?9\d{8}$/,
  LICENSE_NUMBER: /^L\d{7}$/,
  VEHICLE_PLATE: /^[A-Z]{3}-\d{3}$/
}

// ==================== DATE FORMATS ====================
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  TIME: 'HH:mm'
}

// ==================== TRIP DURATION (para cálculos) ====================
export const TRIP_DURATION = {
  'Lima - Arequipa': { hours: 14, minutes: 30 },
  'Lima - Cusco': { hours: 16, minutes: 15 },
  'Lima - Trujillo': { hours: 8, minutes: 45 },
  'Lima - Chiclayo': { hours: 11, minutes: 20 },
  'Lima - Piura': { hours: 14, minutes: 0 },
  'Lima - Ica': { hours: 4, minutes: 30 }
}
