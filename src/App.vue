<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useGeolocation, useWakeLock, useColorMode, useWindowSize, useStorage } from '@vueuse/core'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18nStore } from './stores/i18n'
import Gauge from './components/Gauge.vue'
import StatsCard from './components/StatsCard.vue'

// i18n 스토어
const i18n = useI18nStore()

// PWA 오프라인 준비 알림
const { offlineReady } = useRegisterSW()
const showOfflineToast = ref(false)

watch(offlineReady, (ready) => {
  if (ready) {
    showOfflineToast.value = true
    setTimeout(() => {
      showOfflineToast.value = false
    }, 5000)
  }
})

// 테마 및 모드 설정
const mode = useColorMode({
  emitAuto: true,
})

// DaisyUI 5와 Tailwind 4의 다크모드 동기화 (class와 data-theme 모두 적용)
watch(
  mode,
  (newMode) => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newMode)
      document.documentElement.classList.toggle('dark', newMode === 'dark')
      
      // 상단 기기 상태바 색상(theme-color) 동기화
      const themeColor = newMode === 'dark' ? '#0e0e0f' : '#f6faff'
      let metaThemeColor = document.querySelector('meta[name="theme-color"]')
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta')
        metaThemeColor.setAttribute('name', 'theme-color')
        document.head.appendChild(metaThemeColor)
      }
      metaThemeColor.setAttribute('content', themeColor)
    }
  },
  { immediate: true },
)

const currentView = useStorage('current-view', 'digital') // 'digital' | 'gauge'

// 창 크기 감지 (반응형 대응)
const { width, height } = useWindowSize()
const isSmallScreen = computed(() => width.value < 380 || height.value < 700)

// 속도계 상태
const isRunning = ref(false)
const fontSize = ref(160) // 기본 폰트 사이즈
const maxSpeed = ref(40)

// 통계 데이터
const tripDistance = ref(0)
const avgSpeed = ref(0)
const totalActiveTime = ref(0) // ms
const startTime = ref(null)
const lastCoords = ref(null)

// 로컬 스토리지 누적 데이터
const totalCumulativeDistance = useStorage('total-distance', 0)
const totalCumulativeTime = useStorage('total-active-time', 0)
const cumulativeAvgSpeed = ref(0)

// Haversine 공식을 이용한 두 좌표 사이의 거리 계산 (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// --- 테스트 모드 관련 로직 ---
const clickCount = ref(0)
const isTestMode = ref(false)
const mockSpeed = ref(0) // km/h 단위

const handleTitleClick = () => {
  clickCount.value++
  if (clickCount.value >= 7) {
    isTestMode.value = !isTestMode.value
    clickCount.value = 0
    if (isTestMode.value) {
      isRunning.value = true // 테스트 모드 진입 시 시각적 효과를 위해 시작 상태로 변경
      if (!startTime.value) startTime.value = Date.now()
    }
  }
}
// -----------------------

// Geolocation
const { coords, resume, pause } = useGeolocation({
  immediate: false,
  enableHighAccuracy: true,
})

// 위치 변경 감지 및 거리 누적
watch(coords, (newCoords) => {
  if (!isRunning.value || !newCoords || newCoords.latitude === null) return

  if (lastCoords.value) {
    const dist = calculateDistance(
      lastCoords.value.latitude,
      lastCoords.value.longitude,
      newCoords.latitude,
      newCoords.longitude,
    )
    // 5m 이상의 이동만 기록 (GPS 오차 보정)
    if (dist > 0.005) {
      tripDistance.value += dist
      totalCumulativeDistance.value += dist
      lastCoords.value = {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
      }
    }
  } else {
    lastCoords.value = {
      latitude: newCoords.latitude,
      longitude: newCoords.longitude,
    }
  }
})

