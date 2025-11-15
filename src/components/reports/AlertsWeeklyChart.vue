<template>
  <div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 m-0">Alertas por Semana</h3>
    </div>

    <div class="flex-1 flex items-end min-h-[300px]">
      <div class="w-full flex justify-around items-end h-[280px] gap-5 px-4">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="flex-1 flex flex-col items-center gap-3"
        >
          <div class="w-full max-w-[80px] h-[240px] flex items-end relative">
            <div
              :style="{
                height: `${calculateBarHeight(item.value)}%`,
                background: getBarColor(item.value)
              }"
              class="w-full rounded-t-lg relative transition-all duration-300 cursor-pointer hover:opacity-80 hover:-translate-y-1 min-h-[30px] flex items-start justify-center pt-2"
            >
              <span class="text-sm font-bold text-white drop-shadow-md">{{ item.value }}</span>
            </div>
          </div>
          <span class="text-[13px] text-gray-500 font-medium text-center">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true, default: () => [] }
})

const maxValue = computed(() => {
  if (props.data.length === 0) return 100
  return Math.max(...props.data.map(item => item.value))
})

const calculateBarHeight = (value) => {
  return (value / maxValue.value) * 100
}

const getBarColor = (value) => {
  const percentage = (value / maxValue.value) * 100

  if (percentage >= 80) return 'linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)'
  if (percentage >= 50) return 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)'

  return 'linear-gradient(180deg, #E9D5FF 0%, #D8B4FE 100%)'
}
</script>
