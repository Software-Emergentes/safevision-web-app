<template>
  <div class="bg-white rounded-xl shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-xl font-bold text-gray-900 mb-1">Distribución de Alertas por Franja Horaria</h3>
      <p class="text-sm text-gray-500">Alertas agrupadas por momento del día</p>
    </div>

    <!-- Grid de Franjas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Madrugada -->
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌙</span>
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Madrugada</h4>
            <p class="text-xs text-gray-500">00:00 - 05:59</p>
          </div>
        </div>

        <div class="relative h-40 bg-gray-50 rounded-lg overflow-hidden">
          <div
            class="absolute bottom-0 w-full transition-all duration-500"
            :class="{
              'bg-gradient-to-t from-green-500 to-green-300': timeSlots.dawn === 0,
              'bg-gradient-to-t from-yellow-500 to-yellow-300': timeSlots.dawn > 0 && timeSlots.dawn <= 5,
              'bg-gradient-to-t from-orange-500 to-orange-300': timeSlots.dawn > 5 && timeSlots.dawn <= 10,
              'bg-gradient-to-t from-red-500 to-red-300': timeSlots.dawn > 10
            }"
            :style="{ height: getBarHeight(timeSlots.dawn) + '%' }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ timeSlots.dawn }}</div>
              <div class="text-xs text-gray-600">alertas</div>
            </div>
          </div>
        </div>

        <div class="mt-2 text-xs text-gray-500 text-center">
          {{ getPercentage(timeSlots.dawn) }}% del total
        </div>
      </div>

      <!-- Mañana -->
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">☀️</span>
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Mañana</h4>
            <p class="text-xs text-gray-500">06:00 - 11:59</p>
          </div>
        </div>

        <div class="relative h-40 bg-gray-50 rounded-lg overflow-hidden">
          <div
            class="absolute bottom-0 w-full transition-all duration-500"
            :class="{
              'bg-gradient-to-t from-green-500 to-green-300': timeSlots.morning === 0,
              'bg-gradient-to-t from-yellow-500 to-yellow-300': timeSlots.morning > 0 && timeSlots.morning <= 5,
              'bg-gradient-to-t from-orange-500 to-orange-300': timeSlots.morning > 5 && timeSlots.morning <= 10,
              'bg-gradient-to-t from-red-500 to-red-300': timeSlots.morning > 10
            }"
            :style="{ height: getBarHeight(timeSlots.morning) + '%' }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ timeSlots.morning }}</div>
              <div class="text-xs text-gray-600">alertas</div>
            </div>
          </div>
        </div>

        <div class="mt-2 text-xs text-gray-500 text-center">
          {{ getPercentage(timeSlots.morning) }}% del total
        </div>
      </div>

      <!-- Tarde -->
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌤️</span>
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Tarde</h4>
            <p class="text-xs text-gray-500">12:00 - 17:59</p>
          </div>
        </div>

        <div class="relative h-40 bg-gray-50 rounded-lg overflow-hidden">
          <div
            class="absolute bottom-0 w-full transition-all duration-500"
            :class="{
              'bg-gradient-to-t from-green-500 to-green-300': timeSlots.afternoon === 0,
              'bg-gradient-to-t from-yellow-500 to-yellow-300': timeSlots.afternoon > 0 && timeSlots.afternoon <= 5,
              'bg-gradient-to-t from-orange-500 to-orange-300': timeSlots.afternoon > 5 && timeSlots.afternoon <= 10,
              'bg-gradient-to-t from-red-500 to-red-300': timeSlots.afternoon > 10
            }"
            :style="{ height: getBarHeight(timeSlots.afternoon) + '%' }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ timeSlots.afternoon }}</div>
              <div class="text-xs text-gray-600">alertas</div>
            </div>
          </div>
        </div>

        <div class="mt-2 text-xs text-gray-500 text-center">
          {{ getPercentage(timeSlots.afternoon) }}% del total
        </div>
      </div>

      <!-- Noche -->
      <div class="relative">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🌙</span>
          </div>
          <div>
            <h4 class="font-bold text-gray-900">Noche</h4>
            <p class="text-xs text-gray-500">18:00 - 23:59</p>
          </div>
        </div>

        <div class="relative h-40 bg-gray-50 rounded-lg overflow-hidden">
          <div
            class="absolute bottom-0 w-full transition-all duration-500"
            :class="{
              'bg-gradient-to-t from-green-500 to-green-300': timeSlots.night === 0,
              'bg-gradient-to-t from-yellow-500 to-yellow-300': timeSlots.night > 0 && timeSlots.night <= 5,
              'bg-gradient-to-t from-orange-500 to-orange-300': timeSlots.night > 5 && timeSlots.night <= 10,
              'bg-gradient-to-t from-red-500 to-red-300': timeSlots.night > 10
            }"
            :style="{ height: getBarHeight(timeSlots.night) + '%' }"
          ></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold text-gray-900">{{ timeSlots.night }}</div>
              <div class="text-xs text-gray-600">alertas</div>
            </div>
          </div>
        </div>

        <div class="mt-2 text-xs text-gray-500 text-center">
          {{ getPercentage(timeSlots.night) }}% del total
        </div>
      </div>
    </div>

    <!-- Resumen -->
    <div class="mt-8 pt-6 border-t border-gray-200">
      <h4 class="text-sm font-semibold text-gray-600 mb-4 uppercase tracking-wide">Resumen</h4>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <!-- Total Alertas -->
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-gray-900 mb-1">{{ totalAlerts }}</div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">Total de Alertas</div>
        </div>

        <!-- Horario Más Crítico -->
        <div class="bg-red-50 rounded-lg p-4 text-center border-2 border-red-200">
          <div class="flex items-center justify-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-red-600">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div class="text-2xl font-bold text-red-600">{{ peakTimeSlot }}</div>
          </div>
          <div class="text-xs text-red-700 font-semibold uppercase tracking-wide">Horario Más Crítico</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ getSlotCount(peakTimeSlot) }} alertas ({{ getSlotPercentage(peakTimeSlot) }}%)
          </div>
        </div>

        <!-- Horario Más Seguro -->
        <div class="bg-green-50 rounded-lg p-4 text-center border-2 border-green-200">
          <div class="flex items-center justify-center gap-2 mb-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-600">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <div class="text-2xl font-bold text-green-600">{{ safestTimeSlot }}</div>
          </div>
          <div class="text-xs text-green-700 font-semibold uppercase tracking-wide">Horario Más Seguro</div>
          <div class="text-xs text-gray-500 mt-1">
            {{ getSlotCount(safestTimeSlot) }} alertas ({{ getSlotPercentage(safestTimeSlot) }}%)
          </div>
        </div>

        <!-- Promedio por Franja -->
        <div class="bg-blue-50 rounded-lg p-4 text-center">
          <div class="text-3xl font-bold text-blue-600 mb-1">{{ averagePerSlot.toFixed(1) }}</div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">Promedio por Franja</div>
          <div class="text-xs text-gray-400 mt-1">{{ totalAlerts }} ÷ 4 franjas</div>
        </div>
      </div>
    </div>

    <!-- Mensaje si no hay datos -->
    <div
      v-if="totalAlerts === 0"
      class="text-center py-12"
    >
      <svg
        class="mx-auto mb-4 text-gray-300"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <p class="text-gray-500 text-sm">No hay alertas registradas</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  alerts: {
    type: Array,
    required: true,
    default: () => []
  }
})

