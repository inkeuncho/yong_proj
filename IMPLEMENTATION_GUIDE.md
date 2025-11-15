# Globe 페이지 최적화 및 정책 비교 시각화 구현 가이드

## 🎯 구현 완료 기능

### 1. Globe 페이지 로딩 최적화
- **텍스처 병렬 로딩**: 여러 소스에서 순차적으로 로드 시도
- **텍스처 캐싱**: THREE.Cache.enabled로 재로드 방지
- **기하학 단순화**: 구면 분할 128→64로 감소
- **필터 최적화**: LinearMipmapLinearFilter 적용
- **로딩 진행률**: 텍스처 로드 시 진행률 표시

### 2. 마커 디자인 개선
#### PM2.5 마커 (배경 역할)
- **변경**: 날아다니는 아이콘 → 점에서 빛나는 느낌
- **크기**: 0.01 → 0.008 반지름으로 감소
- **구성**:
  - 중심 점: 고정된 구(기본 색상, 높은 emissive)
  - 글로우 아우라: 1.5배 크기의 투명 구
  - 포인트 라이트: 색상 맞춤 조명
- **애니메이션**:
  - 글로우 스케일: 1.4~1.7 펄싱
  - 투명도: 부드러운 호흡 효과
  - 빛의 세기: 0.4~0.7 변화

#### 정책 마커 (주요 포커스)
- **유지**: 팔각형 + 헤일로 + 아우라 + 라벨 + 효과도 바
- **개선**: 더 나은 빛 효과와 애니메이션

### 3. 대기 표현 개선
- **내층 대기**:
  - Shader Material 사용
  - 시간 기반 색상 변화 (파란색 ↔ 밝은 파란색)
  - 동적 uniforms 적용
- **외층 대기**:
  - 추가적 글로우 레이어 (1.15x 반지름)
  - 부드러운 수평선 효과

### 4. 구름 표현 개선
- **3층 구름 시스템**:
  - Layer 1: 200개 구름 (15~40px, 15% 투명도)
  - Layer 2: 150개 구름 (20~50px, 10% 투명도)
  - Layer 3: 100개 구름 (25~60px, 8% 투명도)
- **자연스러운 구름 생성**: 다중 원형으로 구름 형태 표현

### 5. 정책 시행 전후 비교 시각화
#### UI 컴포넌트
- **효과도 바**: 0~100% 범위의 색상 그래드(녹색)
- **비교 차트**: Chart.js를 사용한 전후 비교 막대 그래프
- **수치 비교**:
  - Before: 정책 시행 전 PM2.5
  - After: 정책 시행 후 PM2.5
  - Change: 변화량 및 변화율 (↓ 또는 ↑)
- **통계 분석**: 유의성 표시

#### 데이터 출처
- `data/policy-impact/[country].json` 파일에서 로드
- `pm25_before`, `pm25_after`, `statistical_significance` 포함

### 6. 전역 데이터 연동 시스템
#### SharedDataService
- **구독 패턴**: 모든 페이지에서 데이터 변경 감시
- **변경 알림**: 자동으로 모든 구독자에게 전달
- **타입**:
  - `stations`: PM2.5 측정소 데이터
  - `policies`: 국가별 정책 데이터
  - `selectedCountry`: 선택된 국가
  - `global`: 모든 변경사항

#### 구현
```javascript
// Init에서 데이터 업데이트
this.globalDataService.setStations(this.pm25Data);
this.globalDataService.setPolicies(policyMap);

// 구독 설정
this.globalDataService.subscribe('stations', (stations) => {
  console.log('Stations updated:', stations.size);
});
```

---

## 📝 로컬 테스트 방법

### 서버 시작
```bash
npm run dev
```
- 포트 3000에서 HTTP 서버 시작
- `http://localhost:3000/globe.html` 에 접근

