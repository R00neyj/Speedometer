<script setup>
import { computed } from 'vue'
import StatsCard from '@/components/StatsCard.vue'
import { useI18nStore } from '@/stores/i18n'

const props = defineProps({
  tripDistance: {
    type: Number,
    required: true,
  },
  avgSpeed: {
    type: Number,
    required: true,
  },
  totalDistance: {
    type: Number,
    required: true,
  },
  totalAvgSpeed: {
    type: Number,
    required: true,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

const i18n = useI18nStore()

// i18n.t가 반응형이므로 computed여야 한다. cls의 테두리는 2×2 그리드를 만든다.
const cards = computed(() => [
  {
    icon: 'route',
    label: i18n.t.tripDistance,
    value: props.tripDistance,
    unit: 'km',
    precision: 2,
    cls: 'w-1/2 border-r border-b border-outline-variant/10',
  },
  {
    icon: 'timer',
    label: i18n.t.avgSpeed,
    value: props.avgSpeed,
    unit: 'km/h',
    precision: null,
    cls: 'w-1/2 border-b border-outline-variant/10',
  },
  {
    icon: 'add_road',
    label: i18n.t.totalDistance,
    value: props.totalDistance,
    unit: 'km',
    precision: 2,
    cls: 'w-1/2 border-r border-outline-variant/10',
  },
  {
    icon: 'speed',
    label: i18n.t.totalAvgSpeed,
    value: props.totalAvgSpeed,
    unit: 'km/h',
    precision: null,
    cls: 'w-1/2',
  },
])
</script>

<template>
  <div
    class="collapse collapse-arrow bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/5 dark:border-white/5 w-full max-w-md mt-8 mb-12"
  >
    <input type="checkbox" :aria-label="i18n.t.stats" />
    <div
      class="collapse-title font-headline font-bold uppercase tracking-headline text-sm text-on-surface-variant dark:text-gray-200 flex items-center gap-2"
    >
      <span class="material-symbols-outlined text-lg" aria-hidden="true">analytics</span>
      {{ i18n.t.stats }}
    </div>
    <div class="collapse-content p-0">
      <div
        class="flex flex-wrap w-full bg-transparent rounded-none border-t border-outline-variant/10"
      >
        <StatsCard
          v-for="card in cards"
          :key="card.icon"
          :label="card.label"
          :value="card.value"
          :unit="card.unit"
          :icon="card.icon"
          :precision="card.precision"
          :is-small="isSmall"
          :class="card.cls"
        />
      </div>
    </div>
  </div>
</template>
