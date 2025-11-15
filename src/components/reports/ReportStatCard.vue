<template>
  <div :class="['bg-white rounded-xl p-6 flex gap-5 items-start shadow-sm transition-all duration-300 border border-gray-200 hover:-translate-y-1 hover:shadow-lg', variantClass]">
    <div :class="['w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0', iconClass]" v-html="icon"></div>
    <div class="flex-1 flex flex-col gap-1">
      <p class="text-4xl font-bold text-gray-900 m-0 leading-tight">{{ value }}</p>
      <p class="text-sm text-gray-500 font-medium m-0">{{ label }}</p>
      <p v-if="trend" :class="['text-xs font-semibold m-1 flex items-center gap-1', trendTextClass]">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline v-if="trendDirection === 'up'" points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline v-else points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        </svg>
        {{ trend }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon: { type: String, required: true },
  value: { type: [String, Number], required: true },
  label: { type: String, required: true },
  trend: { type: String, default: '' },
  trendDirection: { type: String, default: 'up', validator: (value) => ['up', 'down'].includes(value) },
  variant: { type: String, default: 'default', validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value) }
})

const variantClass = computed(() => '')

const iconClass = computed(() => {
  const classes = {
    default: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
    success: 'bg-gradient-to-br from-success to-green-700 text-white',
    warning: 'bg-gradient-to-br from-warning to-orange-500 text-white',
    danger: 'bg-gradient-to-br from-primary to-primary-dark text-white'
  }
  return classes[props.variant]
})

// ✅ COHERENCIA: El color del trend depende del variant y la dirección
const trendTextClass = computed(() => {
  // Si es success variant y va hacia arriba = verde
  if (props.variant === 'success' && props.trendDirection === 'up') {
    return 'text-success'
  }

  // Si es danger variant y va hacia abajo = rojo (malo)
  if (props.variant === 'danger' && props.trendDirection === 'down') {
    return 'text-primary'
  }

  // Si es warning variant y va hacia abajo = naranja (advertencia)
  if (props.variant === 'warning' && props.trendDirection === 'down') {
    return 'text-warning'
  }

  // Si va hacia arriba en general = verde (bueno)
  if (props.trendDirection === 'up') {
    return 'text-success'
  }

  // Si va hacia abajo en general = rojo (malo)
  return 'text-primary'
})
</script>
