import { defineStore } from 'pinia'
import { computed } from 'vue'
import { useStorage } from '@vueuse/core'

export const useI18nStore = defineStore('i18n', () => {
  const locale = useStorage('app-locale', 'en')

  // 키를 추가할 때는 en/ko 양쪽에 모두 넣을 것. 한쪽만 넣으면 조용히 undefined가 렌더된다.
  const messages = {
    en: {
      title: 'Speedometer',
      fontSize: 'Font Size',
      language: 'Language',
      toggleTheme: 'Toggle theme',
      tripDistance: 'Session Distance',
      avgSpeed: 'Session Avg Speed',
      totalDistance: 'Total Distance',
      totalAvgSpeed: 'Total Avg Speed',
      start: 'Start',
      stop: 'Stop',
      digital: 'Digital',
      gauge: 'Gauge',
      stats: 'Detailed Stats',
      currentSpeed: 'Current Speed',
      max: 'Max',
      wakeLockActive: 'WakeLock Active 💡',
      offlineReady: 'Ready for offline use ✅',
    },
    ko: {
      title: '속도계',
      fontSize: '글꼴 크기',
      language: '언어',
      toggleTheme: '테마 전환',
      tripDistance: '세션 이동 거리',
      avgSpeed: '세션 평균 속도',
      totalDistance: '누적 이동 거리',
      totalAvgSpeed: '누적 평균 속도',
      start: '시작',
      stop: '정지',
      digital: '디지털 숫자',
      gauge: '게이지',
      stats: '상세 통계',
      currentSpeed: '현재 속도',
      max: '최대',
      wakeLockActive: '화면 꺼짐 방지 💡',
      offlineReady: '오프라인 사용 준비 완료 ✅',
    },
  }

  const t = computed(() => messages[locale.value])

  const toggleLocale = () => {
    locale.value = locale.value === 'en' ? 'ko' : 'en'
  }

  return { locale, t, toggleLocale }
})
