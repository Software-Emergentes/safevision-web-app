<template>
  <div class="stat-summary-card" :class="variant">
    <div class="stat-icon">
      <slot name="icon"></slot>
    </div>
    <div class="stat-content">
      <p class="stat-label">{{ label }}</p>
      <p class="stat-value">
        {{ value }}
        <span v-if="unit" class="stat-unit">{{ unit }}</span>
      </p>
      <p v-if="trend" class="stat-trend" :class="trendDirection">
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
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  trend: {
    type: String,
    default: ''
  },
  trendDirection: {
    type: String,
    default: 'up',
    validator: (value) => ['up', 'down'].includes(value)
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'success', 'warning', 'danger'].includes(value)
  }
})
</script>

<style scoped>
.stat-summary-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  border: 1px solid #E9ECEF;
  transition: all 0.3s ease;
}

.stat-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}

.stat-summary-card.default .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-summary-card.success .stat-icon {
  background: linear-gradient(135deg, #00CA75 0%, #00A060 100%);
  color: white;
}

.stat-summary-card.warning .stat-icon {
  background: linear-gradient(135deg, #FFCD18 0%, #FFA500 100%);
  color: white;
}

.stat-summary-card.danger .stat-icon {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 13px;
  color: #74788D;
  font-weight: 500;
  margin: 0;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #222222;
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-unit {
  font-size: 14px;
  font-weight: 500;
  color: #74788D;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend.up {
  color: #00CA75;
}

.stat-trend.down {
  color: #C13515;
}

.stat-trend svg {
  stroke-width: 2.5;
}
</style>
