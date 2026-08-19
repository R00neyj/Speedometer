<script setup>
import { computed } from 'vue'

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  /** 고정 소수점 자릿수. null이면 값을 그대로 출력한다. */
  precision: {
    type: Number,
    default: null,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

const display = computed(() =>
  props.precision === null ? String(props.value) : props.value.toFixed(props.precision),
)
</script>

<template>
  <div class="stat transition-all group overflow-visible" :class="[isSmall ? 'p-3 md:p-4' : 'p-6']">
    <div class="stat-figure text-primary dark:text-white opacity-80">
      <span
        class="material-symbols-outlined fill-icon transition-transform group-hover:scale-110"
        :class="[isSmall ? 'text-2xl' : 'text-3xl']"
        aria-hidden="true"
        >{{ icon }}</span
      >
    </div>
    <div
      class="stat-title font-headline font-bold uppercase tracking-headline text-sm text-on-surface-variant dark:text-gray-300 mb-1"
    >
      {{ label }}
    </div>
    <div
      class="stat-value font-headline font-black tabular-nums tracking-headline flex items-baseline gap-1 text-primary dark:text-white"
      :class="[isSmall ? 'text-2xl' : 'text-4xl']"
    >
      {{ display }}
      <span
        class="stat-desc text-sm font-bold text-outline-variant dark:text-gray-500 lowercase p-0 m-0"
        >{{ unit }}</span
      >
    </div>
  </div>
</template>
