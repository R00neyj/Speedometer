<script setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import { useColorMode, useGeolocation, useWakeLock, useWindowSize } from '@vueuse/core'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useI18nStore } from '@/stores/i18n'
import { useTripStats } from '@/composables/useTripStats'
import BottomDock from '@/components/BottomDock.vue'
import DigitalSpeedView from '@/components/DigitalSpeedView.vue'
import Gauge from '@/components/Gauge.vue'
import GlowBackdrop from '@/components/GlowBackdrop.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import TopAppBar from '@/components/TopAppBar.vue'

/** 게이지 눈금의 상한이자 과속 경고 임계값 (km/h) */
const MAX_SPEED = 40
/** 숨겨진 디버그 모드: 이 간격 안에 타이틀을 이만큼 연타하면 토글된다. */
const TEST_MODE_CLICKS = 7
const TEST_MODE_CLICK_GAP_MS = 1500
const OFFLINE_TOAST_MS = 5000

const i18n = useI18nStore()

// 반응형 대응
const { width, height } = useWindowSize()
const isSmallScreen = computed(() => width.value < 380 || height.value < 700)

// 테마. useColorMode가 <html>의 light/dark 클래스를 직접 관리하므로 여기서는
// DaisyUI가 읽는 data-theme만 맞춰준다. mode.value는 'auto'일 수 있어 실제 적용된
// 값(mode.state)을 써야 한다. 첫 페인트용 인라인 스크립트가 index.html에 있고
// 저장소 키('vueuse-color-scheme')를 공유하므로 둘을 함께 유지할 것.
const mode = useColorMode({ emitAuto: true })
const theme = mode.state

watch(
  theme,
  (resolved) => {
    document.documentElement.setAttribute('data-theme', resolved)
  },
  { immediate: true },
)

// 스크린리더 음성과 폰트 폴백이 로케일을 따라가도록 <html lang>도 동기화한다.
watch(
  () => i18n.locale,
  (locale) => {
    document.documentElement.setAttribute('lang', locale)
  },
  { immediate: true },
)

const toggleTheme = () => {
  mode.value = theme.value === 'dark' ? 'light' : 'dark'
}

// PWA 오프라인 준비 알림
const { offlineReady } = useRegisterSW()
const showOfflineToast = ref(false)
let toastTimer = null

watch(offlineReady, (ready) => {
  if (!ready) return
  showOfflineToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    showOfflineToast.value = false
  }, OFFLINE_TOAST_MS)
})

onUnmounted(() => clearTimeout(toastTimer))

// 표시 설정
const currentView = ref('digital')
const fontSize = ref(160)

// 위치 추적 및 통계
const { coords, resume, pause } = useGeolocation({
  immediate: false,
  enableHighAccuracy: true,
})
const { isRunning, tripDistance, avgSpeed, totalDistance, totalAvgSpeed, start, stop } =
  useTripStats(coords)

const {
  isSupported: isWakeLockSupported,
  isActive: isWakeLockActive,
  request,
  release,
} = useWakeLock()

// 숨겨진 디버그 모드: GPS 없이 UI를 검증하기 위해 mockSpeed가 속도원이 된다.
const isTestMode = ref(false)
const mockSpeed = ref(0)

const currentSpeed = computed(() => {
  if (isTestMode.value) return mockSpeed.value
  const speed = coords.value?.speed
  if (speed == null || speed < 0) return 0
  return Math.round(speed * 3.6) // m/s -> km/h
})

const isWarning = computed(() => currentSpeed.value > MAX_SPEED)

// 시작 중 두 번 탭하면 watchPosition이 중복 등록되고 pause()는 하나만 해제한다.
let isToggling = false

const stopTracking = async () => {
  pause()
  if (isWakeLockSupported.value && isWakeLockActive.value) await release()
  stop()
}

const toggleTracking = async () => {
  if (isToggling) return
  isToggling = true
  try {
    if (isRunning.value) {
      if (isTestMode.value) stop()
      else await stopTracking()
      return
    }
    if (isTestMode.value) {
      start({ isTest: true })
      return
    }

    resume()
    if (isWakeLockSupported.value) {
      try {
        await request('screen')
      } catch (e) {
        console.error(e)
      }
    }
    start()
  } finally {
    isToggling = false
  }
}

