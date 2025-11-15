<template>
  <div class="bg-white rounded-xl p-6 shadow-sm h-full flex flex-col">
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 m-0">Distribución de Alertas</h3>
    </div>

    <div class="flex-1 flex flex-col gap-6">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="flex flex-col gap-2"
      >
        <div class="flex items-center gap-2.5">
          <div :style="{ background: item.color }" class="w-3 h-3 rounded-full flex-shrink-0"></div>
          <span class="text-sm font-medium text-gray-900 flex-1">{{ item.label }}</span>
        </div>
        <div class="flex justify-end">
          <span class="text-sm font-semibold text-gray-500">{{ item.value }} ({{ item.percentage }}%)</span>
        </div>
        <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            :style="{
              width: `${item.percentage}%`,
              background: item.color
            }"
            class="h-full rounded-full transition-all duration-600"
          ></div>
        </div>
      </div>
    </div>

    <div class="mt-6 pt-5 border-t border-gray-200 flex justify-between items-center">
      <span class="text-sm text-gray-500 font-medium">Total de alertas este mes</span>
      <span class="text-[32px] font-bold text-gray-900">{{ totalAlerts }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, required: true, default: () => [] }
})

const totalAlerts = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0)
})
</script>
