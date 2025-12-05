<template>
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-900 m-0">{{ title }}</h3>
      <div v-if="availablePeriods.length > 1" class="flex gap-2">
        <button
          v-for="period in availablePeriods"
          :key="period"
          @click="selectedPeriod = period"
          :class="[
            'py-2 px-4 bg-gray-100 border border-gray-200 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-300',
            selectedPeriod === period ? 'bg-primary border-primary text-white' : 'text-gray-500 hover:bg-gray-200 hover:border-primary'
          ]"
        >
          {{ getPeriodLabel(period) }}
        </button>
      </div>
    </div>

    <div class="flex items-end gap-3 min-h-[280px]">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="flex-1 flex flex-col items-center gap-2"
      >
        <div class="w-full flex flex-col items-center">
          <!-- Barra -->
          <div class="w-full relative" style="height: 200px;">
            <div
              :class="[
                'absolute bottom-0 w-full rounded-[8px] transition-all duration-500 ease-out',
                getBarColor(item.value)
              ]"
              :style="{ height: getBarHeight(item.value) + '%' }"
            ></div>

            <!-- Valor flotando arriba de la barra (sin fondo) -->
            <div
              class="absolute w-full text-center transition-all duration-500"
              :style="{ bottom: getBarHeight(item.value) + '%', paddingBottom: '4px' }"
            >
              <span class="text-sm font-bold text-gray-900">
                {{ item.value }}{{ unit }}
              </span>
            </div>
          </div>

          <!-- Label del mes -->
          <span class="text-xs text-gray-500 font-medium mt-2">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="flex justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-success rounded-sm"></div>
        <span class="text-xs text-gray-500">{{ getLegendLabel('optimal') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-warning rounded-sm"></div>
        <span class="text-xs text-gray-500">{{ getLegendLabel('acceptable') }}</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-3 h-3 bg-primary rounded-sm"></div>
        <span class="text-xs text-gray-500">{{ getLegendLabel('critical') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  maxValue: {
    type: Number,
    default: 100
  },
  unit: {
    type: String,
    default: ''
  },
  availablePeriods: {
    type: Array,
    default: () => ['month']
  },
  defaultPeriod: {
    type: String,
    default: 'month'
  },
  chartType: {
    type: String,
    default: 'performance', // 'performance' o 'alerts'
    validator: (value) => ['performance', 'alerts'].includes(value)
  }
})

const selectedPeriod = ref(props.defaultPeriod)

const getPeriodLabel = (period) => {
  const labels = {
    week: 'Semana',
    month: 'Mes',
    quarter: 'Trimestre',
    year: 'Año'
  }
  return labels[period] || period
}

// ✅ LÓGICA DE COLORES CORREGIDA
const getBarColor = (value) => {
  if (props.chartType === 'alerts') {
    // ALERTAS: Menos es mejor
    // 0-2 alertas = Verde
    // 3-5 alertas = Amarillo
    // 6+ alertas = Rojo
    if (value <= 2) {
      return 'bg-success' // Verde
    } else if (value <= 5) {
      return 'bg-warning' // Amarillo
    } else {
      return 'bg-primary' // Rojo
    }
  } else {
    // RENDIMIENTO: Más es mejor
    // 80-100% = Verde
    // 50-79% = Amarillo
    // 0-49% = Rojo
    if (value >= 80) {
      return 'bg-success' // Verde
    } else if (value >= 50) {
      return 'bg-warning' // Amarillo
    } else {
      return 'bg-primary' // Rojo
    }
  }
}

// ✅ Mantiene la altura original
const getBarHeight = (value) => {
  if (props.maxValue === 0) return 0
  return Math.min(100, (value / props.maxValue) * 100)
}

// ✅ Leyendas según tipo
const getLegendLabel = (type) => {
  if (props.chartType === 'alerts') {
    const labels = {
      optimal: 'Óptimo (0-2)',
      acceptable: 'Aceptable (3-5)',
      critical: 'Crítico (6+)'
    }
    return labels[type]
  } else {
    const labels = {
      optimal: 'Óptimo (80-100%)',
      acceptable: 'Aceptable (50-79%)',
      critical: 'Crítico (0-49%)'
    }
    return labels[type]
  }
}
</script>
