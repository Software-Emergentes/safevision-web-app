<template>
  <div class="dashboard-container">
    <AppSidebar />
    <main class="main-content">
      <header class="content-header">
        <div class="header-left">
          <h2 class="page-title">Panel de Control</h2>
          <p class="page-subtitle">Monitoreo en tiempo real de conductores</p>
        </div>
        <div class="header-right">
          <button class="refresh-btn" @click="refreshData" :disabled="dashboardStore.isLoading">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ spinning: dashboardStore.isLoading }">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Actualizar
          </button>
        </div>
      </header>

      <section class="stats-section">
        <StatCard label="Total Conductores" :value="dashboardStore.totalDrivers" subtitle="En la flota" variant="default">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </template>
        </StatCard>

        <StatCard
          label="Conductores Activos"
          :value="dashboardStore.activeDrivers"
          :subtitle="`${Math.round((dashboardStore.activeDrivers / dashboardStore.totalDrivers) * 100)}% del total`"
          variant="success"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </template>
        </StatCard>

        <StatCard label="Alertas Críticas" :value="dashboardStore.criticalAlerts" subtitle="Requieren atención inmediata" variant="danger">
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </template>
        </StatCard>

        <StatCard
          label="Alertas Altas"
          :value="highAlerts"
          subtitle="Requieren atención pronto"
          variant="warning"
        >
          <template #icon>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </template>
        </StatCard>
      </section>

      <section class="filters-section">
        <div class="filter-tabs">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            @click="dashboardStore.setFilter(filter.value)"
            class="filter-tab"
            :class="[ { active: dashboardStore.selectedFilter === filter.value }, `filter-${filter.value}` ]"
          >
            <span class="filter-icon" v-html="filter.icon"></span>
            <span class="filter-label">{{ filter.label }}</span>
            <span class="filter-count">{{ getFilterCount(filter.value) }}</span>
          </button>
        </div>

        <div class="search-container">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input v-model="searchQuery" type="text" placeholder="Buscar por nombre, vehículo o ruta..." class="search-input" />
        </div>
      </section>

      <section class="drivers-section">
        <div v-if="dashboardStore.isLoading" class="state centered">
          <div class="spinner-large"></div>
          <p>Cargando conductores...</p>
        </div>

        <div v-else-if="dashboardStore.error" class="state centered error-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{{ dashboardStore.error }}</p>
          <button @click="refreshData" class="action-btn">Reintentar</button>
        </div>

        <div v-else-if="filteredAndSearchedDrivers.length === 0" class="state centered empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No se encontraron conductores</p>
          <button @click="clearFilters" class="action-btn">Limpiar filtros</button>
        </div>

        <div v-else class="drivers-grid">
          <DriverCard v-for="driver in filteredAndSearchedDrivers" :key="driver.id" :driver="driver" @view-details="handleViewDetails" />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import StatCard from '@/components/dashboard/StatCard.vue'
import DriverCard from '@/components/dashboard/DriverCard.vue'
import { ALERT_SEVERITY } from '@/utils/constants.js'

const dashboardStore = useDashboardStore()
const searchQuery = ref('')

const highAlerts = computed(() =>
  dashboardStore.drivers.filter(d => d.severity === ALERT_SEVERITY.HIGH).length
)

