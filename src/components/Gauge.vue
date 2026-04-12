<script setup>
import { computed } from 'vue'
import { useI18nStore } from '../stores/i18n'

const i18n = useI18nStore()

const props = defineProps({
  speed: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 40
  },
  isSmall: {
    type: Boolean,
    default: false
  }
})

const isWarning = computed(() => props.speed > 40)

// 눈금 데이터 생성 (5단위)
const ticks = computed(() => {
  const result = []
  const step = 5
  // max가 40이면 0, 5, 10, ..., 40까지 생성
  for (let i = 0; i <= props.max; i += step) {
    const angle = (i / props.max) * 270 - 135
    result.push({
      value: i,
      angle,
      isMajor: i % 10 === 0 // 10단위는 주요 눈금
    })
  }
  return result
})

// 바늘 회전 각도 (-135도 ~ 135도 범위)
const rotation = computed(() => {
  const cappedSpeed = Math.min(props.speed, props.max + 10)
  const angle = (cappedSpeed / props.max) * 270 - 135
  return `rotate(${angle}deg)`
})
</script>

<template>
  <div 
    :class="[isSmall ? 'w-56 h-56' : 'w-64 h-64 md:w-80 md:h-80']" 
    class="relative flex items-center justify-center rounded-full transition-all"
  >
    <!-- Gauge Ticks & Labels -->
    <div class="absolute inset-0 pointer-events-none">
      <div 
        v-for="tick in ticks" 
        :key="tick.value"
        class="absolute inset-0 flex flex-col items-center"
        :style="{ transform: `rotate(${tick.angle}deg)` }"
      >
        <!-- Tick Line -->
        <div 
          :class="[
            tick.isMajor ? 'h-4 w-1' : 'h-2 w-0.5',
            'bg-primary dark:bg-white'
          ]"
        ></div>
        
        <!-- Value Label (Major ticks only) -->
        <div 
          v-if="tick.isMajor"
          class="mt-2"
          :style="{ transform: `rotate(${-tick.angle}deg)` }"
        >
          <span class="text-sm font-black text-primary dark:text-white">
            {{ tick.value }}
          </span>
        </div>
      </div>
    </div>

    <!-- Speed Display -->
    <div class="z-10 flex flex-col items-center text-center">
      <span 
        class="text-sm font-headline font-bold uppercase tracking-widest mb-1 transition-colors"
        :class="isWarning ? 'text-error' : 'text-on-surface-variant dark:text-gray-400'"
      >
        {{ i18n.t.currentSpeed }}
      </span>
      <div class="flex items-baseline">
        <span 
          :class="[
            isSmall ? 'text-5xl' : 'text-7xl md:text-8xl',
            isWarning ? 'text-error animate-pulse' : 'text-primary dark:text-white'
          ]" 
          class="font-black font-headline leading-none tabular-nums transition-colors"
        >
          {{ speed }}
        </span>
        <span 
          class="text-sm font-bold ml-1 transition-colors"
          :class="isWarning ? 'text-error' : 'text-on-surface-variant dark:text-gray-400'"
        >km/h</span>
      </div>
    </div>
    
    <!-- Needle: Clean rotation without outer ring -->
    <div 
      class="absolute inset-0 rounded-full transition-all ease-out pointer-events-none p-6"
      :style="{ transform: rotation }"
    >
      <div 
        :class="[
          isSmall ? 'h-10 w-2' : 'h-14 w-2.5',
          isWarning ? 'bg-error shadow-[0_0_15px_rgba(168,56,54,0.5)]' : 'bg-primary dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
        ]" 
        class="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-colors"
      ></div>
    </div>

    <!-- Max Speed Badge -->
    <div 
      class="absolute -bottom-2 left-1/2 -translate-x-1/2 badge bg-white dark:bg-surface-container-highest py-2 px-4 shadow-ambient whitespace-nowrap h-auto transition-colors"
      :class="isWarning ? 'text-error' : 'text-on-surface-variant dark:text-gray-400'"
    >
      <span class="text-sm font-black uppercase tracking-widest">
        {{ i18n.t.max }}: {{ max }} km/h
      </span>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