// 타이틀 7연타 제스처로 디버그 모드를 토글한다.
const clickCount = ref(0)
let lastClickAt = 0

const handleTitleClick = async () => {
  const now = Date.now()
  // 간격이 벌어지면 카운트를 리셋한다. 그러지 않으면 세션 내내 흩어진 탭만으로도 진입한다.
  clickCount.value = now - lastClickAt > TEST_MODE_CLICK_GAP_MS ? 1 : clickCount.value + 1
  lastClickAt = now
  if (clickCount.value < TEST_MODE_CLICKS) return

  clickCount.value = 0
  isTestMode.value = !isTestMode.value
  // 진입/이탈 모두 실제 추적 자원을 먼저 정리한다. 그러지 않으면 GPS watch나 WakeLock을
  // 쥔 채 '추적 중'으로 보이는 유령 상태가 남는다.
  await stopTracking()
  if (isTestMode.value) start({ isTest: true })
}
</script>

<template>
  <div
    :class="{ 'lang-ko': i18n.locale === 'ko' }"
    class="bg-gradient-to-br from-background to-surface-container text-on-background h-[100dvh] flex flex-col overflow-hidden transition-colors"
  >
    <TopAppBar
      v-model:font-size="fontSize"
      :theme="theme"
      :is-test-mode="isTestMode"
      :is-small="isSmallScreen"
      @title-click="handleTitleClick"
      @toggle-theme="toggleTheme"
    />

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
        <span class="text-sm font-bold">DEBUG</span>
        <input
          v-model.number="mockSpeed"
          type="range"
          min="0"
          max="60"
          step="1"
          aria-label="Mock speed"
          class="range range-error range-xs w-24"
        />
        <span class="font-bold tabular-nums text-sm">{{ mockSpeed }}</span>
      </div>
    </div>

    <!-- Main Content Canvas -->
    <main
      :class="[isSmallScreen ? 'pt-24 pb-24' : 'pt-28 pb-32']"
      class="flex-grow overflow-y-auto overflow-x-hidden flex flex-col items-center px-4 md:px-6"
    >
      <div class="my-auto w-full flex flex-col items-center">
        <!-- 두 뷰는 형제 v-if/v-else로 남겨야 한다. 전환할 때마다 unmount/mount 되면서
             animate-in이 다시 재생되는 것이 현재 동작이다. -->
        <DigitalSpeedView
          v-if="currentView === 'digital'"
          :speed="currentSpeed"
          :font-size="fontSize"
          :is-warning="isWarning"
          :is-small="isSmallScreen"
        />

        <div
          v-else
          class="w-full max-w-md flex flex-col items-center justify-center animate-in relative"
        >
          <GlowBackdrop :is-small="isSmallScreen" />
          <Gauge
            :speed="currentSpeed"
            :max="MAX_SPEED"
            :is-warning="isWarning"
            :is-small="isSmallScreen"
          />
        </div>

        <!-- Start/Stop Button (Static position inside scrollable content) -->
        <div class="w-full max-w-md flex flex-col items-center mt-12 px-4">
          <button
            class="btn btn-xl rounded-full shadow-ambient w-full max-w-xs"
            :class="[isRunning ? 'btn-error text-white' : 'btn-primary text-white']"
            @click="toggleTracking"
          >
            <span
              class="material-symbols-outlined fill-icon"
              :class="[isSmallScreen ? 'text-3xl' : 'text-4xl']"
              aria-hidden="true"
              >{{ isRunning ? 'stop' : 'play_arrow' }}</span
            >
            <span class="font-headline font-bold uppercase tracking-headline text-xl">
              {{ isRunning ? i18n.t.stop : i18n.t.start }}
            </span>
          </button>
        </div>

        <StatsPanel
          :trip-distance="tripDistance"
          :avg-speed="avgSpeed"
          :total-distance="totalDistance"
          :total-avg-speed="totalAvgSpeed"
          :is-small="isSmallScreen"
        />
      </div>
    </main>

    <BottomDock v-model:current-view="currentView" :is-small="isSmallScreen" />
  </div>
</template>
