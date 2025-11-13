<template>
  <div class="stats-chart-container">
    <!-- Encabezado del gráfico -->
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="period-selector">
        <button
          v-for="period in periods"
          :key="period.value"
          @click="selectedPeriod = period.value"
          class="period-btn"
          :class="{ active: selectedPeriod === period.value }"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- Gráfico de barras -->
    <div class="chart-content">
      <div class="chart-bars">
        <div
          v-for="(item, index) in chartData"
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
              <span class="bar-value">{{ item.value }}{{ unit }}</span>
            </div>
          </div>
          <span class="bar-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- Leyenda -->
    <div class="chart-legend">
      <div class="legend-item" v-for="legend in legends" :key="legend.label">
        <span class="legend-color" :style="{ background: legend.color }"></span>
        <span class="legend-label">{{ legend.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  data: {
    type: Array,
    required: true
  },
  unit: {
    type: String,
    default: ''
  },
  maxValue: {
    type: Number,
    default: 100
  },
  // NUEVO: Permitir especificar qué períodos están disponibles
  availablePeriods: {
    type: Array,
    default: () => ['week', 'month', 'quarter', 'year']
  },
  // NUEVO: Período por defecto
  defaultPeriod: {
    type: String,
    default: 'month'
  }
})

// Estado local
const selectedPeriod = ref(props.defaultPeriod)

// Todos los períodos posibles
const allPeriods = [
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
  { label: 'Trimestre', value: 'quarter' },
  { label: 'Año', value: 'year' }
]

// NUEVO: Filtrar solo los períodos disponibles
const periods = computed(() => {
  return allPeriods.filter(period => props.availablePeriods.includes(period.value))
})

// Leyendas del gráfico
const legends = [
  { label: 'Óptimo (80-100%)', color: '#00CA75' },
  { label: 'Aceptable (50-79%)', color: '#FFCD18' },
  { label: 'Crítico (0-49%)', color: '#C13515' }
]

// Computada: datos filtrados según período
const chartData = computed(() => {
  // Aquí podrías filtrar según el período seleccionado
  // Por ahora retornamos todos los datos
  return props.data
})

// Métodos
const calculateBarHeight = (value) => {
  return (value / props.maxValue) * 100
}

const getBarColor = (value) => {
  const percentage = (value / props.maxValue) * 100

  if (percentage >= 80) return 'linear-gradient(180deg, #00CA75 0%, #00A060 100%)'
  if (percentage >= 50) return 'linear-gradient(180deg, #FFCD18 0%, #FFA500 100%)'
  return 'linear-gradient(180deg, #C13515 0%, #8B2810 100%)'
}
</script>

<style scoped>
.stats-chart-container {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Header */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
}

.chart-title {
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin: 0;
}

.period-selector {
  display: flex;
  gap: 8px;
  background: #F5F7FA;
  padding: 4px;
  border-radius: 8px;
}

.period-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #74788D;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-btn:hover {
  background: rgba(193, 53, 21, 0.1);
  color: #C13515;
}

.period-btn.active {
  background: #C13515;
  color: white;
}

/* Chart Content */
.chart-content {
  min-height: 300px;
  padding: 20px 0;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 280px;
  gap: 12px;
  padding: 0 8px;
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
  min-height: 20px;
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
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.bar-label {
  font-size: 12px;
  color: #74788D;
  font-weight: 500;
  text-align: center;
}

/* Legend */
.chart-legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #E9ECEF;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-size: 13px;
  color: #74788D;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .period-selector {
    width: 100%;
    justify-content: space-between;
  }

  .period-btn {
    flex: 1;
  }

  .chart-bars {
    gap: 8px;
  }

  .bar-value {
    font-size: 10px;
  }

  .bar-label {
    font-size: 10px;
  }
}
</style>
