<template>
  <div class="alerts-distribution-card">
    <div class="card-header">
      <h3 class="card-title">Distribución de Alertas</h3>
    </div>

    <div class="distribution-list">
      <div
        v-for="(item, index) in data"
        :key="index"
        class="distribution-item"
      >
        <div class="item-info">
          <div class="item-indicator" :style="{ background: item.color }"></div>
          <span class="item-label">{{ item.label }}</span>
        </div>
        <div class="item-stats">
          <span class="item-value">{{ item.value }} ({{ item.percentage }}%)</span>
        </div>
        <div class="item-bar-container">
          <div
            class="item-bar"
            :style="{
              width: `${item.percentage}%`,
              background: item.color
            }"
          ></div>
        </div>
      </div>
    </div>

    <div class="total-section">
      <span class="total-label">Total de alertas este mes</span>
      <span class="total-value">{{ totalAlerts }}</span>
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

const totalAlerts = computed(() => {
  return props.data.reduce((sum, item) => sum + item.value, 0)
})
</script>

<style scoped>
.alerts-distribution-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-header {
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.distribution-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-label {
  font-size: 14px;
  font-weight: 500;
  color: #222222;
  flex: 1;
}

.item-stats {
  display: flex;
  justify-content: flex-end;
}

.item-value {
  font-size: 14px;
  font-weight: 600;
  color: #74788D;
}

.item-bar-container {
  width: 100%;
  height: 8px;
  background: #F5F7FA;
  border-radius: 4px;
  overflow: hidden;
}

.item-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.total-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E9ECEF;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-label {
  font-size: 14px;
  color: #74788D;
  font-weight: 500;
}

.total-value {
  font-size: 32px;
  font-weight: 700;
  color: #222222;
}
</style>
