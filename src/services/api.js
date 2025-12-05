const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5272/api/v1'

// Helper para convertir PascalCase (del backend .NET)
const toCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => toCamelCase(item))
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1)
      result[camelKey] = toCamelCase(obj[key])
      return result
    }, {})
  }

  return obj
}

// Helper para manejar respuestas HTTP
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error de conexión con el servidor',
    }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  const data = await response.json()
  return toCamelCase(data) // ✅ Convertir PascalCase a camelCase
}

// Helper para agregar token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ==================== TIPOS DE DATOS SEGÚN DATABASE ====================
/*
  ✅ ALERT (según alerts table):
  {
    id: int (PK),
    trip_id: int (FK),
    alert_type: string,
    severity_level: "Low" | "Medium" | "High" | "Critical",
    status: "New" | "Reviewed" | "FalsePositive",
    createdAt: datetime,
    fatigue_symptoms: string (podría ser JSON)
  }

  ✅ FATIGUE_SYMPTOM (según fatigue_symptoms table):
  {
    id: int (PK),
    id_alert: int (FK),
    symptom_name: "Yawning" | "EyeClosure" | "HeadDroop" | "MicroSleep",
    alerts_id: int (FK)
  }

  ✅ NOTIFICATION (según notifications table):
  {
    id: int (PK),
    alert_id: int (FK),
    recipient_id: int,
    recipient_role: "Driver" | "Manager",
    message: string,
    status: "PENDING" | "SENT" | "FAILED" | "RETRYING",
    attempt_count: int,
    sent_at: datetime
  }

  ✅ TRIP (según trips table):
  {
    id: int (PK),
    driver_id: int,
    vehicle_id: int,
    start_time: datetime,
    end_time: datetime (nullable),
    trip_status: "initiated" | "in_progress" | "completed" | "cancelled",
    cancellation_reason: varchar(255) (nullable),
    created_at: timestamp,
    updated_at: timestamp
  }

  ✅ DRIVER (según drivers table):
  {
    id: int (PK),
    status: varchar(120),
    license_number: nvarchar(20),
    email: varchar(100),
    user_id: int (FK)
  }
*/

