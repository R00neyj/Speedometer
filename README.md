# Speedometer Web App (PWA)

GPS 기반으로 실시간 속도를 측정하고 표시하는 현대적인 웹 애플리케이션입니다.

## 주요 기능
- **실시간 속도 측정**: GPS를 이용해 km/h 단위로 속도를 표시합니다.
- **아날로그 게이지**: 0~40km/h 범위의 바늘 게이지 시각화.
- **사용자 지정 UI**: 디지털 속도 표시의 폰트 사이즈를 직접 조절할 수 있습니다.
- **화면 꺼짐 방지 (Wake Lock)**: 속도계가 작동하는 동안 화면이 자동으로 꺼지지 않습니다.
- **오프라인 지원 (PWA)**: 설치 가능한 웹앱으로, 인터넷 연결 없이도 사용 가능합니다.
- **다크 테마 지원**: 시스템 설정에 맞춘 테마 전환 및 트루블랙(#000000) 다크 모드 지원.

## 기술 스택
- **Framework**: Vue 3 (Composition API)
- **Styling**: Tailwind CSS
- **Utilities**: VueUse (@vueuse/core)
- **PWA**: vite-plugin-pwa
- **Build Tool**: Vite

## 설치 및 실행

### 의존성 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드 및 PWA 확인
```bash
npm run build
npm run preview
```

## 사용 방법
1. 브라우저에서 위치 정보 접근 권한을 허용합니다.
2. 'START' 버튼을 누르면 GPS 추적이 시작되고 화면 꺼짐 방지가 활성화됩니다.
3. 'STOP' 버튼을 누르면 추적이 중단됩니다.
4. 상단 설정 메뉴에서 폰트 사이즈 조절 및 테마 전환이 가능합니다.
"# Speedometer" 
