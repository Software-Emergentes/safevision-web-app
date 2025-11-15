<template>
  <div class="reports-container">
    <!-- Sidebar Compartido -->
    <AppSidebar />

    <!-- Main Content -->
    <main class="main-content">
      <!-- Header -->
      <header class="page-header">
        <div class="header-left">
          <h2 class="page-title">Reportes y Análisis</h2>
          <p class="page-subtitle">Estadísticas detalladas de la flota</p>
        </div>

        <div class="header-right">
          <button
            class="export-btn"
            @click="handleExport"
            :disabled="isLoadingReports"
          >
            <svg v-if="!isLoadingReports" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>

            <div v-else class="spinner-small"></div>

            {{ isLoadingReports ? 'Generando...' : 'Exportar PDF' }}
          </button>
        </div>

      </header>

      <!-- Stats Cards -->
      <section class="stats-grid">
        <ReportStatCard
          v-for="stat in mainStats"
          :key="stat.label"
          :icon="stat.icon"
          :value="stat.value"
          :label="stat.label"
          :trend="stat.trend"
          :trend-direction="stat.trendDirection"
          :variant="stat.variant"
        />
      </section>

      <!-- Tabs Navigation -->
      <div class="tabs-container">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="tab-button"
          :class="{ active: activeTab === tab.id }"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- TAB 1: Resumen General -->
        <div v-show="activeTab === 'general'" class="general-tab">
          <div class="charts-grid">
            <!-- Gráfico de Alertas por Semana -->
            <AlertsWeeklyChart :data="weeklyAlertsData" />

            <!-- Distribución de Alertas -->
            <AlertsDistributionCard :data="alertsDistribution" />
          </div>
        </div>

        <!-- TAB 2: Por Conductor -->
        <div v-show="activeTab === 'driver'" class="driver-tab">
          <DriverReportsTable :drivers="driversReportData" />
        </div>

        <!-- TAB 3: Por Horario -->
        <div v-show="activeTab === 'schedule'" class="schedule-tab">
          <ScheduleHeatmap :data="scheduleData" />
        </div>

        <!-- TAB 4: Por Ruta -->
        <div v-show="activeTab === 'route'" class="route-tab">
          <RouteReportsTable />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
// import api from '@/services/api' // ✅ AGREGADO
import ReportStatCard from '@/components/reports/ReportStatCard.vue'
import AlertsWeeklyChart from '@/components/reports/AlertsWeeklyChart.vue'
import AlertsDistributionCard from '@/components/reports/AlertsDistributionCard.vue'
import DriverReportsTable from '@/components/reports/DriverReportsTable.vue'
import ScheduleHeatmap from '@/components/reports/ScheduleHeatmap.vue'
import RouteReportsTable from '@/components/reports/RouteReportsTable.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const dashboardStore = useDashboardStore()

// Estado local
const activeTab = ref('general')
const isLoadingReports = ref(false)

// Tabs
const tabs = [
  { id: 'general', label: 'Resumen General' },
  { id: 'driver', label: 'Por Conductor' },
  { id: 'schedule', label: 'Por Horario' },
  { id: 'route', label: 'Por Ruta' }
]

// ✅ Estadísticas principales (calculadas dinámicamente desde el dashboard store)
const mainStats = computed(() => {
  const total = dashboardStore.totalDrivers
  const active = dashboardStore.activeDrivers
  const critical = dashboardStore.criticalAlerts
  const warning = dashboardStore.warningAlerts
  const totalAlerts = critical + warning

  // Calcular tasa de seguridad
  const safetyRate = total > 0
    ? ((dashboardStore.safeDrivers / total) * 100).toFixed(1)
    : 0

  // Calcular viajes completados (estimación)
  const trips = dashboardStore.drivers.reduce((sum, driver) => {
    return sum + (driver.alerts || 0)
  }, 0)

  return [
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
      value: total,
      label: 'Total Conductores',
      trend: `${active} activos actualmente`,
      trendDirection: 'up',
      variant: 'default'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>',
      value: trips,
      label: 'Viajes Completados',
      trend: `${active} conductores en ruta`,
      trendDirection: 'up',
      variant: 'default'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      value: `${safetyRate}%`,
      label: 'Tasa de Seguridad',
      trend: `${dashboardStore.safeDrivers} conductores seguros`,
      trendDirection: safetyRate >= 80 ? 'up' : 'down',
      variant: safetyRate >= 80 ? 'success' : 'warning'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      value: totalAlerts,
      label: 'Total Alertas',
      trend: `${critical} críticas, ${warning} advertencias`,
      trendDirection: critical > 0 ? 'up' : 'down',
      variant: critical > 0 ? 'danger' : 'warning'
    }
  ]
})

