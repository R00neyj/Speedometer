# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

GPS 기반 실시간 속도계 PWA. Vue 3 (`<script setup>`) + Vite + Tailwind CSS 4 + DaisyUI 5 + Pinia.

## 명령어

```bash
npm run dev       # 개발 서버 (PWA devOptions 활성화 → dev-dist/ 에 SW 생성됨, git 미추적)
npm run build     # 프로덕션 빌드 → dist/
npm run preview   # 빌드 결과 미리보기 (PWA/오프라인 동작 검증용)
npm run lint      # oxlint --fix → eslint --fix --cache 순차 실행
npm run format    # prettier --write src/
```

테스트 프레임워크는 설정되어 있지 않다. 검증은 `npm run build` + `npm run preview` 로 수동 확인한다.

**주의 1:** `npm run lint` 는 두 린터 모두 `--fix` 로 실행되므로 파일을 직접 수정한다. 검사만 하려면 `npx eslint .` 를 쓴다.

**주의 2:** `npm run format` 은 `src/` 만 훑는다. `index.html`, `vite.config.js`, `eslint.config.js` 는 포맷 대상이 아니다.

**주의 3:** 다른 프로젝트가 같은 localhost 포트에 서비스워커를 남겨두면 그쪽 앱이 대신 뜬다. 이상하면 DevTools 에서 SW unregister + 캐시 삭제 후 재로드한다.

## 아키텍처

### 라우터가 없다

`src/main.js` 는 Pinia만 등록하고 `App.vue` 를 바로 마운트하는 단일 화면 앱이다. 화면 전환은 `App.vue` 의 `currentView` ref (`'digital' | 'gauge'`) 와 `BottomDock` 이 처리한다. 라우팅을 도입하려면 `vue-router` 재설치 + `main.js` 에 `app.use(router)` 가 먼저 필요하다.

### 계층

```
App.vue                    조립 + 추적 제어(GPS/WakeLock 수명주기) + 테마·로케일 동기화 + 테스트 모드
├─ composables/useTripStats.js   거리·시간·평균속도 누적 엔진 (localStorage 영속 포함)
├─ TopAppBar.vue           타이틀(제스처 트리거), 폰트 크기, 로케일, 테마 버튼
├─ DigitalSpeedView.vue    숫자 뷰  ─┐
├─ Gauge.vue               게이지 뷰 ─┴─ 둘 다 GlowBackdrop.vue 를 자기 컨테이너 안에 둔다
├─ StatsPanel.vue          접이식 2×2 그리드 → StatsCard.vue
└─ BottomDock.vue          하단 뷰 전환
```

`stores/i18n.js` 는 `vue-i18n` 이 아니라 손으로 만든 Pinia 스토어다. 컴포넌트가 직접 import 해서 쓰며 라벨을 props 로 내려보내지 않는다. **문구를 추가할 때 en/ko 양쪽에 모두 키를 넣어야 한다** — 누락 시 해당 로케일에서 조용히 `undefined` 가 렌더된다.

### useTripStats — 추적 상태의 단일 소유자

`isRunning` 은 이 컴포저블 밖에서 쓰기 금지다. 반드시 `start({ isTest })` / `stop()` 을 통한다 (둘 다 멱등). 예전에는 `watch(isRunning, ...)` 이 부수효과를 걸었는데, 같은 tick 안에서 true→false→true 가 일어나면 워처가 아예 안 도는 문제가 있어 명시적 함수로 바꿨다.

- **좌표 → 거리:** Haversine. 문턱값은 `max(5m, fix.accuracy)` 로 자체 보정된다 — 오차 30m 짜리 fix 는 30m 를 움직여야 인정되므로 정지 상태의 GPS 지터가 쌓이지 않는다. 문턱값 미달이면 **앵커(`lastCoords`)를 갱신하지 않는다.** 느린 이동도 결국 누적되게 하려는 의도이므로 여기를 "고치지" 말 것.
- **세션 시간:** `commitSessionTime()` 이 `pagehide` / `visibilitychange(hidden)` / `stop()` / `onUnmounted` 에서 호출된다. 거리는 fix 마다 영속되는데 시간만 stop 에서 기록하면 탭을 그냥 닫았을 때 누적 평균 속도가 무너지기 때문이다.
- **테스트 세션 격리:** `start({ isTest: true })` 로 시작한 세션은 `localStorage` 누적값(`total-distance`, `total-active-time`)에 절대 쓰지 않는다.

### 영속 상태 (localStorage)

| 키 | 위치 | 내용 |
|---|---|---|
| `total-distance` | useTripStats | 누적 이동 거리 (km) |
| `total-active-time` | useTripStats | 누적 활성 시간 (ms) |
| `app-locale` | stores/i18n.js | `'en' \| 'ko'` |
| `vueuse-color-scheme` | useColorMode 기본 키 | `'auto' \| 'light' \| 'dark'` |

세션 통계(`tripDistance`, `avgSpeed`)와 표시 설정(`fontSize`, `currentView`)은 저장하지 않으며 새로고침 시 초기화된다.

