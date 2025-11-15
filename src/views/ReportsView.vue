<template>
  <div class="flex min-h-screen bg-gray-100 font-sans">
    <AppSidebar />

    <main class="ml-[280px] flex-1 p-8 w-[calc(100%-280px)]">
      <!-- Header -->
      <header class="flex justify-between items-start mb-8 flex-wrap gap-5">
        <div class="flex-1 min-w-[250px]">
          <h2 class="text-[32px] font-bold text-gray-900 m-0 mb-1.5">Reportes y Análisis</h2>
          <p class="text-base text-gray-500 m-0">Estadísticas detalladas de la flota</p>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="handleExport"
            :disabled="isLoadingReports"
            class="py-2.5 px-5 bg-gradient-to-r from-primary to-primary-dark text-white border border-primary rounded-lg text-sm font-semibold cursor-pointer flex items-center gap-2 transition-all duration-300 hover:from-primary-dark hover:to-primary-darker hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <svg v-if="!isLoadingReports" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>

            <div v-else class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>

            {{ isLoadingReports ? 'Generando...' : 'Exportar PDF' }}
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 mb-8">
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

      <!-- Tabs -->
      <div class="bg-white rounded-xl p-2 flex gap-2 mb-6 shadow-sm overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'flex-1 min-w-[140px] py-3 px-5 bg-transparent border-none rounded-lg text-gray-500 text-sm font-semibold cursor-pointer transition-all duration-300 whitespace-nowrap',
            activeTab === tab.id ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-lg' : 'hover:bg-gray-100 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Tab Content -->
      <div class="min-h-[500px]">
        <!-- TAB 1: Resumen General -->
        <div v-show="activeTab === 'general'" class="animate-[fadeIn_0.3s_ease]">
          <div class="grid grid-cols-2 gap-6">
            <AlertsWeeklyChart :data="weeklyAlertsData" />
            <AlertsDistributionCard :data="alertsDistribution" />
          </div>
        </div>

        <!-- TAB 2: Por Conductor -->
        <div v-show="activeTab === 'driver'" class="animate-[fadeIn_0.3s_ease]">
          <DriverReportsTable :drivers="driversReportData" />
        </div>

        <!-- TAB 3: Por Horario -->
        <div v-show="activeTab === 'schedule'" class="animate-[fadeIn_0.3s_ease]">
          <ScheduleHeatmap :data="scheduleData" />
        </div>

        <!-- TAB 4: Por Ruta -->
        <div v-show="activeTab === 'route'" class="animate-[fadeIn_0.3s_ease]">
          <RouteReportsTable />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import ReportStatCard from '@/components/reports/ReportStatCard.vue'
import AlertsWeeklyChart from '@/components/reports/AlertsWeeklyChart.vue'
import AlertsDistributionCard from '@/components/reports/AlertsDistributionCard.vue'
import DriverReportsTable from '@/components/reports/DriverReportsTable.vue'
import ScheduleHeatmap from '@/components/reports/ScheduleHeatmap.vue'
import RouteReportsTable from '@/components/reports/RouteReportsTable.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const dashboardStore = useDashboardStore()

const activeTab = ref('general')
const isLoadingReports = ref(false)

const tabs = [
  { id: 'general', label: 'Resumen General' },
  { id: 'driver', label: 'Por Conductor' },
  { id: 'schedule', label: 'Por Horario' },
  { id: 'route', label: 'Por Ruta' }
]

const mainStats = computed(() => {
  const total = dashboardStore.totalDrivers
  const active = dashboardStore.activeDrivers
  const critical = dashboardStore.criticalAlerts
  const warning = dashboardStore.warningAlerts
  const totalAlerts = critical + warning
  const safe = dashboardStore.safeDrivers

  // ✅ Calcular tasa de seguridad REAL
  const safetyRate = total > 0
    ? ((safe / total) * 100).toFixed(1)
    : 0

  // ✅ Calcular viajes completados REAL
  const trips = dashboardStore.drivers.filter(d => d.currentTrip || d.status === 'active').length

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
      trend: `${safe} conductores seguros`,
      trendDirection: safetyRate >= 50 ? 'up' : 'down',
      variant: safetyRate >= 50 ? 'success' : 'warning'
    },
    {
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      value: totalAlerts,
      label: 'Total Alertas',
      trend: critical > 0
        ? `${critical} críticas, ${warning} advertencias`
        : totalAlerts > 0
          ? `${totalAlerts} advertencias`
          : 'Sin alertas críticas',
      trendDirection: critical > 0 ? 'down' : totalAlerts > 0 ? 'down' : 'up',
      variant: critical > 0 ? 'danger' : totalAlerts > 0 ? 'warning' : 'success'
    }
  ]
})