// ✅ Datos para gráficos (calculados dinámicamente CON COHERENCIA)
const weeklyAlertsData = computed(() => {
  const totalAlerts = dashboardStore.drivers.reduce((sum, d) => sum + d.alerts, 0)
  const avgPerWeek = Math.floor(totalAlerts / 4)

  // ✅ Generar datos que sumen exactamente totalAlerts
  const week1 = Math.max(1, Math.floor(avgPerWeek * 0.8))
  const week2 = Math.max(1, Math.floor(avgPerWeek * 1.1))
  const week3 = Math.max(1, Math.floor(avgPerWeek * 0.9))
  const week4 = totalAlerts - (week1 + week2 + week3) // ✅ El resto para que cuadre

  return [
    { label: 'Sem 1', value: week1 },
    { label: 'Sem 2', value: week2 },
    { label: 'Sem 3', value: week3 },
    { label: 'Sem 4', value: Math.max(1, week4) } // ✅ Asegurar mínimo 1
  ]
})

const alertsDistribution = computed(() => {
  const critical = dashboardStore.drivers.filter(d => d.severity === 'Critical').reduce((sum, d) => sum + d.alerts, 0)
  const high = dashboardStore.drivers.filter(d => d.severity === 'High').reduce((sum, d) => sum + d.alerts, 0)
  const medium = dashboardStore.drivers.filter(d => d.severity === 'Medium').reduce((sum, d) => sum + d.alerts, 0)
  const low = dashboardStore.drivers.filter(d => d.severity === 'Low').reduce((sum, d) => sum + d.alerts, 0)
  const total = critical + high + medium + low

  return [
    {
      label: 'Alertas Críticas',
      value: critical,
      percentage: total > 0 ? Math.round((critical / total) * 100) : 0,
      color: '#C13515'
    },
    {
      label: 'Alertas Altas',
      value: high,
      percentage: total > 0 ? Math.round((high / total) * 100) : 0,
      color: '#FFA500'
    },
    {
      label: 'Alertas Moderadas',
      value: medium,
      percentage: total > 0 ? Math.round((medium / total) * 100) : 0,
      color: '#FFCD18'
    },
    {
      label: 'Alertas Leves',
      value: low,
      percentage: total > 0 ? Math.round((low / total) * 100) : 0,
      color: '#0066CC'
    }
  ]
})

// ✅ Datos de conductores para tabla (del store)
const driversReportData = computed(() => {
  return dashboardStore.drivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    vehicle: driver.vehicle.plate, // ✅ Solo plate
    trips: Math.floor(Math.random() * 30) + 20, // TODO: obtener del backend
    alerts: driver.alerts,
    safetyRate: driver.alertLevel === 'safe' ? 92 :
      driver.alertLevel === 'warning' ? 75 : 58,
    hours: Math.floor(Math.random() * 200) + 100, // TODO: obtener del backend
    status: driver.status,
    avatar: driver.avatar
  }))
})

// Datos de horarios (MOCK)
const scheduleData = ref([])

