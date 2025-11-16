# ✅ WAQI API 테스팅 체크리스트

## 🎯 설정 완료 확인

### 필수 파일 생성 확인
- [x] `.env` 파일 생성됨 (`WAQI_TOKEN=your_token_here`)
- [x] `WAQI_SETUP_GUIDE.md` 작성됨
- [x] `WAQI_QUICK_START.md` 작성됨
- [x] `app/waqi-test.html` 생성됨
- [x] 개발 서버 실행 가능

---

## 📝 설정 체크리스트

### 1단계: WAQI 토큰 획득
- [ ] https://aqicn.org/data-platform/token/ 방문
- [ ] 계정 생성 및 이메일 인증
- [ ] API 토큰 생성 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
- [ ] 토큰 복사

### 2단계: 토큰 설정
- [ ] `.env` 파일 열기: `/home/user/yong_proj/.env`
- [ ] `your_token_here`를 실제 토큰으로 교체
- [ ] 파일 저장

---

## 🧪 로컬 테스트 체크리스트

### 단계 1: 서버 시작

```bash
cd /home/user/yong_proj
npm run dev
```

예상 출력:
```
Serving HTTP on 0.0.0.0 port 3000
```

### 단계 2: 테스트 페이지 방문

브라우저에서: `http://localhost:3000/waqi-test.html`

### 단계 3: 토큰 검증

**UI 방법:**
1. "Token Configuration" 섹션의 입력박스에 토큰 입력 (선택사항)
2. "Set Token" 버튼 클릭
3. 상태 메시지 확인

**콘솔 방법:**
```javascript
// F12 → Console 탭에서 실행
const api = new AirQualityAPI();
console.log('Token:', api.waqiToken);
// 출력 예: Token: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

---

## 🔍 기능별 테스트

### ✅ 테스트 1: 단일 도시 데이터

**UI 테스트:**
1. "Test 1: Fetch City Data" 섹션
2. City Input에 "Seoul" 입력
3. "Fetch Data" 클릭
4. 결과 확인 (PM2.5, AQI, 온도 등)

**콘솔 테스트:**
```javascript
const api = new AirQualityAPI();
api.fetchCityData('Seoul').then(data => {
  console.log('City:', data.cityName);
  console.log('PM2.5:', data.pm25);
  console.log('AQI:', data.aqi);
  console.log('Level:', data.aqiLevel);
});
```

**성공 기준:**
- [ ] HTTP 200 응답
- [ ] PM2.5 값이 숫자 (not null)
- [ ] AQI 값 0-500 범위
- [ ] Coordinates 포함

### ✅ 테스트 2: 여러 도시

**UI 테스트:**
1. "Test 2: Fetch Multiple Cities" 섹션
2. Cities Input 확인 (Seoul,Beijing,Tokyo,Bangkok,Delhi)
3. "Fetch All" 클릭
4. 평균 값 확인

**콘솔 테스트:**
```javascript
const api = new AirQualityAPI();
api.fetchMultipleCities(['Seoul', 'Beijing', 'Tokyo']).then(result => {
  console.log('Cities:', result.citiesCount);
  console.log('Avg PM2.5:', result.avgPM25);
  console.log('Max PM2.5:', result.maxPM25);
  console.log('Data:', result.cities);
});
```

**성공 기준:**
- [ ] 3개 이상의 도시 데이터 조회
- [ ] 평균값 계산됨
- [ ] 모든 도시의 PM2.5 값 포함

### ✅ 테스트 3: 좌표 조회

**UI 테스트:**
1. "Test 3: Fetch by Coordinates" 섹션
2. Latitude: 37.5665, Longitude: 126.978 (서울)
3. "Fetch Data" 클릭

**콘솔 테스트:**
```javascript
const api = new AirQualityAPI();
api.fetchGeoData(37.5665, 126.978).then(data => {
  console.log('Location:', data.coordinates);
  console.log('PM2.5:', data.pm25);
});
```

**성공 기준:**
- [ ] 좌표로 정상 조회됨
- [ ] PM2.5 값 반환

### ✅ 테스트 4: 배치 작업

**UI 테스트:**
1. "Test 4: Batch Operations" 섹션
2. "Run All Tests" 클릭
3. 3개 테스트 모두 PASS 확인

**성공 기준:**
- [ ] Seoul test PASS
- [ ] Multiple Cities (3) PASS
- [ ] Geo Coordinates PASS

---

## 🔌 글로브 페이지 통합 테스트

### 글로브 페이지 로드

```bash
# 서버 실행 중
http://localhost:3000/globe.html
```

### 확인 사항

1. **콘솔 로그**
   ```
   F12 → Console 탭
   ```
   - [ ] `✅ WAQI API token loaded from config` 메시지 있음
   - [ ] `🌐 Fetching WAQI data for [city]...` 로그 있음
   - [ ] `✅ Updated stations in global service` 메시지 있음

2. **페이지 성능**
   - [ ] 2-3초 내 로드 완료
   - [ ] PM2.5 마커 표시됨 (빛나는 점)
   - [ ] 지구본 회전 매끄러움

3. **Policy Explorer**
   - [ ] 우측 패널에 "Global Statistics" 표시
   - [ ] Countries: 68 (숫자)
   - [ ] Policies: 68 (숫자)
   - [ ] Regions: 123 (숫자)

4. **실시간 데이터**
   - [ ] PM2.5 마커의 실시간 값 표시
   - [ ] 각 도시별 AQI 레벨 표시

---

## 📊 예상 응답 예시

### 성공 응답 (Demo/Free 토큰)

```json
{
  "cityName": "Seoul",
  "stationName": "Seoul",
  "aqi": 125,
  "aqiLevel": "Unhealthy for Sensitive Groups",
  "pm25": 48.5,
  "pm10": 78.2,
  "coordinates": {
    "lat": 37.5665,
    "lon": 126.978
  },
  "timestamp": "2025-11-16T12:00:00Z",
  "dominantPollutant": "pm25",
  "url": "https://aqicn.org/city/seoul/"
}
```

### 배치 응답

```json
{
  "citiesCount": 3,
  "avgPM25": 42.3,
  "maxPM25": 52.1,
  "minPM25": 28.5,
  "avgAQI": 110.5,
  "cities": [
    { "cityName": "Seoul", "pm25": 48.5, "aqi": 125 },
    { "cityName": "Beijing", "pm25": 52.1, "aqi": 128 },
    { "cityName": "Tokyo", "pm25": 28.5, "aqi": 85 }
  ]
}
```

---

## ⚠️ 오류 처리

### 오류 1: Invalid Token

**콘솔 메시지:**
```
Failed to fetch WAQI data: WAQI API error: 401
```

**원인:** 토큰이 잘못되거나 활성화되지 않음

**해결:**
```bash
# 1. 토큰 확인
cat .env | grep WAQI_TOKEN

