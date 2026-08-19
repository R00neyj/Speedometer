<script setup>
import { computed } from 'vue'
import { useI18nStore } from '@/stores/i18n'

const props = defineProps({
  fontSize: {
    type: Number,
    required: true,
  },
  /** 'auto'가 아니라 실제로 적용된 테마 */
  theme: {
    type: String,
    required: true,
  },
  isTestMode: {
    type: Boolean,
    default: false,
  },
  isSmall: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['title-click', 'toggle-theme', 'update:fontSize'])

const i18n = useI18nStore()

// v-model.number의 숫자 변환을 그대로 살리기 위해 프록시 computed를 쓴다.
const fontSizeModel = computed({
  get: () => props.fontSize,
  set: (value) => emit('update:fontSize', value),
})
</script>

<template>
  <!-- 높이는 App.vue의 상태 배지 top-16/top-20, main의 pt-24/pt-28과 함께 움직여야 한다. -->
  <header
    :class="[isSmall ? 'h-16' : 'h-20']"
    class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-6 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/10"
  >
    <div
      class="flex items-center gap-2 md:gap-3 cursor-pointer select-none"
      @click="emit('title-click')"
    >
      <span
        class="material-symbols-outlined text-primary text-2xl md:text-3xl fill-icon"
        aria-hidden="true"
        >speed</span
      >
      <h1
        :class="[isSmall ? 'text-lg' : 'text-2xl']"
        class="font-black font-headline text-primary truncate tracking-headline"
      >
        {{ i18n.t.title }}
      </h1>
      <div v-if="isTestMode" class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
    </div>

    <div class="flex items-center gap-1.5 md:gap-2">
      <!-- Settings (FontSize Slider Dropdown) -->
      <div class="dropdown group" :title="i18n.t.fontSize">
        <div
          tabindex="0"
          role="button"
          :aria-label="i18n.t.fontSize"
          class="btn btn-ghost btn-circle btn-sm md:btn-md text-on-surface-variant hover:bg-surface-container"
        >
          <span class="material-symbols-outlined text-xl md:text-2xl" aria-hidden="true"
            >text_increase</span
          >
        </div>
        <div
          tabindex="0"
          class="dropdown-content pointer-events-none group-focus-within:pointer-events-auto z-[100] fixed left-1/2 -translate-x-1/2 p-4 pb-5 bg-surface-container-lowest border border-outline-variant/10 dark:border-white/20 shadow-ambient rounded-2xl w-[90vw] max-w-sm flex flex-col gap-4"
        >
          <div class="flex items-center justify-between px-1">
            <span
              class="font-headline font-bold uppercase tracking-headline text-on-surface-variant dark:text-gray-400 text-sm"
            >
              {{ i18n.t.fontSize }}
            </span>
            <span class="font-bold tabular-nums text-primary">{{ fontSize }}px</span>
          </div>
          <input
            v-model.number="fontSizeModel"
            type="range"
            min="80"
            max="260"
            step="10"
            :aria-label="i18n.t.fontSize"
            class="range range-primary range-sm w-full"
          />
        </div>
      </div>

      <button
        :aria-label="i18n.t.language"
        class="btn btn-ghost btn-circle btn-sm md:btn-md font-black text-sm text-primary hover:bg-surface-container"
        @click="i18n.toggleLocale()"
      >
        {{ i18n.locale.toUpperCase() }}
      </button>

      <button
        :aria-label="i18n.t.toggleTheme"
        class="btn btn-ghost btn-circle btn-sm md:btn-md text-on-surface-variant hover:bg-surface-container"
        @click="emit('toggle-theme')"
      >
        <span class="material-symbols-outlined text-xl md:text-2xl" aria-hidden="true">{{
          theme === 'dark' ? 'light_mode' : 'dark_mode'
        }}</span>
      </button>
    </div>
  </header>
</template>
