<script setup>
defineProps({
  label: String,
  value: [String, Number],
  unit: String,
  icon: String,
  isSmall: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="stat transition-all group overflow-visible" :class="[isSmall ? 'p-3 md:p-4' : 'p-6']">
    <div v-if="icon" class="stat-figure text-primary dark:text-white opacity-80">
      <span
        class="material-symbols-outlined fill-icon transition-transform group-hover:scale-110"
        :class="[isSmall ? 'text-2xl' : 'text-3xl']"
        :data-icon="icon"
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
      {{ value }}
      <span
        class="stat-desc text-sm font-bold text-outline-variant dark:text-gray-500 lowercase p-0 m-0"
        >{{ unit }}</span
      >
    </div>
  </div>
</template>