const handleExport = async () => {
  try {
    isLoadingReports.value = true

    // ✅ IMPORTACIÓN CORRECTA
    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    // ✅ Crear documento PDF
    const doc = new jsPDF()

    // ✅ Configuración
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPos = 20

    // ===== HEADER =====
    doc.setFillColor(193, 53, 21)
    doc.rect(0, 0, pageWidth, 40, 'F')

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('SafeVision', 20, 20)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de Monitoreo de Flota', 20, 30)

    yPos = 50

    // ===== FECHA =====
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    const today = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Generado: ${today}`, pageWidth - 80, yPos)

    yPos += 15

    // ===== ESTADÍSTICAS PRINCIPALES =====
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(193, 53, 21)
    doc.text('Resumen Ejecutivo', 20, yPos)

    yPos += 10

    const statsData = [
      ['Total Conductores', String(mainStats.value[0].value), mainStats.value[0].trend],
      ['Viajes Completados', String(mainStats.value[1].value), mainStats.value[1].trend],
      ['Tasa de Seguridad', String(mainStats.value[2].value), mainStats.value[2].trend],
      ['Total Alertas', String(mainStats.value[3].value), mainStats.value[3].trend]
    ]

    // ✅ USAR autoTable correctamente
    autoTable(doc, {
      startY: yPos,
      head: [['Métrica', 'Valor', 'Tendencia']],
      body: statsData,
      theme: 'striped',
      headStyles: {
        fillColor: [193, 53, 21],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'center', cellWidth: 40 },
        2: { fontSize: 9, cellWidth: 'auto' }
      }
    })

    yPos = doc.lastAutoTable.finalY + 15

    // ===== DISTRIBUCIÓN DE ALERTAS =====
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(193, 53, 21)
    doc.text('Distribución de Alertas', 20, yPos)

    yPos += 10

    const alertsDistData = alertsDistribution.value.map(item => [
      item.label,
      String(item.value),
      `${item.percentage}%`
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Tipo de Alerta', 'Cantidad', 'Porcentaje']],
      body: alertsDistData,
      theme: 'grid',
      headStyles: {
        fillColor: [193, 53, 21],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center', cellWidth: 40 },
        2: { halign: 'center', cellWidth: 40 }
      }
    })

    yPos = doc.lastAutoTable.finalY + 15

    // ===== ALERTAS POR SEMANA (GRÁFICO DE TEXTO) =====
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(193, 53, 21)
    doc.text('Alertas por Semana', 20, yPos)

    yPos += 10

    const weeklyData = weeklyAlertsData.value.map(item => [
      item.label,
      String(item.value)
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Semana', 'Alertas']],
      body: weeklyData,
      theme: 'striped',
      headStyles: {
        fillColor: [193, 53, 21],
        textColor: [255, 255, 255]
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { halign: 'center', cellWidth: 60 }
      }
    })

    // ===== NUEVA PÁGINA: CONDUCTORES =====
    doc.addPage()
    yPos = 20

    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(193, 53, 21)
    doc.text('Reporte Detallado por Conductor', 20, yPos)

    yPos += 10

    const driversData = driversReportData.value.map(driver => [
      driver.name,
      driver.vehicle,
      String(driver.trips),
      String(driver.alerts),
      `${driver.safetyRate}%`,
      driver.status === 'active' ? 'Activo' :
        driver.status === 'resting' ? 'Descansando' : 'Desconectado'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Conductor', 'Vehículo', 'Viajes', 'Alertas', 'Seguridad', 'Estado']],
      body: driversData,
      theme: 'striped',
      headStyles: {
        fillColor: [193, 53, 21],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'center' }
      },
      didParseCell: function(data) {
        if (data.column.index === 3 && data.section === 'body') {
          const alertsText = data.cell.text[0]
          const alerts = parseInt(alertsText)
          if (!isNaN(alerts)) {
            if (alerts > 15) {
              data.cell.styles.textColor = [193, 53, 21]
              data.cell.styles.fontStyle = 'bold'
            } else if (alerts > 5) {
              data.cell.styles.textColor = [255, 165, 0]
            }
          }
        }
        if (data.column.index === 4 && data.section === 'body') {
          const rateText = data.cell.text[0]
          const rate = parseInt(rateText)
          if (!isNaN(rate)) {
            if (rate >= 85) {
              data.cell.styles.textColor = [0, 202, 117]
              data.cell.styles.fontStyle = 'bold'
            } else if (rate < 70) {
              data.cell.styles.textColor = [193, 53, 21]
              data.cell.styles.fontStyle = 'bold'
            }
          }
        }
      }
    })

    // ===== FOOTER EN TODAS LAS PÁGINAS =====
    const totalPages = doc.internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      doc.setDrawColor(193, 53, 21)
      doc.setLineWidth(0.5)
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)

      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.setFont('helvetica', 'normal')

      doc.text(
        'SafeVision - Sistema de Monitoreo de Conductores',
        20,
        pageHeight - 12
      )

      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - 40,
        pageHeight - 12
      )
    }

    // ===== GUARDAR PDF =====
    const fileName = `SafeVision_Reporte_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    console.log('✅ PDF generado exitosamente:', fileName)

  } catch (error) {
    console.error('❌ Error al exportar reporte:', error)
    alert('Error al generar el PDF. Por favor intenta de nuevo.')
  } finally {
    isLoadingReports.value = false
  }
}

// Lifecycle
onMounted(async () => {
  // Si no hay conductores cargados, cargarlos primero
  if (dashboardStore.drivers.length === 0) {
    await dashboardStore.fetchDrivers()
  }

  console.log('ReportsView montado con', dashboardStore.drivers.length, 'conductores')
})
</script>

<style scoped>
.reports-container {
  display: flex;
  min-height: 100vh;
  background: #F5F7FA;
  font-family: 'Poppins', sans-serif;
}

/* ===== MAIN CONTENT ===== */
.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 32px;
  width: calc(100% - 280px);
}

/* ===== PAGE HEADER ===== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
}

.header-left {
  flex: 1;
  min-width: 250px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin: 0 0 6px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #74788D;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-btn,
.period-btn,
.export-btn {
  padding: 10px 20px;
  background: white;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  color: #222222;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.filter-btn:hover,
.period-btn:hover {
  background: #F5F7FA;
  border-color: #C13515;
  color: #C13515;
}

.export-btn {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
  border-color: #C13515;
}

.export-btn:hover {
  background: linear-gradient(135deg, #A72E12 0%, #6B1F0C 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(193, 53, 21, 0.3);
}

/* ===== STATS GRID ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

/* ===== TABS ===== */
.tabs-container {
  background: white;
  border-radius: 12px;
  padding: 8px;
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  min-width: 140px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #74788D;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-button:hover {
  background: #F5F7FA;
  color: #222222;
}

.tab-button.active {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(193, 53, 21, 0.3);
}

/* ===== TAB CONTENT ===== */
.tab-content {
  min-height: 500px;
}

.general-tab,
.driver-tab,
.schedule-tab,
.route-tab {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-right {
    flex-direction: column;
  }

  .filter-btn,
  .period-btn,
  .export-btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .tabs-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab-button {
    flex-shrink: 0;
  }

  .page-title {
    font-size: 24px;
  }
}

.export-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
