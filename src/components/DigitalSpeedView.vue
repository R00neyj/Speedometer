<script setup>
import GlowBackdrop from '@/components/GlowBackdrop.vue'

defineProps({
  speed: {
    type: Number,
    required: true,
  },
  fontSize: {
    type: Number,
    required: true,
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
</script>

<template>
  <div class="w-full max-w-md flex flex-col items-center justify-center animate-in">
    <div class="relative flex flex-col items-center">
      <GlowBackdrop :is-small="isSmall" />
      <span
        class="font-black font-headline leading-[0.8] tabular-nums text-center transition-colors tracking-headline"
        :class="isWarning ? 'text-error animate-pulse' : 'text-on-background dark:text-white'"
        :style="{ fontSize: fontSize + 'px' }"
      >
        {{ speed }}
      </span>
      <span
        :class="[isSmall ? 'text-lg mt-4' : 'text-xl md:text-2xl mt-6']"
        class="font-headline font-bold uppercase tracking-headline text-on-surface-variant dark:text-gray-400 opacity-80"
      >
        km/h
      </span>
    </div>
  </div>
</template>