// 주기적인 평균 속도 업데이트 (5초마다)
let statsInterval = null
const updateStats = () => {
  const now = Date.now()
  const currentSessionTime = isRunning.value && startTime.value ? now - startTime.value : 0

  // 세션 통계 계산
  const totalSessionTimeInHours = (totalActiveTime.value + currentSessionTime) / (1000 * 60 * 60)
  if (totalSessionTimeInHours > 0) {
    const calculatedAvg = tripDistance.value / totalSessionTimeInHours
    avgSpeed.value = parseFloat(calculatedAvg.toFixed(1))
  }

  // 누적 통계 계산
  const totalCumulativeTimeInHours = (totalCumulativeTime.value + currentSessionTime) / (1000 * 60 * 60)
  if (totalCumulativeTimeInHours > 0) {
    const calculatedCumulativeAvg = totalCumulativeDistance.value / totalCumulativeTimeInHours
    cumulativeAvgSpeed.value = parseFloat(calculatedCumulativeAvg.toFixed(1))
  }
}

// 초기값 계산
updateStats()

watch(isRunning, (running) => {
  if (running) {
    startTime.value = Date.now()
    statsInterval = setInterval(updateStats, 5000)
  } else {
    if (startTime.value) {
      const sessionDuration = Date.now() - startTime.value
      totalActiveTime.value += sessionDuration
      totalCumulativeTime.value += sessionDuration
    }
    startTime.value = null
    clearInterval(statsInterval)
    updateStats() // 정지 시 최종 업데이트
  }
})

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval)
})

// WakeLock
const {
  isSupported: isWakeLockSupported,
  isActive: isWakeLockActive,
  request,
  release,
} = useWakeLock()

// 현재 속도 계산 (테스트 모드일 때는 슬라이더 값 사용)
const currentSpeed = computed(() => {
  if (isTestMode.value) return mockSpeed.value
  if (!coords.value || coords.value.speed === null || coords.value.speed < 0) return 0
  return Math.round(coords.value.speed * 3.6)
})

// 경고 상태 (40km/h 초과)
const isWarning = computed(() => currentSpeed.value > 40)

// 제어 토글
const toggleTracking = async () => {
  if (isTestMode.value) {
    isRunning.value = !isRunning.value
    return
  }

  if (isRunning.value) {
    pause()
    if (isWakeLockSupported.value && isWakeLockActive.value) await release()
    isRunning.value = false
  } else {
    resume()
    if (isWakeLockSupported.value) {
      try {
        await request('screen')
      } catch (e) {
        console.error(e)
      }
    }
    isRunning.value = true
  }
}
</script>

