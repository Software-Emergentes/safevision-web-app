<template>
  <div class="flex min-h-screen bg-gray-100 font-sans">
    <AppSidebar />

    <main class="ml-[280px] flex-1 p-8 w-[calc(100%-280px)]">
      <!-- Header -->
      <header class="flex justify-between items-start mb-8">
        <div class="header-left">
          <h2 class="text-[32px] font-bold text-gray-900 m-0 mb-1.5">Panel de Control</h2>
          <p class="text-base text-gray-500 m-0">Monitoreo en tiempo real de conductores</p>
        </div>

        <div class="flex items-center gap-4">
          <button
            @click="refreshData"
            :disabled="dashboardStore.isLoading"
            class="py-2.5 px-5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm font-semibold cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-gray-100 hover:border-primary hover:text-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              :class="{ 'animate-spin': dashboardStore.isLoading }"
            >
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
            Actualizar
          </button>
        </div>
      </header>

      <!-- Stats Cards -->
      <section class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6 mb-8">
        <StatCard
          label="Total Conductores"
          :value="dashboardStore.totalDrivers"
          subtitle="En la flota"
          variant="default"
        >
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

        <StatCard
          label="Alertas Críticas"
          :value="dashboardStore.criticalAlerts"
          subtitle="Requieren atención inmediata"
          variant="danger"
        >
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

      <!-- Filters Section -->
      <section class="bg-white rounded-xl p-6 mb-6 shadow-sm">
        <div class="flex gap-3 mb-5 flex-wrap">
          <button
            v-for="filter in filterOptions"
            :key="filter.value"
            @click="dashboardStore.setFilter(filter.value)"
            :class="[
              'flex items-center gap-2 py-2.5 px-4 border rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300',
              dashboardStore.selectedFilter === filter.value
                ? `${filter.activeClass} border-transparent text-white`
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200 hover:border-primary'
            ]"
          >
            <span class="flex items-center justify-center" v-html="filter.icon"></span>
            <span>{{ filter.label }}</span>
            <span :class="['py-0.5 px-2 rounded-xl text-xs font-bold', dashboardStore.selectedFilter === filter.value ? 'bg-white/20' : 'bg-black/10']">
              {{ getFilterCount(filter.value) }}
            </span>
          </button>
        </div>

        <div class="relative">
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por nombre, vehículo o ruta..."
            class="w-full py-3 px-4 pl-11 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-100 transition-all duration-300 focus:outline-none focus:border-primary focus:bg-white placeholder:text-gray-400"
          />
        </div>
      </section>

      <!-- Drivers Section -->
      <section class="min-h-[400px]">
        <div v-if="dashboardStore.isLoading" class="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <div class="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5"></div>
          <p>Cargando conductores...</p>
        </div>

        <div v-else-if="dashboardStore.error" class="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary mb-4">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>{{ dashboardStore.error }}</p>
          <button @click="refreshData" class="mt-4 py-2.5 px-6 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5">
            Reintentar
          </button>
        </div>

        <div v-else-if="filteredAndSearchedDrivers.length === 0" class="flex flex-col items-center justify-center py-20 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400 mb-4">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No se encontraron conductores</p>
          <button @click="clearFilters" class="mt-4 py-2.5 px-6 bg-primary text-white border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-primary-dark hover:-translate-y-0.5">
            Limpiar filtros
          </button>
        </div>

        <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(340px,1fr))] gap-6">
          <DriverCard
            v-for="driver in filteredAndSearchedDrivers"
            :key="driver.id"
            :driver="driver"
            @view-details="handleViewDetails"
          />
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
  {
    value: 'all',
    label: 'Todos',
    activeClass: 'bg-gradient-to-r from-primary to-primary-dark',
    inactiveClass: 'hover:border-primary',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'
  },
  {
    value: 'active',
    label: 'Activos',
    activeClass: 'bg-gradient-to-r from-primary to-primary-dark',
    inactiveClass: 'hover:border-primary',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>'
  },
  {
    value: 'safe',
    label: 'Seguros',
    activeClass: 'bg-gradient-to-r from-success to-green-700',
    inactiveClass: 'hover:border-success',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  },
  {
    value: 'critical',
    label: 'Críticos',
    activeClass: 'bg-gradient-to-r from-primary to-primary-dark',
    inactiveClass: 'hover:border-primary',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  },
  {
    value: 'high',
    label: 'Altos',
    activeClass: 'bg-gradient-to-r from-orange-500 to-orange-700',
    inactiveClass: 'hover:border-orange-500',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
  },
  {
    value: 'medium',
    label: 'Moderados',
    activeClass: 'bg-gradient-to-r from-warning to-orange-500',
    inactiveClass: 'hover:border-warning',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
  },
  {
    value: 'low',
    label: 'Leves',
    activeClass: 'bg-gradient-to-r from-info to-blue-700',
    inactiveClass: 'hover:border-info',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
  }
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
    case 'safe':
      return dashboardStore.safeDrivers
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
@media (max-width: 1200px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
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
    gap: 16px;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  h2 {
    font-size: 24px;
  }
}
</style>
