<template>
  <div class="report-stat-card" :class="variant">
    <div class="stat-icon" v-html="icon"></div>
    <div class="stat-content">
      <p class="stat-value">{{ value }}</p>
      <p class="stat-label">{{ label }}</p>
      <p v-if="trend" class="stat-trend" :class="trendDirection">
        <svg
          v-if="trendDirection === 'up'"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
        </svg>
        {{ trend }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  label: {
    type: String,
    required: true
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
.report-stat-card {
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

.report-stat-card:hover {
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
}

.report-stat-card.default .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.report-stat-card.success .stat-icon {
  background: linear-gradient(135deg, #00CA75 0%, #00A060 100%);
  color: white;
}

.report-stat-card.warning .stat-icon {
  background: linear-gradient(135deg, #FFCD18 0%, #FFA500 100%);
  color: white;
}

.report-stat-card.danger .stat-icon {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
  color: white;
}

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #222222;
  margin: 0;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #74788D;
  font-weight: 500;
  margin: 0;
}

.stat-trend {
  font-size: 12px;
  font-weight: 600;
  margin: 4px 0 0 0;
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
</style>
