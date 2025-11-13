// ✅ Servicio API preparado para conectar con el backend
// TODO: Actualizar BASE_URL cuando el backend esté desplegado

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Helper para manejar respuestas HTTP
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error de conexión con el servidor'
    }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

// Helper para agregar token de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}


// ==================== TIPOS DE DATOS SEGÚN DATABASE ====================
/*
  ✅ ALERT (según alerts table):
  {
    id: int (PK),
    trip_id: int (FK),
    alert_type: string,
    severity_level: "Low" | "Medium" | "High" | "Critical",  // ✅ DEL DB
    status: "New" | "Reviewed" | "FalsePositive",            // ✅ DEL DB
    createdAt: datetime,                                      // ✅ DEL DB
    fatigue_symptoms: string (podría ser JSON)               // ✅ DEL DB
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
    status: "PENDING" | "SENT" | "FAILED" | "RETRYING",      // ✅ DEL DB
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
    trip_status: "initiated" | "in_progress" | "completed" | "cancelled", // ✅ DEL DB
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
  // POST /api/auth/login
  login: async (email, password) => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  // POST /api/auth/register
  register: async (userData) => {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    return handleResponse(response)},

  // GET /api/auth/me
  getCurrentUser: async () => {
    const response = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ==================== DRIVER CONTEXT ====================
export const driverAPI = {
  // GET /api/drivers
  getAllDrivers: async () => {
    const response = await fetch(`${BASE_URL}/drivers`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/drivers/{id}
  getDriverById: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // POST /api/drivers
  createDriver: async (driverData) => {
    const response = await fetch(`${BASE_URL}/drivers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData)
    })
    return handleResponse(response)
  },

  // PUT /api/drivers/{id}
  updateDriver: async (driverId, driverData) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(driverData)
    })
    return handleResponse(response)
  },

  // GET /api/drivers/{id}/license
  getDriverLicense: async (driverId) => {
    const response = await fetch(`${BASE_URL}/drivers/${driverId}/license`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ==================== TRIP CONTEXT ====================
export const tripAPI = {
  // POST /api/trips/start
  startTrip: async (tripData) => {
    const response = await fetch(`${BASE_URL}/trips/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tripData)
    })
    return handleResponse(response)
  },

  // PUT /api/trips/{id}/end
  endTrip: async (tripId) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/end`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // PUT /api/trips/{id}/cancel
  cancelTrip: async (tripId, reason) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    })
    return handleResponse(response)
  },

  // GET /api/trips/{id}
  getTripById: async (tripId) => {
    const response = await fetch(`${BASE_URL}/trips/${tripId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/trips/driver/{driverId}
  getTripsByDriver: async (driverId, filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${BASE_URL}/trips/driver/${driverId}?${params}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/trips/vehicle/{vehicleId}
  getTripsByVehicle: async (vehicleId) => {
    const response = await fetch(`${BASE_URL}/trips/vehicle/${vehicleId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/trips/reports
  getTripReports: async () => {
    const response = await fetch(`${BASE_URL}/trips/reports`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ==================== MONITORING CONTEXT ====================
export const monitoringAPI = {
  // GET /api/monitoring/driver/{driverId}/current
  getCurrentMonitoring: async (driverId) => {
    const response = await fetch(`${BASE_URL}/monitoring/driver/${driverId}/current`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/monitoring/trip/{tripId}
  getMonitoringByTrip: async (tripId) => {
    const response = await fetch(`${BASE_URL}/monitoring/trip/${tripId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // POST /api/monitoring/event
  reportMonitoringEvent: async (eventData) => {
    const response = await fetch(`${BASE_URL}/monitoring/event`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    })
    return handleResponse(response)
  }
}

// ==================== NOTIFICATION CONTEXT ====================
export const notificationAPI = {
  // GET /api/notifications/driver/{driverId}
  getNotificationsByDriver: async (driverId) => {
    const response = await fetch(`${BASE_URL}/notifications/driver/${driverId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/notifications/alert/{alertId}
  getNotificationsByAlert: async (alertId) => {
    const response = await fetch(`${BASE_URL}/notifications/alert/${alertId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/notifications/pending
  getPendingNotifications: async () => {
    const response = await fetch(`${BASE_URL}/notifications/pending`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // PUT /api/notifications/{id}/mark-read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${BASE_URL}/notifications/${notificationId}/mark-read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/alerts/user/{userId}
  getAlertsByUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/alerts/user/${userId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/alerts
  getAllAlerts: async () => {
    const response = await fetch(`${BASE_URL}/alerts`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ==================== MANAGEMENT CONTEXT ====================
export const managementAPI = {
  // GET /api/reports
  getReports: async (filters = {}) => {
    const params = new URLSearchParams(filters)
    const response = await fetch(`${BASE_URL}/reports?${params}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // GET /api/reports/{id}
  getReportById: async (reportId) => {
    const response = await fetch(`${BASE_URL}/reports/${reportId}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // POST /api/reports/export
  exportReport: async (reportData) => {
    const response = await fetch(`${BASE_URL}/reports/export`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reportData)
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
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // POST /api/driver/assignment
  assignDriver: async (assignmentData) => {
    const response = await fetch(`${BASE_URL}/driver/assignment`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(assignmentData)
    })
    return handleResponse(response)
  }
}

// ==================== EXPORT DEFAULT ====================
export default {
  auth: authAPI,
  driver: driverAPI,
  trip: tripAPI,
  monitoring: monitoringAPI,
  notification: notificationAPI,
  management: managementAPI
}
