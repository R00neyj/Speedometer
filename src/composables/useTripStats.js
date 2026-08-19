import { onUnmounted, ref, watch } from 'vue'
import { useEventListener, useStorage } from '@vueuse/core'

const MS_PER_HOUR = 1000 * 60 * 60
const STATS_INTERVAL_MS = 5000
const EARTH_RADIUS_KM = 6371

/** GPS 지터로 간주해 버릴 최소 이동 거리 (km). fix의 오차 반경에 따라 더 커진다. */
const MIN_MOVE_KM = 0.005

/** Haversine 공식으로 두 좌표 사이의 거리를 km 단위로 계산한다. */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

const toAnchor = (coords) => ({ latitude: coords.latitude, longitude: coords.longitude })

const averageSpeed = (distanceKm, elapsedMs) =>
  parseFloat((distanceKm / (elapsedMs / MS_PER_HOUR)).toFixed(1))

/**
 * GPS 좌표 스트림에서 이동 거리와 평균 속도를 누적한다.
 *
 * 세션 통계(tripDistance / avgSpeed)는 페이지 수명 동안만 유지되고,
 * 누적 통계(totalDistance / totalAvgSpeed)는 localStorage에 영속된다.
 * 추적 시작/정지는 start()/stop()으로만 하며, 두 함수 모두 멱등이다.
 *
 * @param {import('vue').Ref<GeolocationCoordinates>} coords useGeolocation이 반환한 coords ref
 */
export function useTripStats(coords) {
  const isRunning = ref(false)
  const tripDistance = ref(0)
  const avgSpeed = ref(0)
  const totalActiveTime = ref(0)
  const startTime = ref(null)
  const lastCoords = ref(null)

  const totalDistance = useStorage('total-distance', 0)
  const totalTime = useStorage('total-active-time', 0)
  const totalAvgSpeed = ref(0)

  let statsInterval = null
  // 디버그 세션의 거리/시간이 localStorage 누적값을 오염시키지 않도록 세션 단위로 표시해 둔다.
  let sessionIsTest = false

  const updateStats = () => {
    const elapsed = isRunning.value && startTime.value ? Date.now() - startTime.value : 0

    const sessionMs = totalActiveTime.value + elapsed
    if (sessionMs > 0) avgSpeed.value = averageSpeed(tripDistance.value, sessionMs)

    const cumulativeMs = totalTime.value + elapsed
    if (cumulativeMs > 0) totalAvgSpeed.value = averageSpeed(totalDistance.value, cumulativeMs)
  }

  /** 진행 중인 세션의 경과 시간을 확정하고 앵커를 현재 시각으로 옮긴다 (멱등). */
  const commitSessionTime = () => {
    if (!startTime.value) return
    const elapsed = Date.now() - startTime.value
    totalActiveTime.value += elapsed
    if (!sessionIsTest) totalTime.value += elapsed
    startTime.value = Date.now()
  }

  watch(coords, (newCoords) => {
    if (!isRunning.value || !newCoords) return
    // useGeolocation은 coords를 위도/경도 Infinity로 초기화한다. null 체크로는 걸러지지 않는다.
    if (!Number.isFinite(newCoords.latitude) || !Number.isFinite(newCoords.longitude)) return

    if (!lastCoords.value) {
      lastCoords.value = toAnchor(newCoords)
      return
    }

    const dist = calculateDistance(
      lastCoords.value.latitude,
      lastCoords.value.longitude,
      newCoords.latitude,
      newCoords.longitude,
    )

    // 문턱값을 fix의 오차 반경까지 키운다. 오차가 30m인 fix는 30m를 움직여야 인정되므로
    // 정지 상태에서 GPS 지터가 거리로 쌓이지 않는다. 오차 5m 이하면 기존 동작 그대로다.
    const minMoveKm = Math.max(MIN_MOVE_KM, (newCoords.accuracy || 0) / 1000)
    // 문턱값 미달이면 앵커를 갱신하지 않는다 — 느린 이동도 결국 누적되게 하려는 의도다.
    if (dist <= minMoveKm) return

    tripDistance.value += dist
    if (!sessionIsTest) totalDistance.value += dist
    lastCoords.value = toAnchor(newCoords)
  })

  const start = ({ isTest = false } = {}) => {
    if (isRunning.value) return
    sessionIsTest = isTest
    startTime.value = Date.now()
    // 이전 세션의 마지막 위치를 그대로 두면 그동안 이동한 거리가 통째로 기록된다.
    lastCoords.value = null
    statsInterval = setInterval(updateStats, STATS_INTERVAL_MS)
    isRunning.value = true
  }

  const stop = () => {
    if (!isRunning.value) return
    commitSessionTime()
    startTime.value = null
    lastCoords.value = null
    clearInterval(statsInterval)
    statsInterval = null
    isRunning.value = false
    updateStats()
  }

  // 탭을 닫거나 백그라운드로 보내면 unmount는 일어나지 않는다.
  // 거리는 fix마다 영속되는데 시간만 stop()에서 기록하면 누적 평균 속도가 무너진다.
  const flushIfRunning = () => {
    if (isRunning.value) commitSessionTime()
  }
  useEventListener(window, 'pagehide', flushIfRunning)
  useEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushIfRunning()
  })

  onUnmounted(() => {
    flushIfRunning()
    clearInterval(statsInterval)
  })

  // useStorage는 동기적으로 hydrate되므로, 재방문자는 첫 틱 전에 누적 평균이 채워진다.
  updateStats()

  return { isRunning, tripDistance, avgSpeed, totalDistance, totalAvgSpeed, start, stop }
}
