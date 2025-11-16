# WAQI API 설정 및 테스트 가이드

## 📋 목차
1. [WAQI API 토큰 획득](#waqi-api-토큰-획득)
2. [로컬 환경 설정](#로컬-환경-설정)
3. [토큰 검증](#토큰-검증)
4. [테스트 방법](#테스트-방법)
5. [트러블슈팅](#트러블슈팅)

---

## 🔑 WAQI API 토큰 획득

### 단계 1: WAQI 계정 생성

1. https://aqicn.org/data-platform/token/ 방문
2. "Sign Up" 또는 "Create Account" 버튼 클릭
3. 다음 정보 입력:
   - **Email**: 본인의 이메일 주소
   - **Name**: 이름 (예: "Fine Dust Project")
   - **Organization**: 조직명 (선택사항)
   - **Purpose**: 용도 (예: "Air Quality Monitoring")

### 단계 2: 이메일 확인

1. 등록한 이메일로 확인 메일 수신
2. 메일의 링크를 클릭하여 계정 활성화

### 단계 3: API 토큰 생성

1. WAQI Data Platform 대시보드에 로그인
2. "API Token" 섹션으로 이동
3. "Create New Token" 클릭
4. 토큰 용도 입력 (예: "Fine Dust Globe App")
5. 토큰 생성 및 복사
   - 예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 토큰 등급별 제한사항

| 등급 | 요청/일 | 요청/분 | 설명 |
|------|---------|---------|------|
| Demo | 1,000 | 무제한 | 테스트 및 개발용 |
| Free | 10,000 | 100 | 개인/비영리 프로젝트 |
| Premium | 1M+ | 10,000 | 상용 프로젝트 |

---

## ⚙️ 로컬 환경 설정

### 방법 1: `.env` 파일 사용 (추천)

#### 1단계: `.env` 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일 생성:

```bash
cd /home/user/yong_proj
nano .env
```

#### 2단계: 다음 내용 추가

```
# WAQI API Token - https://aqicn.org/data-platform/token/
WAQI_TOKEN=your_actual_token_here

# 예시 (실제 토큰으로 교체)
# WAQI_TOKEN=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6

# 선택사항: OpenWeather API
OPENWEATHER_TOKEN=

# Globe 설정
GLOBE_ENABLE_CLOUDS=true
GLOBE_ENABLE_ATMOSPHERE=true
GLOBE_LOD_ENABLED=true
```

#### 3단계: 파일 저장

- `Ctrl + O` → `Enter` → `Ctrl + X` (nano 편집기)
- 또는 `Ctrl + S` (다른 편집기)

### 방법 2: HTML에 직접 주입 (테스트 용)

`app/globe.html`의 `<head>` 섹션에 추가:

```html
<script>
  // WAQI API Configuration
  window.WAQI_CONFIG = {
    token: 'your_actual_token_here'
  };
</script>
```

### 방법 3: config.js 파일 생성 (고급)

`app/js/config.js` 생성:

```javascript
// WAQI Configuration
const WAQI_CONFIG = {
  token: 'your_actual_token_here'
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WAQI_CONFIG;
}
```

---

## ✅ 토큰 검증

### 로컬 서버 시작

```bash
npm run dev
# 또는
python3 -m http.server 3000 --directory app
```

**출력:**
```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/)
```

### 브라우저 콘솔에서 검증

1. `http://localhost:3000/globe.html` 방문
2. F12 키로 개발자 도구 열기
3. Console 탭에서 다음 명령 실행:

```javascript
// AirQualityAPI 인스턴스 생성
const airAPI = new AirQualityAPI();

// 로드된 토큰 확인
console.log('WAQI Token:', airAPI.waqiToken);
```

**예상 결과:**
- ✅ 토큰 설정됨: `✅ WAQI API token loaded from config`
- ❌ 토큰 미설정: `⚠️ No WAQI token configured, using demo token (limited)`

---

## 🧪 테스트 방법

### 테스트 1: 도시별 데이터 조회

브라우저 콘솔에서:

```javascript
const airAPI = new AirQualityAPI();

// 서울 데이터 조회
airAPI.fetchCityData('Seoul').then(data => {
  console.log('Seoul Air Quality:', data);
});
```

**예상 응답:**
```javascript
{
  cityName: "Seoul",
  stationName: "Seoul",
  aqi: 125,
  aqiLevel: "Unhealthy for Sensitive Groups",
  pm25: 48.5,
  pm10: 78.2,
  coordinates: {
    lat: 37.5665,
    lon: 126.978
  },
  timestamp: "2025-11-16T12:00:00Z",
  dominantPollutant: "pm25",
  attribution: [...],
  url: "https://..."
}
```

### 테스트 2: 여러 도시 조회

```javascript
const airAPI = new AirQualityAPI();

// 여러 도시 데이터 조회
airAPI.fetchMultipleCities(['Seoul', 'Beijing', 'Tokyo']).then(data => {
  console.log('Country Statistics:', {
    citiesCount: data.citiesCount,
    avgPM25: data.avgPM25,
    maxPM25: data.maxPM25,
    minPM25: data.minPM25,
    avgAQI: data.avgAQI,
    cities: data.cities.map(c => ({
      name: c.cityName,
      pm25: c.pm25,
      aqi: c.aqi
    }))
  });
});
```

### 테스트 3: 좌표별 조회

```javascript
const airAPI = new AirQualityAPI();

// 서울 좌표로 조회
airAPI.fetchGeoData(37.5665, 126.978).then(data => {
  console.log('Geo Data for Seoul:', data);
});
```

### 테스트 4: curl 명령으로 직접 테스트

터미널에서 (토큰 교체 필요):

```bash
# 도시별 조회
curl "https://api.waqi.info/feed/Seoul/?token=YOUR_TOKEN_HERE"

# 좌표별 조회
curl "https://api.waqi.info/feed/geo:37.5665;126.978/?token=YOUR_TOKEN_HERE"

# 결과 포맷팅 (jq 필요)
curl -s "https://api.waqi.info/feed/Seoul/?token=YOUR_TOKEN_HERE" | jq '.'
```

---

## 📊 실제 데이터 로드 테스트

Globe 페이지에서 실제 데이터가 로드되는지 확인:

### 1단계: 서버 시작

```bash
npm run dev
```

### 2단계: globe.html 접속

브라우저: `http://localhost:3000/globe.html`

### 3단계: 콘솔 확인

```
F12 → Console 탭에서 다음 로그 확인:
```

**정상 로드 시 로그:**
```
✅ WAQI API token loaded from config
🌐 Fetching WAQI data for Seoul...
📥 Loading Earth texture (1/2): CDN (2K)
✅ Updated stations in global service
Phase 2: Create 3D Elements: 5234ms
```

**문제 발생 시 로그:**
```
⚠️ No WAQI token configured, using demo token (limited)
🌐 Fetching WAQI data for Seoul...
Failed to fetch WAQI data for Seoul: error message
```

---

## 🔍 API 응답 형식

### 성공 응답 (status: 'ok')

```json
{
  "status": "ok",
  "data": {
    "aqi": 125,
    "idx": 3014,
    "dominentpol": "pm25",
    "iaqi": {
      "pm25": { "v": 48.5 },
      "pm10": { "v": 78.2 },
      "o3": { "v": 15.2 },
      "no2": { "v": 32.1 },
      "so2": { "v": 5.2 }
    },
    "time": {
      "s": "2025-11-16 12:00:00",
      "tz": "+09:00",
      "iso": "2025-11-16T12:00:00+09:00"
    },
    "city": {
      "geo": [37.5665, 126.978],
      "name": "Seoul",
      "url": "https://aqicn.org/city/seoul/"
    }
  }
}
```

### 오류 응답 (status: 'error')

```json
{
  "status": "error",
  "data": "Invalid token or API limit exceeded"
}
```

---

## 🚨 트러블슈팅

### 문제 1: "Invalid token" 오류

**원인:**
- 토큰이 잘못됨
- 토큰이 활성화되지 않음
- 토큰이 삭제됨

**해결책:**
1. https://aqicn.org/data-platform/token/ 방문
2. 토큰 재발급
3. `.env` 파일 업데이트
4. 브라우저 캐시 삭제 (Ctrl + Shift + Delete)
5. 페이지 새로고침

### 문제 2: "API limit exceeded" 오류

**원인:**
- Demo 토큰 일일 한도(1,000 요청) 초과
- Free 토큰 분당 한도(100 요청) 초과

**해결책:**
1. 다음 날까지 기다리기 (Demo 토큰)
2. Premium 토큰으로 업그레이드
3. 요청 간격 늘리기 (최소 600ms 간격)

### 문제 3: CORS 오류

**원인:**
- 브라우저의 CORS 정책으로 인한 요청 차단

**해결책:**
```bash
# 개발 시에만 CORS 정책 비활성화 (크롬)
google-chrome --disable-web-security --user-data-dir=/tmp/test-profile
```

### 문제 4: 캐시된 오래된 데이터

**원인:**
- 30분 캐시 TTL로 인한 데이터 갱신 지연

**해결책:**
```javascript
// 캐시 초기화
const airAPI = new AirQualityAPI();
airAPI.cache.clear();

// 데이터 다시 로드
airAPI.fetchCityData('Seoul');
```

---

## 📈 성능 최적화

### 1. 배치 요청

여러 도시를 한 번에 조회하면 더 효율적:

```javascript
const cities = ['Seoul', 'Beijing', 'Tokyo', 'Bangkok'];
const airAPI = new AirQualityAPI();

airAPI.fetchMultipleCities(cities).then(data => {
  console.log('Batch data loaded:', data);
});
```

### 2. 캐시 활용

30분 캐시로 불필요한 API 호출 감소:

```javascript
// 첫 호출: API 요청
airAPI.fetchCityData('Seoul');  // 실제 요청

// 30분 내 재호출: 캐시 사용
airAPI.fetchCityData('Seoul');  // 📦 캐시 사용
```

### 3. 요청 타이밍 조정

```javascript
// 30초마다 업데이트 (권장)
setInterval(async () => {
  const data = await airAPI.fetchCityData('Seoul');
  updateGlobeMarkers(data);
}, 30000);
```

---

## 📝 .env 파일 예시

완전한 설정 예시:

```bash
# ============================================
# WAQI API Configuration
# ============================================

# 필수: WAQI API 토큰
# 획득 방법: https://aqicn.org/data-platform/token/
# 예시: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
WAQI_TOKEN=your_actual_token_here

# ============================================
# 선택사항: OpenWeather API
# ============================================
# OPENWEATHER_TOKEN=your_openweather_token

# ============================================
# Globe 설정
# ============================================
GLOBE_ENABLE_CLOUDS=true
GLOBE_ENABLE_ATMOSPHERE=true
GLOBE_LOD_ENABLED=true

# ============================================
# 개발 환경 설정
# ============================================
NODE_ENV=development
DEBUG=true
```

---

## ✅ 체크리스트

설정 완료 확인:

- [ ] WAQI 계정 생성 완료
- [ ] API 토큰 생성 및 복사 완료
- [ ] `.env` 파일 생성 및 토큰 입력 완료
- [ ] `npm run dev` 실행 성공
- [ ] 브라우저 콘솔에서 토큰 로드 확인
- [ ] curl 명령으로 API 응답 확인
- [ ] 브라우저 콘솔에서 `fetchCityData('Seoul')` 테스트 성공
- [ ] Globe 페이지에서 실제 마커 표시 확인
- [ ] Policy Explorer에 실시간 데이터 표시 확인

---

## 📞 참고 자료

- **WAQI API 문서**: https://aqicn.org/api/
- **WAQI 토큰 관리**: https://aqicn.org/data-platform/token/
- **공기질 지수 설명**: https://aqicn.org/faq/
- **우리 프로젝트 데이터 구조**: DATA_FORMAT_GUIDE.md
- **성능 최적화**: PERFORMANCE_OPTIMIZATION_REPORT.md

---

마지막 업데이트: 2025-11-16
