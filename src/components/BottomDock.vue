<script setup>
import { useI18nStore } from '@/stores/i18n'

defineProps({
  currentView: {
    type: String,
    required: true,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:currentView'])

const i18n = useI18nStore()

// id는 i18n 메시지 키이기도 하다 (stores/i18n.js의 digital / gauge).
const items = [
  { id: 'digital', icon: 'numbers' },
  { id: 'gauge', icon: 'speed' },
]
</script>

<template>
  <!-- DaisyUI의 .dock은 직계 자식을 배치한다. v-for를 다른 요소로 감싸면 안 된다. -->
  <nav class="dock dock-lg fixed bottom-0 left-0 right-0 z-50">
    <button
      v-for="item in items"
      :key="item.id"
      :class="{ 'dock-active text-primary dark:text-white': currentView === item.id }"
      class="text-on-surface-variant hover:text-primary transition-colors pb-2"
      @click="emit('update:currentView', item.id)"
    >
      <span
        class="material-symbols-outlined"
        :class="[isSmall ? 'text-lg' : 'text-xl', { 'fill-icon': currentView === item.id }]"
        aria-hidden="true"
        >{{ item.icon }}</span
      >
      <span class="dock-label text-sm font-headline font-bold uppercase tracking-headline">
        {{ i18n.t[item.id] }}
      </span>
    </button>
  </nav>
</template>
