# 🚀 WAQI API 빠른 시작 가이드

## 5분 안에 WAQI API 설정하기

### 단계 1️⃣: API 토큰 획득 (2분)

1. **웹사이트 방문**
   ```
   https://aqicn.org/data-platform/token/
   ```

2. **계정 만들기**
   - "Sign Up" 클릭
   - 이메일 입력
   - 이메일 인증

3. **토큰 생성**
   - 로그인 후 "Create New Token" 클릭
   - 복사 (예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### 단계 2️⃣: 로컬 설정 (2분)

#### 방법 A: .env 파일 (권장)

```bash
# 파일 생성
nano /home/user/yong_proj/.env

# 내용 추가
WAQI_TOKEN=your_token_here
```

위의 `your_token_here`를 실제 토큰으로 교체.

#### 방법 B: HTML에 직접 주입

`app/globe.html`의 `<head>` 섹션에 추가:

```html
<script>
  window.WAQI_CONFIG = {
    token: 'your_token_here'
  };
</script>
```

### 단계 3️⃣: 테스트 (1분)

#### 방법 1: 테스트 페이지 사용

```bash
# 서버 시작
npm run dev

# 브라우저 열기
http://localhost:3000/waqi-test.html
```

#### 방법 2: 브라우저 콘솔 테스트

```bash
# 1. 서버 시작
npm run dev

# 2. http://localhost:3000/globe.html 방문

# 3. F12 → Console 탭에서 실행
const api = new AirQualityAPI();
api.fetchCityData('Seoul').then(console.log);
```

---

## 📊 예상 결과

### ✅ 성공

```javascript
{
  cityName: "Seoul",
  aqi: 125,
  aqiLevel: "Unhealthy for Sensitive Groups",
  pm25: 48.5,
  pm10: 78.2,
  coordinates: { lat: 37.5665, lon: 126.978 },
  timestamp: "2025-11-16T12:00:00Z",
  ...
}
```

### ❌ 오류

```
⚠️ No WAQI token configured, using demo token (limited)
// Demo 토큰으로 실행 중 (일일 1,000 요청 제한)
```

---

## 🧪 실제 테스트 명령어

```javascript
// 테스트 1: 단일 도시
const api = new AirQualityAPI();
api.fetchCityData('Seoul').then(d => console.log(d));

// 테스트 2: 여러 도시
api.fetchMultipleCities(['Seoul', 'Beijing', 'Tokyo']).then(d => {
  console.log('Average PM2.5:', d.avgPM25);
});

// 테스트 3: 좌표로 검색
api.fetchGeoData(37.5665, 126.978).then(console.log);

// 테스트 4: 캐시 확인
console.log('Cache size:', api.cache.size);
```

---

## 💡 팁

### API 한도 확인

| 토큰 종류 | 일일 한도 | 분당 한도 |
|---------|---------|---------|
| Demo | 1,000 | 무제한 |
| Free | 10,000 | 100 |
| Premium | 1M+ | 10K |

### 캐시 활용

데이터는 30분 동안 캐시되므로:
- 같은 도시 반복 요청 = 캐시 사용 (빠름)
- 다른 도시 요청 = API 호출 (느림)

### 요청 최소화

```javascript
// ❌ 비효율적
for (let i = 0; i < 100; i++) {
  api.fetchCityData('Seoul');  // 100번 호출
}

// ✅ 효율적
api.fetchCityData('Seoul');    // 1번 호출, 나머지는 캐시
```

---

## 🔗 더 알아보기

- **WAQI 문서**: https://aqicn.org/api/
- **전체 가이드**: WAQI_SETUP_GUIDE.md
- **데이터 포맷**: DATA_FORMAT_GUIDE.md

---

## ⚡ 문제 해결

| 문제 | 해결방법 |
|------|--------|
| "Invalid token" | 토큰 다시 확인, 새로 발급 |
| "API limit exceeded" | 다음 날까지 대기 또는 유료 플랜 |
| 데이터 없음 | 도시명 확인 (영문 필수) |
| CORS 오류 | 개발 서버 사용, HTTPS 아님 |

---

마지막 업데이트: 2025-11-16
