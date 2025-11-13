<template>
  <div class="schedule-heatmap">
    <div class="heatmap-header">
      <h3 class="heatmap-title">Alertas por Horario</h3>
      <p class="heatmap-subtitle">Distribución de alertas por día y hora</p>
    </div>

    <div class="heatmap-content">
      <div class="heatmap-grid">
        <div class="time-labels">
          <span v-for="hour in hours" :key="hour" class="time-label">
            {{ hour }}
          </span>
        </div>

        <div class="days-grid">
          <div
            v-for="day in days"
            :key="day.name"
            class="day-row"
          >
            <span class="day-label">{{ day.name }}</span>
            <div class="hour-cells">
              <div
                v-for="(value, hourIndex) in day.hours"
                :key="hourIndex"
                class="hour-cell"
                :class="getIntensityClass(value)"
                :title="`${day.name} ${hours[hourIndex]}: ${value} alertas`"
              >
                <span class="cell-value">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="legend">
        <span class="legend-label">Menos alertas</span>
        <div class="legend-scale">
          <div class="legend-item intensity-0"></div>
          <div class="legend-item intensity-1"></div>
          <div class="legend-item intensity-2"></div>
          <div class="legend-item intensity-3"></div>
          <div class="legend-item intensity-4"></div>
        </div>
        <span class="legend-label">Más alertas</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const hours = ref([
  '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
  '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
])

// Mock data - en producción vendría de props.data
const days = ref([
  {
    name: 'Lunes',
    hours: [2, 5, 8, 3, 4, 6, 10, 12, 8, 15, 18, 20]
  },
  {
    name: 'Martes',
    hours: [3, 4, 6, 5, 7, 8, 12, 14, 10, 16, 19, 22]
  },
  {
    name: 'Miércoles',
    hours: [1, 3, 5, 4, 5, 7, 11, 13, 9, 14, 17, 19]
  },
  {
    name: 'Jueves',
    hours: [4, 6, 9, 6, 8, 9, 13, 15, 11, 17, 20, 23]
  },
  {
    name: 'Viernes',
    hours: [5, 7, 10, 8, 9, 10, 14, 16, 12, 18, 21, 25]
  },
  {
    name: 'Sábado',
    hours: [3, 5, 7, 5, 6, 8, 10, 11, 9, 13, 15, 18]
  },
  {
    name: 'Domingo',
    hours: [2, 4, 6, 4, 5, 6, 8, 9, 7, 11, 13, 16]
  }
])

const getIntensityClass = (value) => {
  if (value === 0) return 'intensity-0'
  if (value <= 5) return 'intensity-1'
  if (value <= 10) return 'intensity-2'
  if (value <= 15) return 'intensity-3'
  return 'intensity-4'
}
</script>

<style scoped>
.schedule-heatmap {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.heatmap-header {
  margin-bottom: 24px;
}

.heatmap-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 4px 0;
}

.heatmap-subtitle {
  font-size: 14px;
  color: #74788D;
  margin: 0;
}

.heatmap-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.heatmap-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-x: auto;
}

.time-labels {
  display: flex;
  padding-left: 100px;
  gap: 4px;
}

.time-label {
  flex: 1;
  min-width: 50px;
  font-size: 11px;
  color: #74788D;
  text-align: center;
}

.days-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.day-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-label {
  width: 92px;
  font-size: 13px;
  font-weight: 500;
  color: #222222;
}

.hour-cells {
  display: flex;
  gap: 4px;
  flex: 1;
}

.hour-cell {
  flex: 1;
  min-width: 50px;
  height: 40px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.hour-cell:hover {
  transform: scale(1.1);
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.cell-value {
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.intensity-0 {
  background: #F5F7FA;
}

.intensity-0 .cell-value {
  color: #74788D;
  text-shadow: none;
}

.intensity-1 {
  background: #B8E6D5;
}

.intensity-2 {
  background: #FFE8B3;
}

.intensity-3 {
  background: #FFB899;
}

.intensity-4 {
  background: linear-gradient(135deg, #C13515 0%, #8B2810 100%);
}

.legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #E9ECEF;
}

.legend-label {
  font-size: 12px;
  color: #74788D;
}

.legend-scale {
  display: flex;
  gap: 4px;
}
.legend-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #E9ECEF;
}

@media (max-width: 768px) {
  .time-labels {
    padding-left: 80px;
  }

  .day-label {
    width: 72px;
    font-size: 12px;
  }

  .time-label {
    min-width: 40px;
    font-size: 10px;
  }

  .hour-cell {
    min-width: 40px;
    height: 32px;
  }

  .cell-value {
    font-size: 10px;
  }
}
</style>