// ✅ Calcular franjas horarias desde las alertas
const timeSlots = computed(() => {
  const slots = {
    dawn: 0,       // 00:00 - 05:59
    morning: 0,    // 06:00 - 11:59
    afternoon: 0,  // 12:00 - 17:59
    night: 0       // 18:00 - 23:59
  }

  if (!props.alerts || props.alerts.length === 0) {
    return slots
  }

  props.alerts.forEach(alert => {
    // Usar generatedAt del backend (timestamp ISO)
    const hour = extractHour(alert.generatedAt)

    if (hour === null) return

    // Asignar a la franja correspondiente
    if (hour >= 0 && hour < 6) {
      slots.dawn++
    } else if (hour >= 6 && hour < 12) {
      slots.morning++
    } else if (hour >= 12 && hour < 18) {
      slots.afternoon++
    } else {
      slots.night++
    }
  })

  return slots
})

// ✅ Extraer hora del timestamp ISO
const extractHour = (timeString) => {
  if (!timeString) return null

  // Timestamp ISO (2025-12-03T23:04:35.267674)
  try {
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.getHours()
    }
  } catch (error) {
    console.error('Error parseando fecha:', error)
  }

  return null
}

// ✅ Total de alertas
const totalAlerts = computed(() => {
  return timeSlots.value.dawn +
    timeSlots.value.morning +
    timeSlots.value.afternoon +
    timeSlots.value.night
})

// ✅ Altura de barra (proporcional al máximo)
const getBarHeight = (count) => {
  if (totalAlerts.value === 0) return 0
  const max = Math.max(
    timeSlots.value.dawn,
    timeSlots.value.morning,
    timeSlots.value.afternoon,
    timeSlots.value.night
  )
  return max === 0 ? 0 : (count / max) * 100
}

// ✅ Porcentaje
const getPercentage = (count) => {
  if (totalAlerts.value === 0) return 0
  return Math.round((count / totalAlerts.value) * 100)
}

// ✅ Franja con más alertas
const peakTimeSlot = computed(() => {
  const slots = timeSlots.value
  const max = Math.max(slots.dawn, slots.morning, slots.afternoon, slots.night)

  if (slots.night === max) return 'Noche'
  if (slots.afternoon === max) return 'Tarde'
  if (slots.morning === max) return 'Mañana'
  if (slots.dawn === max) return 'Madrugada'
  return '-'
})

// ✅ Franja con menos alertas
const safestTimeSlot = computed(() => {
  const slots = timeSlots.value
  const min = Math.min(slots.dawn, slots.morning, slots.afternoon, slots.night)

  if (slots.dawn === min) return 'Madrugada'
  if (slots.morning === min) return 'Mañana'
  if (slots.afternoon === min) return 'Tarde'
  if (slots.night === min) return 'Noche'
  return '-'
})

// ✅ Promedio por franja
const averagePerSlot = computed(() => {
  return totalAlerts.value > 0 ? Math.round(totalAlerts.value / 4) : 0
})

// ✅ Obtener conteo de alertas para una franja específica
const getSlotCount = (slotName) => {
  const slotMap = {
    'Madrugada': timeSlots.value.dawn,
    'Mañana': timeSlots.value.morning,
    'Tarde': timeSlots.value.afternoon,
    'Noche': timeSlots.value.night
  }
  return slotMap[slotName] || 0
}

// ✅ Obtener porcentaje de una franja específica
const getSlotPercentage = (slotName) => {
  const count = getSlotCount(slotName)
  return totalAlerts.value > 0 ? Math.round((count / totalAlerts.value) * 100) : 0
}
</script>
