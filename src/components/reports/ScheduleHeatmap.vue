<template>
  <div class="bg-white rounded-xl p-6 shadow-sm">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 m-0 mb-1">Alertas por Horario</h3>
      <p class="text-sm text-gray-500 m-0">Distribución de alertas por día y hora</p>
    </div>

    <div class="flex flex-col gap-2">
      <div class="flex pl-[100px] gap-1">
        <span v-for="hour in hours" :key="hour" class="flex-1 min-w-[50px] text-[11px] text-gray-500 text-center">
          {{ hour }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <div v-for="day in days" :key="day.name" class="flex items-center gap-2">
          <span class="w-[92px] text-[13px] font-medium text-gray-900">{{ day.name }}</span>
          <div class="flex gap-1 flex-1">
            <div
              v-for="(value, hourIndex) in day.hours"
              :key="hourIndex"
              :class="['flex-1 min-w-[50px] h-10 rounded flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 hover:shadow-md', getIntensityClass(value)]"
              :title="`${day.name} ${hours[hourIndex]}: ${value} alertas`"
            >
              <span :class="['text-[11px] font-semibold', value === 0 ? 'text-gray-500' : 'text-white drop-shadow-sm']">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-gray-200">
      <span class="text-xs text-gray-500">Menos alertas</span>
      <div class="flex gap-1">
        <div class="w-6 h-6 rounded border border-gray-200 bg-gray-100"></div>
        <div class="w-6 h-6 rounded border border-gray-200 bg-[#B8E6D5]"></div>
        <div class="w-6 h-6 rounded border border-gray-200 bg-[#FFE8B3]"></div>
        <div class="w-6 h-6 rounded border border-gray-200 bg-[#FFB899]"></div>
        <div class="w-6 h-6 rounded border border-gray-200 bg-gradient-to-br from-primary to-primary-dark"></div>
      </div>
      <span class="text-xs text-gray-500">Más alertas</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  data: { type: Array, default: () => [] }
})

const hours = ref([
  '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
  '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
])

const days = ref([
  { name: 'Lunes', hours: [2, 5, 8, 3, 4, 6, 10, 12, 8, 15, 18, 20] },
  { name: 'Martes', hours: [3, 4, 6, 5, 7, 8, 12, 14, 10, 16, 19, 22] },
  { name: 'Miércoles', hours: [1, 3, 5, 4,5, 7, 11, 13, 9, 14, 17, 19] },
  { name: 'Jueves', hours: [4, 6, 9, 6, 8, 9, 13, 15, 11, 17, 20, 23] },
  { name: 'Viernes', hours: [5, 7, 10, 8, 9, 10, 14, 16, 12, 18, 21, 25] },
  { name: 'Sábado', hours: [3, 5, 7, 5, 6, 8, 10, 11, 9, 13, 15, 18] },
  { name: 'Domingo', hours: [2, 4, 6, 4, 5, 6, 8, 9, 7, 11, 13, 16] }
])

const getIntensityClass = (value) => {
  if (value === 0) return 'bg-gray-100'
  if (value <= 5) return 'bg-[#B8E6D5]'
  if (value <= 10) return 'bg-[#FFE8B3]'
  if (value <= 15) return 'bg-[#FFB899]'
  return 'bg-gradient-to-br from-primary to-primary-dark'
}
</script>
