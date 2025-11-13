<template>
  <div class="stat-card" :class="variant">
    <div class="stat-icon">
      <slot name="icon"></slot>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">{{ value }}</p>
      <p v-if="subtitle" class="stat-subtitle">{{ subtitle }}</p>
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
    default: 'default', // 'default', 'danger', 'warning', 'success'
    validator: (value) => ['default', 'danger', 'warning', 'success'].includes(value)
  }
})
</script>

<style scoped>
.stat-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #E9ECEF;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 24px;
}

.stat-card.default .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card.danger .stat-icon {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #FFCD18 0%, #FFA500 100%);
  color: white;
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, #00CA75 0%, #00A060 100%);
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 14px;
  color: #74788D;
  font-weight: 500;
  margin: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
  margin: 0;
  line-height: 1.2;
}

.stat-subtitle {
  font-size: 13px;
  color: #74788D;
  margin: 0;
}
</style>