const filterOptions = [
  { value: 'all', label: 'Todos', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },
  { value: 'active', label: 'Activos', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>' },
  { value: 'safe', label: 'Seguros', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' },
  { value: 'critical', label: 'Críticos', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' },
  { value: 'high', label: 'Altos', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>' },
  { value: 'medium', label: 'Moderados', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>' },
  { value: 'low', label: 'Leves', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>' }
]

const filteredAndSearchedDrivers = computed(() => {
  let drivers = Array.isArray(dashboardStore.drivers) ? dashboardStore.drivers.slice() : []

  if (dashboardStore.selectedFilter !== 'all') {
    if (dashboardStore.selectedFilter === 'active') {
      drivers = drivers.filter(d => d.status === 'active')
    } else if (dashboardStore.selectedFilter === 'safe') {
      drivers = drivers.filter(d => d.alerts === 0)
    } else if (dashboardStore.selectedFilter === 'critical') {
      drivers = drivers.filter(d => d.severity === 'Critical')
    } else if (dashboardStore.selectedFilter === 'high') {
      drivers = drivers.filter(d => d.severity === 'High')
    } else if (dashboardStore.selectedFilter === 'medium') {
      drivers = drivers.filter(d => d.severity === 'Medium')
    } else if (dashboardStore.selectedFilter === 'low') {
      drivers = drivers.filter(d => d.severity === 'Low')
    }
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    drivers = drivers.filter(driver =>
      (driver.name && driver.name.toLowerCase().includes(query)) ||
      (driver.vehicle?.plate && driver.vehicle.plate.toLowerCase().includes(query)) ||
      (driver.currentTrip?.route && driver.currentTrip.route.toLowerCase().includes(query))
    )
  }

  return drivers
})

const getFilterCount = (filterValue) => {
  switch (filterValue) {
    case 'all':
      return dashboardStore.totalDrivers
    case 'active':
      return dashboardStore.activeDrivers
    case 'safe': // ✅ NUEVO
      return (dashboardStore.drivers ?? []).filter(d => d.alerts === 0).length
    case 'critical':
      return dashboardStore.criticalAlerts
    case 'high':
      return (dashboardStore.drivers ?? []).filter(d => d.severity === 'High').length
    case 'medium':
      return (dashboardStore.drivers ?? []).filter(d => d.severity === 'Medium').length
    case 'low':
      return (dashboardStore.drivers ?? []).filter(d => d.severity === 'Low').length
    default:
      return 0
  }
}

const refreshData = async () => {
  await dashboardStore.fetchDrivers()
}

const clearFilters = () => {
  dashboardStore.setFilter('all')
  searchQuery.value = ''
}

const handleViewDetails = (driver) => {
  console.log('Ver detalles del conductor:', driver)
}

onMounted(() => {
  dashboardStore.fetchDrivers()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background: #F5F7FA;
  font-family: 'Poppins', sans-serif;
}

.main-content {
  margin-left: 280px;
  flex: 1;
  padding: 32px;
  width: calc(100% - 280px);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
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
  gap: 16px;
}

.refresh-btn {
  padding: 10px 20px;
  background: #ffffff;
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

.refresh-btn:hover:not(:disabled) {
  background: #F5F7FA;
  border-color: #C13515;
  color: #C13515;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.filters-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #F5F7FA;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  color: #74788D;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-tab:hover {
  background: #E9ECEF;
  border-color: #C13515;
}

.filter-tab.active {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  border-color: #C13515;
  color: #ffffff;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
}

.filter-tab.active .filter-count {
  background: rgba(255, 255, 255, 0.2);
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #74788D;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #E9ECEF;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  color: #222222;
  background: #F5F7FA;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #C13515;
  background: #ffffff;
}

.search-input::placeholder {
  color: #ADB5BD;
}

.drivers-section {
  min-height: 400px;
}

.drivers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
  color: #74788D;
}

.centered {
  min-height: 200px;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #E9ECEF;
  border-top-color: #C13515;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20px;
}

.error-state svg {
  color: #C13515;
  margin-bottom: 16px;
}

.empty-state svg {
  color: #ADB5BD;
  margin-bottom: 16px;
}

.action-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: #C13515;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #A72E12;
  transform: translateY(-2px);
}

@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }

  .drivers-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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

  .content-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-right {
    width: 100%;
    justify-content: space-between;
  }

  .stats-section {
    grid-template-columns: 1fr;
  }

  .filter-tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .filter-tab {
    flex-shrink: 0;
  }

  .drivers-grid {
    grid-template-columns: 1fr;
  }

  .page-title {
    font-size: 24px;
  }
}

.filter-tab.filter-critical.active {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
}

.filter-tab.filter-critical:hover:not(.active) {
  border-color: #C13515;
  color: #C13515;
}

.filter-tab.filter-high.active {
  background: linear-gradient(135deg, #FFA500 0%, #FF8C00 100%);
}

.filter-tab.filter-high:hover:not(.active) {
  border-color: #FFA500;
  color: #FFA500;
}

.filter-tab.filter-medium.active {
  background: linear-gradient(135deg, #FFCD18 0%, #FFA500 100%);
}

.filter-tab.filter-medium:hover:not(.active) {
  border-color: #FFCD18;
  color: #FFCD18;
}

.filter-tab.filter-low.active {
  background: linear-gradient(135deg, #0066CC 0%, #004C99 100%);
  color: white;
  border-color: #0066CC;
}

.filter-tab.filter-low:hover:not(.active) {
  border-color: #0066CC;
  color: #0066CC;
  background: rgba(0, 102, 204, 0.1);
}

/*  ESTILO PARA FILTRO SEGUROS */
.filter-tab.filter-safe.active {
  background: linear-gradient(135deg, #00CA75 0%, #00A060 100%);
  color: white;
  border-color: #00CA75;
}

.filter-tab.filter-safe:hover:not(.active) {
  border-color: #00CA75;
  color: #00CA75;
  background: rgba(0, 202, 117, 0.1);
}
</style>
