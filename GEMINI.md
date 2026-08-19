# Project GEMINI Context: Speedometer

## Project Overview
Speedometer는 Vue 3와 Vite를 기반으로 구축된 GPS 속도계 PWA임.

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Build Tool:** Vite
- **Routing:** 없음. `main.js`가 `App.vue`를 직접 마운트하는 단일 화면 앱임.
- **State Management:** Pinia
- **Styling:** Tailwind CSS 4 + DaisyUI 5 (`assets/main.css`)
- **Linting & Formatting:** ESLint, Oxlint, Prettier

## Directory Structure Highlights
- `src/`: 소스 코드 루트
    - `main.js`: 애플리케이션 엔트리 포인트
    - `App.vue`: 루트 컴포넌트 (조립 + 추적 제어)
    - `components/`: UI 컴포넌트
    - `composables/`: 재사용 로직 (`useTripStats`)
    - `stores/`: Pinia 상태 저장소 (`i18n`)
    - `assets/main.css`: 테마 토큰과 전역 스타일
- `public/`: 정적 파일 저장소 (Favicon 등)

## Building and Running
이 프로젝트에서 사용 가능한 주요 명령어는 다음과 같음:

- **의존성 설치:** `npm install`
- **개발 서버 실행:** `npm run dev`
- **프로덕션 빌드:** `npm run build`
- **빌드 결과물 미리보기:** `npm run preview`
- **린트 체크 (Oxlint + ESLint):** `npm run lint`
- **코드 포맷팅 (Prettier):** `npm run format`

## Development Conventions
- **최소 폰트 사이즈:** 프로젝트의 모든 텍스트는 최소 `text-sm` (14px) 이상이어야 함. 더 작은 사이즈는 절대 사용 금지.
- **파일 경로 별칭:** `vite.config.js`에 설정된 대로 `@` 기호를 사용하여 `src/` 디렉토리에 접근함 (예: `import Gauge from '@/components/Gauge.vue'`).
- **색상:** 하드코딩된 hex 대신 `main.css`의 시맨틱 토큰(`bg-surface-container`, `text-on-surface-variant`)을 사용함.
- **상태 관리:** 여러 컴포넌트가 공유하는 상태는 `src/stores/`의 Pinia 스토어, 한 화면에 묶인 로직은 `src/composables/`를 활용함.
- **컴포넌트 스타일:** 스타일은 Tailwind 유틸리티로 처리하며 `<style scoped>` 블록은 두지 않음.
- **코드 품질:** Oxlint를 통해 빠른 정적 분석을 수행하고, ESLint와 Prettier를 통해 코드 스타일과 잠재적 버그를 관리함.