### 테마 — 세 곳이 한 키를 공유한다

1. `index.html` head 최상단의 인라인 스크립트가 **첫 페인트 전에** `class` 와 `data-theme` 을 확정한다 (없으면 다크 사용자가 라이트 배경을 한 프레임 본다).
2. `useColorMode` 가 `<html>` 의 `light`/`dark` **클래스를 직접 관리한다** — App.vue 에서 손대지 말 것.
3. `App.vue` 의 watch 는 DaisyUI 가 읽는 `data-theme` 만 맞춘다.

셋 다 저장소 키 `vueuse-color-scheme` 에 묶여 있다. `useColorMode` 에 커스텀 `storageKey` 를 넘기면 인라인 스크립트가 조용히 깨진다.

`mode.value` 는 `'auto'` 일 수 있으므로 **실제 적용된 테마가 필요하면 `mode.state` 를 쓴다.** 단 `mode.state` 를 템플릿에서 직접 참조하면 안 된다 (SFC 컴파일러가 `mode` 를 언랩해버림) — `const theme = mode.state` 처럼 script 에서 꺼내 넘긴다.

색상은 `main.css` 의 `@theme` 블록(라이트)과 `.dark` 블록(OLED 트루블랙 `#0e0e0f`)에 정의된다. 하드코딩 hex 대신 시맨틱 토큰을 쓴다.

### CSS 에서 조심할 것

- `main.css:1` 은 `@import 'tailwindcss' source(none)` + 명시적 `@source` 두 줄이다. **자동 탐지로 되돌리지 말 것** — `docs/` 의 디자인 목업(다른 클래스 어휘)과 문서 안의 `text-[10px]` 같은 문자열까지 컴파일해 CSS 가 ~40% 부푼다.
- `--shadow-ambient` 는 일부러 `@theme` 이 **아니라** `:root` 에 있다. `@theme` 에 두면 Tailwind 가 라이트 값을 인라인한 유틸리티를 따로 만들어 `.dark` 오버라이드가 먹지 않는다. 대가로 `md:`/`hover:`/`dark:` variant 형태는 존재하지 않는다.
- `font-variation-settings` 는 누적되지 않는 단일 선언이다. `.fill-icon` 은 `FILL` 만이 아니라 네 축을 모두 다시 적어야 한다.

### Gauge 지오메트리

바늘과 눈금 모두 `angleFor()` 하나를 쓴다: **-135° ~ +135° (270° 스윕)**, 비율은 `[0, 1]` 로 클램프된다. 값이 아니라 **각도**를 자르는 것이 핵심 — 값만 자르면 과속 시 바늘이 눈금 밖으로 돌아나가 0 아래에 선다.

### 상수의 위치

과속 경고 임계값이자 게이지 상한인 `MAX_SPEED = 40` 은 `App.vue` 한 곳에만 있고, `Gauge` 는 `:max` 와 `:is-warning` 을 props 로 받는다. Gauge 안에서 `speed > max` 로 "개선"하지 말 것 — 두 값은 의도적으로 분리 가능하다.

### 히든 테스트 모드

헤더 타이틀을 **1.5초 안에 7회 연타**하면 토글된다 (간격이 벌어지면 카운트 리셋). GPS 대신 `mockSpeed` 슬라이더(0~60)가 속도원이 되고 상단에 빨간 DEBUG 뱃지가 뜬다. 진입/이탈 모두 `stopTracking()` 을 거쳐 GPS watch 와 WakeLock 을 반납한다.

### PWA

`vite-plugin-pwa` (`registerType: 'autoUpdate'`, `devOptions.enabled: true`). manifest(앱 이름 `Velocity Speedometer`, 아이콘)는 `vite.config.js` 안에 정의되어 있다. `public/` 에는 아이콘만 두며 별도 manifest 파일을 두지 않는다 (플러그인이 생성·주입한다).

## 컨벤션

- **최소 폰트 크기는 `text-sm`(14px).** `text-xs`, `text-[10px]` 등 금지.
- import 는 `@` 별칭 사용 (`vite.config.js` + `jsconfig.json`).
- Prettier: 세미콜론 없음, 싱글 쿼트, printWidth 100.
- 헤드라인은 `font-headline`(Plus Jakarta Sans) + `tracking-headline`, 본문은 `font-body`.
- 아이콘은 Material Symbols Outlined 폰트 (`<span class="material-symbols-outlined" aria-hidden="true">icon_name</span>`, 채우려면 `fill-icon` 추가).
- `<style scoped>` 블록은 쓰지 않는다. 스타일은 Tailwind 유틸리티와 `main.css` 로만 관리한다.
- 디자인 원칙은 `docs/design/DESIGN.md` (라이트) / `DESIGN_dark.md` (다크) 참고 — 섹션 구분에 1px 실선 대신 배경 톤 차이를 쓰는 "No-Line" 규칙 등. `docs/design/{digital,gauge}/code.html` 은 원본 디자인 목업이며 **빌드 대상이 아니다.**
