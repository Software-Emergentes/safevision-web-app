<template>
  <div class="bg-white rounded-xl p-6 flex gap-5 items-start shadow-sm transition-all duration-300 border border-gray-200 hover:-translate-y-1 hover:shadow-lg">
    <div
      :class="[
        'w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl',
        iconClasses[variant]
      ]"
    >
      <slot name="icon"></slot>
    </div>
    <div class="flex-1 flex flex-col gap-1">
      <p class="text-sm text-gray-500 font-medium m-0">{{ label }}</p>
      <p class="text-[32px] font-bold text-gray-900 m-0 leading-tight">{{ value }}</p>
      <p v-if="subtitle" class="text-[13px] text-gray-500 m-0">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'danger', 'warning', 'success'].includes(value)
  }
})

const iconClasses = {
  default: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
  danger: 'bg-gradient-to-br from-primary to-primary-dark text-white',
  warning: 'bg-gradient-to-br from-warning to-orange-500 text-white',
  success: 'bg-gradient-to-br from-success to-green-700 text-white'
}
</script>
