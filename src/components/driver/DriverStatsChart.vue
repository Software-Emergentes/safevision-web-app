<template>
  <div class="bg-white rounded-xl p-6 shadow-sm flex flex-col">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
      <h3 class="text-lg font-semibold text-gray-900 m-0">{{ title }}</h3>
      <div class="flex gap-2 bg-gray-100 p-1 rounded-lg">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          :class="[
            'py-1.5 px-3 bg-transparent border-none rounded-md text-gray-500 text-[13px] font-semibold cursor-pointer transition-all duration-300',
            selectedPeriod === period.value ? 'bg-primary text-white' : 'hover:bg-primary/10 hover:text-primary'
          ]"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Chart Content -->
    <div class="min-h-[300px] py-5">
      <div class="flex justify-between items-end h-[280px] gap-3 px-2">
        <div
          v-for="(item, index) in chartData"
          :key="index"
          class="flex-1 flex flex-col items-center gap-3"
        >
          <div class="w-full h-[240px] flex items-end relative">
            <div
              :style="{
                height: `${calculateBarHeight(item.value)}%`,
                background: getBarColor(item.value)
              }"
              class="w-full rounded-t-lg relative transition-all duration-300 cursor-pointer hover:opacity-80 hover:-translate-y-1 min-h-[20px] flex items-start justify-center pt-2"
            >
              <span class="text-xs font-bold text-white drop-shadow-sm">{{ item.value }}{{ unit }}</span>
            </div>
          </div>
          <span class="text-xs text-gray-500 font-medium text-center">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex justify-center gap-6 mt-6 pt-5 border-t border-gray-200 flex-wrap">
      <div v-for="legend in legends" :key="legend.label" class="flex items-center gap-2">
        <span :style="{ background: legend.color }" class="w-4 h-4 rounded"></span>
        <span class="text-[13px] text-gray-500">{{ legend.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  data: { type: Array, required: true },
  unit: { type: String, default: '' },
  maxValue: { type: Number, default: 100 },
  availablePeriods: { type: Array, default: () => ['week', 'month', 'quarter', 'year'] },
  defaultPeriod: { type: String, default: 'month' }
})

const selectedPeriod = ref(props.defaultPeriod)

const allPeriods = [
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' }
]

const periods = computed(() => {
  return allPeriods.filter(period => props.availablePeriods.includes(period.value))
})

const legends = [
  { label: 'Óptimo (80-100%)', color: '#00CA75' },
  { label: 'Aceptable (50-79%)', color: '#FFCD18' },
  { label: 'Crítico (0-49%)', color: '#C13515' }
]

const chartData = computed(() => {
  return props.data
})

const calculateBarHeight = (value) => {
  return (value / props.maxValue) * 100
}

const getBarColor = (value) => {
  const percentage = (value / props.maxValue) * 100

  if (percentage >= 80) return 'linear-gradient(180deg, #00CA75 0%, #00A060 100%)'
  if (percentage >= 50) return 'linear-gradient(180deg, #FFCD18 0%, #FFA500 100%)'
  return 'linear-gradient(180deg, #C13515 0%, #8B2810 100%)'
}
</script>