<template>
  <div
    :class="{ 'lang-ko': i18n.locale === 'ko' }"
    class="bg-gradient-to-br from-background to-surface-container text-on-background h-[100dvh] flex flex-col overflow-hidden transition-colors"
  >
    <!-- TopAppBar -->
    <header
      :class="[isSmallScreen ? 'h-16' : 'h-20']"
      class="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 md:px-6 w-full bg-surface/95 backdrop-blur-xl border-b border-outline-variant/10"
    >
      <div
        class="flex items-center gap-2 md:gap-3 cursor-pointer select-none"
        @click="handleTitleClick"
      >
        <span
          class="material-symbols-outlined text-primary dark:text-dark-primary text-2xl md:text-3xl fill-icon"
          data-icon="speed"
          >speed</span
        >
        <h1
          :class="[isSmallScreen ? 'text-lg' : 'text-2xl']"
          class="font-black font-headline text-primary dark:text-dark-primary truncate tracking-headline"
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
            class="btn btn-ghost btn-circle btn-sm md:btn-md text-on-surface-variant hover:bg-surface-container"
          >
            <span class="material-symbols-outlined text-xl md:text-2xl">text_increase</span>
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
              v-model.number="fontSize"
              type="range"
              min="80"
              max="260"
              step="10"
              class="range range-primary range-sm w-full"
              :style="{ '--value': ((fontSize - 80) / (260 - 80)) * 100 }"
            />
          </div>
        </div>

        <button
          @click="i18n.toggleLocale()"
          class="btn btn-ghost btn-circle btn-sm md:btn-md font-black text-sm text-primary hover:bg-surface-container"
        >
          {{ i18n.locale.toUpperCase() }}
        </button>

        <button
          @click="mode = mode === 'dark' ? 'light' : 'dark'"
          class="btn btn-ghost btn-circle btn-sm md:btn-md text-on-surface-variant hover:bg-surface-container"
        >
          <span class="material-symbols-outlined text-xl md:text-2xl">{{
            mode === 'dark' ? 'light_mode' : 'dark_mode'
          }}</span>
        </button>
      </div>
    </header>

    <!-- Status -->
    <div
      v-if="isWakeLockActive || isTestMode || showOfflineToast"
      :class="[isSmallScreen ? 'top-16' : 'top-20']"
      class="fixed left-1/2 -translate-x-1/2 z-40 pt-2 flex flex-col items-center gap-2 w-full max-w-[90vw]"
    >
      <div v-if="isWakeLockActive" class="badge badge-primary badge-lg animate-slide-down">
        {{ i18n.t.wakeLockActive }}
      </div>

      <div v-if="showOfflineToast" class="badge badge-success badge-lg animate-slide-down">
        {{ i18n.t.offlineReady }}
      </div>

      <div v-if="isTestMode" class="badge badge-error badge-outline gap-2 animate-slide-down">
        <span class="text-xs font-bold">DEBUG</span>
        <input
          v-model.number="mockSpeed"
          type="range"
          min="0"
          max="60"
          step="1"
          class="range range-error range-xs w-24"
        />
        <span class="font-bold tabular-nums text-xs">{{ mockSpeed }}</span>
      </div>
    </div>

    <!-- Main Content Canvas -->
    <main
      :class="[isSmallScreen ? 'pt-24 pb-24' : 'pt-28 pb-32']"
      class="flex-grow overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 md:px-6"
    >
      <div class="my-auto w-full flex flex-col items-center">
        <!-- Digital View -->
        <div
          v-if="currentView === 'digital'"
          class="w-full max-w-md flex flex-col items-center justify-center animate-in"
        >
          <div class="relative flex flex-col items-center">
            <div class="absolute inset-0 flex items-center justify-center -z-10">
              <div
                :class="[isSmallScreen ? 'w-48 h-48' : 'w-64 h-64']"
                class="bg-primary-container/10 dark:bg-dark-primary-container/5 rounded-full blur-[60px] md:blur-[80px]"
              ></div>
            </div>
            <span
              class="font-black font-headline leading-[0.8] tabular-nums text-center transition-colors tracking-headline"
              :class="isWarning ? 'text-error animate-pulse' : 'text-on-background dark:text-white'"
              :style="{ fontSize: fontSize + 'px' }"
            >
              {{ currentSpeed }}
            </span>
            <span
              :class="[isSmallScreen ? 'text-lg mt-4' : 'text-xl md:text-2xl mt-6']"
              class="font-headline font-bold uppercase tracking-headline text-on-surface-variant dark:text-gray-400 opacity-80"
            >
              km/h
            </span>
          </div>
        </div>

        <!-- Gauge View -->
        <div
          v-else
          class="w-full max-w-md flex flex-col items-center justify-center animate-in relative"
        >
          <div class="absolute inset-0 flex items-center justify-center -z-10">
            <div
              :class="[isSmallScreen ? 'w-48 h-48' : 'w-64 h-64']"
              class="bg-primary-container/10 dark:bg-dark-primary-container/5 rounded-full blur-[60px] md:blur-[80px]"
            ></div>
          </div>
          <Gauge :speed="currentSpeed" :max="maxSpeed" :is-small="isSmallScreen" />
        </div>
        <!-- Start/Stop Button (Static position inside scrollable content) -->
        <div class="w-full max-w-md flex flex-col items-center mt-12 px-4">
          <button
            @click="toggleTracking"
            class="btn btn-xl md:btn-xl rounded-full shadow-ambient w-full max-w-xs"
            :class="[isRunning ? 'btn-error text-white' : 'btn-primary text-white']"
          >
            <span
              class="material-symbols-outlined fill-icon"
              :class="[isSmallScreen ? 'text-3xl' : 'text-4xl']"
              >{{ isRunning ? 'stop' : 'play_arrow' }}</span
            >
            <span class="font-headline font-bold uppercase tracking-headline text-xl">
              {{ isRunning ? i18n.t.stop : i18n.t.start }}
            </span>
          </button>
        </div>

        <!-- Stats Grid (Collapsible) -->
        <div
          class="collapse collapse-arrow bg-surface-container-lowest dark:bg-surface-container-highest border border-outline-variant/5 dark:border-white/5 w-full max-w-md mt-8 mb-12"
        >
          <input type="checkbox" />
          <div
            class="collapse-title font-headline font-bold uppercase tracking-headline text-sm text-on-surface-variant dark:text-gray-200 flex items-center gap-2 cursor-pointe"
          >
            <span class="material-symbols-outlined text-lg">analytics</span>
            {{ i18n.t.stats }}
          </div>
          <div class="collapse-content p-0">
            <div class="flex flex-wrap w-full bg-transparent rounded-none border-t border-outline-variant/10">
              <StatsCard
                :label="i18n.t.tripDistance"
                :value="tripDistance.toFixed(2)"
                unit="km"
                icon="route"
                :is-small="isSmallScreen"
                class="w-1/2 border-r border-b border-outline-variant/10"
              />
              <StatsCard
                :label="i18n.t.avgSpeed"
                :value="avgSpeed"
                unit="km/h"
                icon="timer"
                :is-small="isSmallScreen"
                class="w-1/2 border-b border-outline-variant/10"
              />
              <StatsCard
                :label="i18n.t.totalDistance"
                :value="totalCumulativeDistance.toFixed(2)"
                unit="km"
                icon="add_road"
                :is-small="isSmallScreen"
                class="w-1/2 border-r border-outline-variant/10"
              />
              <StatsCard
                :label="i18n.t.totalAvgSpeed"
                :value="cumulativeAvgSpeed"
                unit="km/h"
                icon="speed"
                :is-small="isSmallScreen"
                class="w-1/2"
              />
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Cleaned Bottom Dock (DaisyUI 5) -->
    <nav class="dock dock-lg fixed bottom-0 left-0 right-0 z-50">
      <button
        @click="currentView = 'digital'"
        :class="{ 'dock-active text-primary dark:text-white': currentView === 'digital' }"
        class="text-on-surface-variant hover:text-primary transition-colors pb-2"
      >
        <span
          class="material-symbols-outlined"
          :class="[
            isSmallScreen ? 'text-lg' : 'text-xl',
            { 'fill-icon': currentView === 'digital' },
          ]"
          >numbers</span
        >
        <span class="dock-label text-sm font-headline font-bold uppercase tracking-headline">{{
          i18n.t.digital
        }}</span>
      </button>

      <button
        @click="currentView = 'gauge'"
        :class="{ 'dock-active text-primary dark:text-white': currentView === 'gauge' }"
        class="text-on-surface-variant hover:text-primary transition-colors pb-2"
      >
        <span
          class="material-symbols-outlined"
          :class="[isSmallScreen ? 'text-lg' : 'text-xl', { 'fill-icon': currentView === 'gauge' }]"
          >speed</span
        >
        <span class="dock-label text-sm font-headline font-bold uppercase tracking-headline">{{
          i18n.t.gauge
        }}</span>
      </button>
    </nav>
  </div>
</template>

<style scoped></style>