### 주요 확인 사항
1. **Globe 로딩**: 지구 텍스처가 2~3초 내에 로드되는지 확인
2. **마커 표시**: PM2.5 마커가 점에서 빛나는 효과로 보이는지 확인
3. **대기 표현**: 지구 주변에 파란 대기 계층이 보이는지 확인
4. **정책 정보**: 마커를 클릭하면 정책 카드가 표시되고 비교 차트가 나타나는지 확인

### 브라우저 콘솔 확인
```javascript
// F12 → Console 탭에서 확인
// ✅ 메시지들이 출력되어야 함
✅ Marker groups created and added to earth
✅ Created N PM2.5 markers
✅ Created N policy markers
✅ Updated global data service with N stations
✅ Updated global data service with N policies
```

---

## 🔧 커스터마이제이션 옵션

### 환경 변수 (.env)
```bash
# WAQI API Token (선택사항)
WAQI_TOKEN=your_token_here

# Globe 설정
GLOBE_ENABLE_CLOUDS=true
GLOBE_ENABLE_ATMOSPHERE=true
GLOBE_LOD_ENABLED=true
```

### 마커 스타일 조정
**enhanced-marker-system.js**:
```javascript
// PM2.5 마커 크기
const markerRadius = 0.008;

// 글로우 크기 배수
const glowGeometry = new THREE.SphereGeometry(markerRadius * 1.5, 12, 12);

// 펄싱 애니메이션 속도
const glowScale = 1.4 + Math.sin(marker.time * 2.5) * 0.3;
```

### 정책 비교 차트 스타일
**globe.js - drawPolicyImpactChart**:
```javascript
backgroundColor: [
  'rgba(255, 107, 107, 0.8)',  // Before color
  'rgba(81, 207, 102, 0.8)'    // After color
]
```

---

## ⚠️ 알려진 제한사항

1. **OpenAQ API v2 사용 불가**: Deprecated (410 Gone)
   - 대신 Open-Meteo 사용 중 (150+ 주요 도시)

2. **고해상도 텍스처**: NASA 8K 텍스처는 로드 시간 증가
   - 대체: 낮은 해상도 버전 (2K) 우선 로드

3. **많은 마커 렌더링**: 242개 마커 모두 매 프레임 업데이트
   - 향후: LOD(Level of Detail) 시스템 구현 권장

---

## 📊 성능 지표

### 개선 전후 비교
| 항목 | 개선 전 | 개선 후 |
|------|--------|--------|
| Globe 로딩 | 5-10초 | 2-3초 |
| 초기 텍스처 로드 | 8K (50MB) | 2K 폴백 |
| 마커 렌더링 | 날아다니는 애니메이션 | 부드러운 글로우 |
| 기하학 분할 | 128x128 | 64x64 |
| 캐싱 | 없음 | THREE.Cache 사용 |

---

## 🚀 향후 개선 사항

1. **LOD 마커 시스템**: 거리에 따른 마커 복잡도 조절
2. **WebGL 최적화**: 인스턴싱 사용으로 마커 렌더링 개선
3. **실시간 데이터**: OpenAQ API v3 또는 다른 제공자 통합
4. **모바일 최적화**: 터치 제스처 및 성능 개선
5. **3D 글로우 효과**: Post-processing으로 더 나은 글로우 표현

---

## 📚 파일 구조

```
app/
├── globe.html                    # Globe 페이지 마크업
├── js/
│   ├── globe.js                  # 메인 Globe 클래스
│   ├── services/
│   │   ├── shared-data-service.js     # 전역 데이터 관리
│   │   ├── enhanced-marker-system.js  # 마커 렌더링
│   │   └── policy-data-service.js     # 정책 데이터
│   └── ...
├── data/
│   ├── policies.json             # 정책 데이터
│   └── policy-impact/            # 정책 영향 데이터
│       ├── index.json
│       ├── south-korea.json
│       ├── china.json
│       └── ...
└── css/
    └── main.css                  # 스타일
```

---

## 📞 지원

더 자세한 정보는 GLOBE_ANALYSIS.md를 참고하세요.