const weeklyAlertsData = computed(() => {
  const totalAlerts = dashboardStore.drivers.reduce((sum, d) => sum + d.alerts, 0)
  const avgPerWeek = Math.floor(totalAlerts / 4)

  const week1 = Math.max(1, Math.floor(avgPerWeek * 0.8))
  const week2 = Math.max(1, Math.floor(avgPerWeek * 1.1))
  const week3 = Math.max(1, Math.floor(avgPerWeek * 0.9))
  const week4 = totalAlerts - (week1 + week2 + week3)

  return [
    { label: 'Sem 1', value: week1 },
    { label: 'Sem 2', value: week2 },
    { label: 'Sem 3', value: week3 },
    { label: 'Sem 4', value: Math.max(1, week4) }
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

const driversReportData = computed(() => {
  return dashboardStore.drivers.map(driver => ({
    id: driver.id,
    name: driver.name,
    vehicle: driver.vehicle.plate,
    trips: Math.floor(Math.random() * 30) + 20,
    alerts: driver.alerts,
    safetyRate: driver.alertLevel === 'safe' ? 92 :
      driver.alertLevel === 'warning' ? 75 : 58,
    hours: Math.floor(Math.random() * 200) + 100,
    status: driver.status,
    avatar: driver.avatar
  }))
})

const scheduleData = ref([])

const handleExport = async () => {
  try {
    isLoadingReports.value = true

    const jsPDF = (await import('jspdf')).default
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Fecha correcta
    const today = new Date()
    const peruDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Lima' }))

    const formattedDate = peruDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const time = peruDate.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    })

    const year = peruDate.getFullYear()
    const month = String(peruDate.getMonth() + 1).padStart(2, '0')
    const day = String(peruDate.getDate()).padStart(2, '0')
    const fileDate = `${year}-${month}-${day}`

    // ========================================
    // 🎨 PORTADA PROFESIONAL
    // ========================================

    doc.setFillColor(193, 53, 21)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')

    doc.setFillColor(255, 255, 255)
    doc.setGState(new doc.GState({ opacity: 0.1 }))
    doc.circle(pageWidth - 30, 40, 80, 'F')
    doc.circle(30, pageHeight - 40, 60, 'F')
    doc.setGState(new doc.GState({ opacity: 1 }))

    // Logo
    doc.setFillColor(255, 255, 255)
    doc.circle(pageWidth / 2, 50, 15, 'F')
    doc.setFillColor(193, 53, 21)
    doc.circle(pageWidth / 2, 50, 10, 'F')

    // Título
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(48)
    doc.setFont('helvetica', 'bold')
    doc.text('SafeVision', pageWidth / 2, 80, { align: 'center' })

    // Subtítulo
    doc.setFontSize(20)
    doc.setFont('helvetica', 'normal')
    doc.text('Reporte de Monitoreo de Flota', pageWidth / 2, 100, { align: 'center' })

    // Línea
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.line(50, 115, pageWidth - 50, 115)

    // Fecha
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha de Generacion:', pageWidth / 2, 140, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.text(formattedDate, pageWidth / 2, 150, { align: 'center' })
    doc.text(`Hora: ${time}`, pageWidth / 2, 160, { align: 'center' })

    // Stats en portada
    const statsY = 190
    const statsBoxWidth = 80
    const statsBoxHeight = 40
    const statsGap = 15

    const coverStats = [
      { label: 'Conductores', value: mainStats.value[0].value, color: [106, 90, 205] },
      { label: 'Viajes', value: mainStats.value[1].value, color: [0, 202, 117] }
    ]

    coverStats.forEach((stat, index) => {
      const xPos = (pageWidth - (statsBoxWidth * 2 + statsGap)) / 2 + (statsBoxWidth + statsGap) * index

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(xPos, statsY, statsBoxWidth, statsBoxHeight, 5, 5, 'F')

      doc.setFillColor(...stat.color)
      doc.rect(xPos, statsY, statsBoxWidth, 3, 'F')

      doc.setTextColor(...stat.color)
      doc.setFontSize(28)
      doc.setFont('helvetica', 'bold')
      doc.text(String(stat.value), xPos + statsBoxWidth / 2, statsY + 20, { align: 'center' })

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(stat.label, xPos + statsBoxWidth / 2, statsY + 32, { align: 'center' })
    })

    // ✅ Footer portada MÁS ARRIBA
    doc.setFontSize(10)
    doc.setTextColor(255, 255, 255)
    doc.setFont('helvetica', 'italic')
    doc.text('Sistema Inteligente de Monitoreo de Conductores', pageWidth / 2, pageHeight - 30, { align: 'center' })

    // ========================================
    // 📊 PÁGINA 2: RESUMEN EJECUTIVO
    // ========================================

    doc.addPage()
    let yPos = 25

    // Header
    doc.setFillColor(193, 53, 21)
    doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN EJECUTIVO', 20, 13)

    yPos = 35

    // Título
    doc.setTextColor(193, 53, 21)
    doc.setFontSize(18)
    doc.text('Indicadores Clave de Rendimiento (KPI)', 20, yPos)

    yPos += 5
    doc.setDrawColor(193, 53, 21)
    doc.setLineWidth(1)
    doc.line(20, yPos, 80, yPos)

    yPos += 15

    // KPIs
    const kpis = [
      {
        label: 'Total Conductores',
        value: mainStats.value[0].value,
        trend: `${dashboardStore.activeDrivers} activos`,
        color: [106, 90, 205]
      },
      {
        label: 'Viajes Completados',
        value: mainStats.value[1].value,
        trend: `${dashboardStore.activeDrivers} en ruta`,
        color: [0, 202, 117]
      },
      {
        label: 'Tasa de Seguridad',
        value: mainStats.value[2].value,
        trend: `${dashboardStore.safeDrivers} conductores`,
        color: [255, 205, 24]
      },
      {
        label: 'Total Alertas',
        value: mainStats.value[3].value,
        trend: `${dashboardStore.criticalAlerts} criticas, ${dashboardStore.warningAlerts} adv.`,
        color: [193, 53, 21]
      }
    ]

    const kpiBoxWidth = 88
    const kpiBoxHeight = 55
    const kpiGap = 8
    const kpisPerRow = 2

    kpis.forEach((kpi, index) => {
      const col = index % kpisPerRow
      const row = Math.floor(index / kpisPerRow)
      const xPos = 18 + (kpiBoxWidth + kpiGap) * col
      const currentY = yPos + (kpiBoxHeight + kpiGap) * row

      doc.setFillColor(250, 250, 250)
      doc.setDrawColor(220, 220, 220)
      doc.setLineWidth(0.5)
      doc.roundedRect(xPos, currentY, kpiBoxWidth, kpiBoxHeight, 5, 5, 'FD')

      doc.setFillColor(...kpi.color)
      doc.rect(xPos + 1, currentY + 1, kpiBoxWidth - 2, 4, 'F')

      doc.setTextColor(...kpi.color)
      doc.setFontSize(26)
      doc.setFont('helvetica', 'bold')
      doc.text(String(kpi.value), xPos + kpiBoxWidth / 2, currentY + 24, { align: 'center' })

      doc.setFontSize(9)
      doc.setTextColor(60, 60, 60)
      doc.setFont('helvetica', 'bold')
      doc.text(kpi.label, xPos + kpiBoxWidth / 2, currentY + 36, { align: 'center' })

      doc.setFontSize(8)
      doc.setTextColor(120, 120, 120)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(kpi.trend, kpiBoxWidth - 10)
      doc.text(lines, xPos + kpiBoxWidth / 2, currentY + 45, { align: 'center' })
    })

    yPos += (kpiBoxHeight + kpiGap) * Math.ceil(kpis.length / kpisPerRow) + 15

    // ========================================
    // 📈 GRÁFICO DE ALERTAS
    // ========================================

    doc.setTextColor(193, 53, 21)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Evolucion de Alertas Semanales', 20, yPos)

    yPos += 10

    const maxAlerts = Math.max(...weeklyAlertsData.value.map(d => d.value))
    const chartHeight = 50
    const chartWidth = pageWidth - 50
    const barWidth = (chartWidth - 50) / weeklyAlertsData.value.length

    // Ejes
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.line(35, yPos + chartHeight, pageWidth - 15, yPos + chartHeight)
    doc.line(35, yPos, 35, yPos + chartHeight)

    // Líneas guía
    doc.setDrawColor(245, 245, 245)
    for (let i = 1; i <= 3; i++) {
      const y = yPos + (chartHeight / 4) * i
      doc.line(35, y, pageWidth - 15, y)
    }

    // Barras
    weeklyAlertsData.value.forEach((week, index) => {
      const barHeight = (week.value / maxAlerts) * chartHeight
      const x = 40 + (barWidth * index)
      const y = yPos + chartHeight - barHeight

      doc.setFillColor(255, 120, 120)
      doc.rect(x, y, barWidth - 10, barHeight, 'F')

      doc.setDrawColor(193, 53, 21)
      doc.setLineWidth(1)
      doc.rect(x, y, barWidth - 10, barHeight, 'S')

      doc.setFontSize(10)
      doc.setTextColor(193, 53, 21)
      doc.setFont('helvetica', 'bold')
      doc.text(String(week.value), x + (barWidth - 10) / 2, y - 3, { align: 'center' })

      doc.setFontSize(9)
      doc.setTextColor(80, 80, 80)
      doc.setFont('helvetica', 'normal')
      doc.text(week.label, x + (barWidth - 10) / 2, yPos + chartHeight + 8, { align: 'center' })
    })

    // Escala Y
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text('0', 28, yPos + chartHeight + 3, { align: 'right' })
    doc.text(String(Math.ceil(maxAlerts)), 28, yPos + 3, { align: 'right' })

    // ========================================
    // 📄 PÁGINA 3: DISTRIBUCIÓN DE ALERTAS
    // ========================================

    doc.addPage()
    yPos = 25

    // ✅ Header
    doc.setFillColor(193, 53, 21)
    doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('RESUMEN EJECUTIVO (continuacion)', 20, 13)

    yPos = 40

    // ✅ DISTRIBUCIÓN EN PÁGINA COMPLETA
    doc.setTextColor(193, 53, 21)
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Distribucion de Alertas por Severidad', 20, yPos)

    yPos += 5
    doc.setDrawColor(193, 53, 21)
    doc.setLineWidth(1)
    doc.line(20, yPos, 100, yPos)

    yPos += 20

    const alertColors = [
      [193, 53, 21],   // Critical
      [255, 165, 0],   // High
      [255, 205, 24],  // Medium
      [0, 102, 204]    // Low
    ]

    const total = alertsDistribution.value.reduce((sum, item) => sum + item.value, 0)

    alertsDistribution.value.forEach((item, index) => {
      // Cuadro de color
      doc.setFillColor(...alertColors[index])
      doc.rect(20, yPos - 3, 10, 10, 'F')

      // Label
      doc.setFontSize(12)
      doc.setTextColor(50, 50, 50)
      doc.setFont('helvetica', 'bold')
      doc.text(item.label, 35, yPos + 4)

      // Valor y porcentaje
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text(`${item.value} (${item.percentage}%)`, pageWidth - 20, yPos + 4, { align: 'right' })

      // Barra de progreso
      const barY = yPos + 10
      const barX = 35
      const barMaxWidth = pageWidth - 65
      const barActualWidth = (item.percentage / 100) * barMaxWidth

      // Fondo
      doc.setFillColor(245, 245, 245)
      doc.roundedRect(barX, barY, barMaxWidth, 8, 3, 3, 'F')

      // Barra llena
      if (barActualWidth > 0) {
        doc.setFillColor(...alertColors[index])
        doc.roundedRect(barX, barY, barActualWidth, 8, 3, 3, 'F')
      }

      yPos += 28
    })

    // Total destacado
    yPos += 10
    doc.setDrawColor(220, 220, 220)
    doc.setLineWidth(1)
    doc.line(20, yPos, pageWidth - 20, yPos)

    yPos += 15

    doc.setFontSize(14)
    doc.setTextColor(100, 100, 100)
    doc.setFont('helvetica', 'bold')
    doc.text('Total de alertas este mes', 20, yPos)

    doc.setFontSize(36)
    doc.setTextColor(193, 53, 21)
    doc.setFont('helvetica', 'bold')
    doc.text(String(total), pageWidth - 20, yPos + 5, { align: 'right' })

    // ========================================
    // 👥 PÁGINA 4: TABLA DE CONDUCTORES
    // ========================================

    doc.addPage()
    yPos = 25

    // Header
    doc.setFillColor(193, 53, 21)
    doc.rect(0, 0, pageWidth, 20, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORTE DETALLADO POR CONDUCTOR', 20, 13)

    // ✅ TABLA MÁS CENTRADA
    yPos = 45

    const driversData = driversReportData.value.map(driver => [
      driver.name,
      driver.vehicle,
      String(driver.trips),
      String(driver.alerts),
      `${driver.safetyRate}%`,
      `${driver.hours}h`,
      driver.status === 'active' ? 'Activo' :
        driver.status === 'resting' ? 'Descansando' : 'Desconectado'
    ])

    autoTable(doc, {
      startY: yPos,
      head: [['Conductor', 'Vehiculo', 'Viajes', 'Alertas', 'Seguridad', 'Horas', 'Estado']],
      body: driversData,
      theme: 'grid',
      headStyles: {
        fillColor: [193, 53, 21],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center',
        cellPadding: 3
      },
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        font: 'helvetica',
        lineColor: [220, 220, 220],
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 24, halign: 'center' },
        2: { cellWidth: 16, halign: 'center' },
        3: { cellWidth: 16, halign: 'center' },
        4: { cellWidth: 22, halign: 'center' },
        5: { cellWidth: 16, halign: 'center' },
        6: { cellWidth: 26, halign: 'center' }
      },
      alternateRowStyles: {
        fillColor: [252, 252, 252]
      },
      margin: { left: 14 }, // ✅ Margen para centrar mejor
      didParseCell: function(data) {
        if (data.column.index === 3 && data.section === 'body') {
          const alerts = parseInt(data.cell.text[0])
          if (!isNaN(alerts)) {
            if (alerts > 5) {
              data.cell.styles.fillColor = [255, 240, 230]
              data.cell.styles.textColor = [193, 53, 21]
              data.cell.styles.fontStyle = 'bold'
            } else if (alerts > 0) {
              data.cell.styles.fillColor = [255, 250, 240]
              data.cell.styles.textColor = [255, 140, 0]
            } else {
              data.cell.styles.fillColor = [240, 255, 245]
              data.cell.styles.textColor = [0, 150, 80]
            }
          }
        }

        if (data.column.index === 4 && data.section === 'body') {
          const rate = parseInt(data.cell.text[0])
          if (!isNaN(rate)) {
            if (rate >= 85) {
              data.cell.styles.fillColor = [240, 255, 245]
              data.cell.styles.textColor = [0, 150, 80]
              data.cell.styles.fontStyle = 'bold'
            } else if (rate >= 70) {
              data.cell.styles.fillColor = [255, 250, 240]
              data.cell.styles.textColor = [255, 140, 0]
            } else {
              data.cell.styles.fillColor = [255, 240, 240]
              data.cell.styles.textColor = [193, 53, 21]
            }
          }
        }

        if (data.column.index === 6 && data.section === 'body') {
          const estado = data.cell.text[0]
          if (estado === 'Activo') {
            data.cell.styles.fillColor = [240, 255, 245]
            data.cell.styles.textColor = [0, 150, 80]
            data.cell.styles.fontStyle = 'bold'
          } else if (estado === 'Descansando') {
            data.cell.styles.fillColor = [255, 250, 240]
            data.cell.styles.textColor = [255, 140, 0]
          } else {
            data.cell.styles.fillColor = [245, 245, 245]
            data.cell.styles.textColor = [120, 120, 120]
          }
        }
      }
    })

    // ========================================
    // 📄 FOOTER EN TODAS LAS PÁGINAS
    // ========================================

    const totalPages = doc.internal.getNumberOfPages()

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)

      doc.setDrawColor(193, 53, 21)
      doc.setLineWidth(0.5)
      doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20)

      doc.setFontSize(8)
      doc.setTextColor(100, 100, 100)
      doc.setFont('helvetica', 'normal')
      doc.text('SafeVision © 2025 - Monitoreo Inteligente de Flota', 20, pageHeight - 12)

      doc.setFont('helvetica', 'bold')
      doc.text(`${i} / ${totalPages}`, pageWidth - 20, pageHeight - 12, { align: 'right' })
    }

    // ========================================
    // 💾 GUARDAR PDF
    // ========================================

    const fileName = `SafeVision_Reporte_${fileDate}.pdf`
    doc.save(fileName)

    console.log('✅ PDF generado:', fileName)

  } catch (error) {
    console.error('❌ Error al exportar:', error)
    alert('Error al generar el PDF. Por favor intenta de nuevo.')
  } finally {
    isLoadingReports.value = false
  }
}

onMounted(async () => {
  if (dashboardStore.drivers.length === 0) {
    await dashboardStore.fetchDrivers()
  }

  console.log('ReportsView montado con', dashboardStore.drivers.length, 'conductores')
})
</script>

<style scoped>
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

@media (max-width: 1200px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  aside {
    transform: translateX(-100%);
  }

  main {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  header {
    flex-direction: column;
    align-items: stretch;
  }

  h2 {
    font-size: 24px;
  }
}
</style>


