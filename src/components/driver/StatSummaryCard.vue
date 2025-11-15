<template>
  <div :class="['bg-white rounded-xl p-5 flex gap-4 items-start border border-gray-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md', variantClass]">
    <div :class="['w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0 text-xl', iconClass]">
      <slot name="icon"></slot>
    </div>
    <div class="flex-1 flex flex-col gap-1">
      <p class="text-[13px] text-gray-500 font-medium m-0">{{ label }}</p>
      <p class="text-2xl font-bold text-gray-900 m-0 flex items-baseline gap-1">
        {{ value }}
        <span v-if="unit" class="text-sm font-medium text-gray-500">{{ unit }}</span>
      </p>
      <p v-if="trend" :class="['text-xs font-semibold m-0 flex items-center gap-1', trendDirection === 'up' ? 'text-success' : 'text-primary']">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
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
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  trend: { type: String, default: '' },
  trendDirection: { type: String, default: 'up', validator: (value) => ['up', 'down'].includes(value) },
  variant: { type: String, default: 'default', validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value) }
})

const variantClass = computed(() => {
  const classes = {
    default: '',
    success: '',
    warning: '',
    danger: ''
  }
  return classes[props.variant]
})

const iconClass = computed(() => {
  const classes = {
    default: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
    success: 'bg-gradient-to-br from-success to-green-700 text-white',
    warning: 'bg-gradient-to-br from-warning to-orange-500 text-white',
    danger: 'bg-gradient-to-br from-primary to-primary-dark text-white'
  }
  return classes[props.variant]
})
</script>