// ==================== IAM CONTEXT ====================
export const authAPI = {
  // POST /api/v1/authentication/sign-in
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/authentication/sign-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    return handleResponse(response)
  },

  // POST /api/v1/authentication/sign-up
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/authentication/sign-up`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    return handleResponse(response)
  },

  // GET /api/v1/authentication/me (verificar endpoint correcto en tu backend)
  getCurrentUser: async () => {
    const response = await fetch(`${BASE_URL}/authentication/me`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ==================== DRIVER CONTEXT ====================
export const driverAPI = {
  // GET /api/v1/drivers
  getAllDrivers: async () => {
    const response = await fetch(`${BASE_URL}/drivers`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/v1/drivers/{driverId}
  getDriverById: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/v1/drivers/register
  createDriver: async (driverData) => {
    const response = await fetch(`${BASE_URL}/drivers/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData),
    })
    return handleResponse(response)
  },

  // PUT /api/v1/drivers/{driverId}/profile
  updateDriver: async (driverId, driverData) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData),
    })
    return handleResponse(response)
  },

  // GET /api/v1/drivers/{driverId}/license
  getDriverLicense: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/license`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // PUT /api/v1/drivers/{driverId}/license
  updateDriverLicense: async (driverId, licenseData) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/license`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(licenseData),
    })
    return handleResponse(response)
  },

  // POST /api/v1/drivers/{driverId}/validate-license
  validateLicense: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/validate-license`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // PUT /api/v1/drivers/{driverId}/status
  updateDriverStatus: async (driverId, statusData) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(statusData),
    })
    return handleResponse(response)
  },

  // POST /api/v1/drivers/{driverId}/activate
  activateDriver: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/activate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/v1/drivers/{driverId}/deactivate
  deactivateDriver: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/deactivate`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/v1/drivers/{driverId}/suspend
  suspendDriver: async (driverId, reason) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/suspend`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })
    return handleResponse(response)
  },

  // GET /api/v1/drivers/{driverId}/availability
  getDriverAvailability: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/availability`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/v1/drivers/by-user/{userId}
  getDriverByUserId: async (userId) => {
    const response = await fetch(`${BASE_URL}/drivers/by-user/${userId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/v1/drivers/by-status/{statusValue}
  getDriversByStatus: async (statusValue) => {
    const response = await fetch(`${BASE_URL}/drivers/by-status/${statusValue}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ==================== TRIP CONTEXT ====================
export const tripAPI = {
  // POST /api/trips
  startTrip: async (tripData) => {
    const response = await fetch(`${BASE_URL}/trips`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData),
    })
    return handleResponse(response)
  },

  // PUT /api/trips/{id}/end
  endTrip: async (tripId) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/end`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // PUT /api/trips/{id}/cancel
  cancelTrip: async (tripId, reason) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    })
    return handleResponse(response)
  },

  // GET /api/trips/{id}
  getTripById: async (tripId) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/trips/driver/{driverId}
  getTripsByDriver: async (driverId, filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${BASE_URL}/trips/driver/${driverId}?${params}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/trips/vehicle/{vehicleId}
  getTripsByVehicle: async (vehicleId) => {
    const response = await fetch(`${BASE_URL}/trips/vehicle/${vehicleId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/trips/reports
  getTripReports: async () => {
    const response = await fetch(`${BASE_URL}/trips/reports`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ==================== MONITORING / FATIGUE CONTEXT ====================
export const monitoringAPI = {
  // GET /api/fatigue/{driverId}
  getCurrentMonitoring: async (driverId) => {
    const response = await fetch(`${BASE_URL}/fatigue/${driverId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/fatigue/trip/{tripId}
  getTripMonitoring: async (tripId) => {
    const response = await fetch(`${BASE_URL}/fatigue/trip/${tripId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/fatigue
  reportMonitoringEvent: async (eventData) => {
    const response = await fetch(`${BASE_URL}/fatigue`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData),
    })
    return handleResponse(response)
  },
}

// ==================== NOTIFICATION CONTEXT ====================
export const notificationAPI = {
  // GET /api/notifications/critical/{driverId}
  getDriverNotifications: async (driverId) => {
    const response = await fetch(`${BASE_URL}/notifications/critical/${driverId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/notifications/alert/{alertId}
  getNotificationsByAlert: async (alertId) => {
    const response = await fetch(`${BASE_URL}/notifications/alert/${alertId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/notifications/pending
  getPendingNotifications: async () => {
    const response = await fetch(`${BASE_URL}/notifications/pending`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // PUT /api/notifications/{id}/mark-read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ==================== ALERTS CONTEXT ====================
export const alertAPI = {
  // GET /api/alerts/user/{userId}
  getUserAlerts: async (userId) => {
    const response = await fetch(`${BASE_URL}/alerts/user/${userId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/alerts
  getAllAlerts: async () => {
    const response = await fetch(`${BASE_URL}/alerts`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/alerts/{id}
  getAlertById: async (alertId) => {
    const response = await fetch(`${BASE_URL}/alerts/${alertId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/alerts/feedback
  submitAlertFeedback: async (feedbackData) => {
    const response = await fetch(`${BASE_URL}/alerts/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(feedbackData),
    })
    return handleResponse(response)
  },
}

// ==================== MANAGEMENT / REPORTS CONTEXT ====================
export const managementAPI = {
  // GET /api/reports
  getReports: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${BASE_URL}/reports?${params}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/reports/{id}
  getReportById: async (reportId) => {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // POST /api/reports/export
  exportReport: async (reportData) => {
    const response = await fetch(`${BASE_URL}/reports/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData),
    })
    // Para descargas de archivos
    if (response.ok) {
      const blob = await response.blob()
      return blob
    }
    throw new Error('Error al exportar reporte')
  },

  // GET /api/risk-patterns
  getRiskPatterns: async () => {
    const response = await fetch(`${BASE_URL}/risk-patterns`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },

  // GET /api/critical-events
  getCriticalEvents: async () => {
    const response = await fetch(`${BASE_URL}/critical-events`, {
      headers: getAuthHeaders(),
    })
    return handleResponse(response)
  },
}

// ==================== EXPORT DEFAULT ====================
export default {
  auth: authAPI,
  driver: driverAPI,
  trip: tripAPI,
  monitoring: monitoringAPI,
  notification: notificationAPI,
  alert: alertAPI,
  management: managementAPI,
}