# 2. 새 토큰 발급
# https://aqicn.org/data-platform/token/

# 3. 브라우저 캐시 삭제
# F12 → Application → Clear
```

### 오류 2: API Limit Exceeded

**콘솔 메시지:**
```
Failed to fetch WAQI data: WAQI API error: 429
```

**원인:** Demo/Free 토큰 일일 한도 초과

**해결:**
- Demo 토큰: 다음 날 사용 가능 (1,000/day)
- Free 토큰: Free 계정으로 업그레이드
- Premium: 유료 플랜 구매

### 오류 3: City Not Found

**콘솔 메시지:**
```
WAQI error for [city]: No City Matched
```

**원인:** 올바르지 않은 도시명

**해결:**
- 영문 도시명 사용 (예: Seoul, not 서울)
- WAQI 웹사이트에서 도시 검색: https://aqicn.org/

### 오류 4: CORS Error

**콘솔 메시지:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**원인:** 로컬 파일로 실행 중

**해결:**
```bash
# HTTP 서버 필요
npm run dev
# http://localhost:3000/globe.html (file:// 아님)
```

---

## 🚀 성능 확인

### 응답 시간

**첫 요청 (API 호출):**
- 예상: 500ms - 2초

**재요청 (캐시 사용):**
- 예상: 1-10ms

**배치 요청 (5개 도시):**
- 예상: 2-5초 (병렬 처리)

### 캐시 확인

```javascript
const api = new AirQualityAPI();
console.log('Cache size:', api.cache.size);
console.log('Cache entries:', Array.from(api.cache.keys()));
```

---

## 📋 최종 확인 체크리스트

### 설정 단계
- [ ] `.env` 파일에 실제 토큰 입력
- [ ] npm run dev 실행
- [ ] 서버가 port 3000에서 실행 중

### 기능 테스트
- [ ] 테스트 페이지 접속 가능
- [ ] 단일 도시 조회 성공
- [ ] 여러 도시 조회 성공
- [ ] 좌표 조회 성공
- [ ] 배치 작업 모두 PASS

### 통합 테스트
- [ ] globe.html 로드 성공
- [ ] 토큰 로드 메시지 표시
- [ ] Policy Explorer 통계 표시
- [ ] PM2.5 마커 표시

### 에러 처리
- [ ] 잘못된 토큰 처리 확인
- [ ] 제한 초과 시 오류 메시지
- [ ] 없는 도시 처리 확인

---

## 🔗 문서 참고

| 문서 | 내용 |
|------|------|
| `WAQI_SETUP_GUIDE.md` | 상세 설정 가이드 |
| `WAQI_QUICK_START.md` | 5분 빠른 시작 |
| `DATA_FORMAT_GUIDE.md` | 데이터 구조 설명 |
| `IMPLEMENTATION_GUIDE.md` | 전체 구현 가이드 |

---

## 📞 도움말

**도움이 필요하면:**
1. `WAQI_SETUP_GUIDE.md`의 트러블슈팅 섹션 확인
2. 브라우저 콘솔에서 오류 메시지 확인
3. 네트워크 탭에서 API 응답 확인 (F12)
4. WAQI 웹사이트 상태 확인: https://aqicn.org/

---

마지막 업데이트: 2025-11-16
