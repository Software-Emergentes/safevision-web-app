<template>
  <div class="alerts-weekly-chart">
    <div class="chart-header">
      <h3 class="chart-title">Alertas por Semana</h3>
    </div>

    <div class="chart-content">
      <div class="chart-bars">
        <div
          v-for="(item, index) in data"
          :key="index"
          class="bar-group"
        >
          <div class="bar-container">
            <div
              class="bar"
              :style="{
                height: `${calculateBarHeight(item.value)}%`,
                background: getBarColor(item.value)
              }"
            >
              <span class="bar-value">{{ item.value }}</span>
            </div>
          </div>
          <span class="bar-label">{{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  }
})

const maxValue = computed(() => {
  if (props.data.length === 0) return 100
  return Math.max(...props.data.map(item => item.value))
})

const calculateBarHeight = (value) => {
  return (value / maxValue.value) * 100
}

const getBarColor = (value) => {
  const max = maxValue.value || 1
  const percentage = (value / max) * 100

  if (percentage >= 80) return 'linear-gradient(180deg, #8B5CF6 0%, #6D28D9 100%)'
  if (percentage >= 50) return 'linear-gradient(180deg, #A78BFA 0%, #8B5CF6 100%)'

  return 'linear-gradient(180deg, #E9D5FF 0%, #D8B4FE 100%)'
}

</script>

<style scoped>
.alerts-weekly-chart {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-header {
  margin-bottom: 24px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.chart-content {
  flex: 1;
  display: flex;
  align-items: flex-end;
  min-height: 300px;
}

.chart-bars {
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 280px;
  gap: 20px;
  padding: 0 16px;
}

.bar-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.bar-container {
  width: 100%;
  max-width: 80px;
  height: 240px;
  display: flex;
  align-items: flex-end;
  position: relative;
}

.bar {
  width: 100%;
  border-radius: 8px 8px 0 0;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 30px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8px;
}

.bar:hover {
  opacity: 0.8;
  transform: translateY(-4px);
}

.bar-value {
  font-size: 14px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-label {
  font-size: 13px;
  color: #74788D;
  font-weight: 500;
  text-align: center;
}

@media (max-width: 768px) {
  .chart-bars {
    gap: 12px;
    padding: 0 8px;
  }

  .bar-container {
    max-width: 60px;
  }

  .bar-value {
    font-size: 12px;
  }

  .bar-label {
    font-size: 11px;
  }
}
</style>
