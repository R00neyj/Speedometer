<script setup>
import { computed } from 'vue'
import { useI18nStore } from '@/stores/i18n'

/** 다이얼이 차지하는 각도 범위: -135도(0) ~ +135도(max) */
const SWEEP_DEG = 270
const START_DEG = -135
/** 눈금 간격 (km/h). 10단위는 라벨이 붙는 주 눈금이 된다. */
const TICK_STEP = 5

const i18n = useI18nStore()

const props = defineProps({
  speed: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 40,
  },
  isWarning: {
    type: Boolean,
    default: false,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

/** 값이 아니라 각도를 다이얼 범위로 고정한다. 값만 자르면 바늘이 눈금 밖으로 돌아나간다. */
const angleFor = (value) => {
  if (!props.max) return START_DEG
  const ratio = Math.min(Math.max(value / props.max, 0), 1)
  return ratio * SWEEP_DEG + START_DEG
}

const ticks = computed(() => {
  const result = []
  for (let value = 0; value <= props.max; value += TICK_STEP) {
    result.push({
      value,
      angle: angleFor(value),
      isMajor: value % 10 === 0,
    })
  }
  return result
})

const rotation = computed(() => `rotate(${angleFor(props.speed)}deg)`)
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
        <div :class="[tick.isMajor ? 'h-4 w-1' : 'h-2 w-0.5', 'bg-primary dark:bg-white']"></div>

        <!-- Value Label (Major ticks only) -->
        <div v-if="tick.isMajor" class="mt-2" :style="{ transform: `rotate(${-tick.angle}deg)` }">
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
            isWarning ? 'text-error animate-pulse' : 'text-primary dark:text-white',
          ]"
          class="font-black font-headline leading-none tabular-nums transition-colors"
        >
          {{ speed }}
        </span>
        <span
          class="text-sm font-bold ml-1 transition-colors"
          :class="isWarning ? 'text-error' : 'text-on-surface-variant dark:text-gray-400'"
          >km/h</span
        >
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
          isWarning
            ? 'bg-error shadow-[0_0_15px_rgba(168,56,54,0.5)]'
            : 'bg-primary dark:bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)]',
        ]"
        class="absolute top-0 left-1/2 -translate-x-1/2 rounded-full transition-colors"
      ></div>
    </div>

    <!-- Max Speed Badge -->
    <div
      class="absolute -bottom-2 left-1/2 -translate-x-1/2 badge bg-surface-container-lowest dark:bg-surface-container-highest py-2 px-4 shadow-ambient whitespace-nowrap h-auto transition-colors"
      :class="isWarning ? 'text-error' : 'text-on-surface-variant dark:text-gray-400'"
    >
      <span class="text-sm font-black uppercase tracking-widest">
        {{ i18n.t.max }}: {{ max }} km/h
      </span>
    </div>
  </div>
</template>
