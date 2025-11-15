# 데이터 저장 형식 분석 보고서

## 📊 전체 데이터 구조

모든 데이터는 **JSON 형식**으로 저장되며, 계층적 디렉토리 구조로 조직되어 있습니다.

```
app/data/
├── policies.json                 # 간단 정책 목록 (빠른 로드용)
├── policies/
│   └── enhanced-policies.json    # 상세 정책 데이터 (시계열 포함)
├── pm25/
│   └── latest.json              # 최신 PM2.5 측정소 데이터
└── policy-impact/
    ├── index.json               # 정책 영향 인덱스 (빠른 접근)
    └── [67개 국가].json         # 국가별 상세 정책 영향 데이터
```

---

## 📄 각 파일 형식 상세

### 1️⃣ **policies.json** (간단 정책 목록)

**용도**: 빠른 로드용 간단한 정책 정보

**구조**:
```json
{
  "updated": "2025-11-07T00:00:00Z",
  "count": 5,
  "policies": [
    {
      "id": "kr_moe_2024",
      "country": "South Korea",
      "authority": "Ministry of Environment",
      "title": "Clean Air Conservation Act",
      "description": "Comprehensive plan to reduce PM2.5 to 15 μg/m³ by 2030",
      "target_pm25": 15,
      "target_year": 2030,
      "credibility": 0.95,
      "url": "https://www.airkorea.or.kr"
    }
  ]
}
```

**필드 설명**:
- `id`: 정책 고유 ID (예: kr_moe_2024)
- `country`: 국가명
- `authority`: 정책 담당 기관
- `title`: 정책명
- `description`: 정책 설명
- `target_pm25`: 목표 PM2.5 수치
- `target_year`: 목표 달성 연도
- `credibility`: 신뢰도 (0~1)
- `url`: 정책 상세 링크

---

### 2️⃣ **pm25/latest.json** (최신 PM2.5 측정소)

**용도**: Globe 페이지에 표시할 실시간 PM2.5 데이터

**구조**:
```json
{
  "stations": [
    {
      "id": "seoul-001",
      "name": "Seoul City Hall",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "country": "South Korea",
      "pm25": 28.5,
      "pm10": 45.2,
      "aqi": 85,
      "timestamp": "2025-11-05T12:00:00Z",
      "source": "WAQI"
    }
  ]
}
```

**필드 설명**:
- `id`: 측정소 고유 ID
- `name`: 측정소명
- `latitude/longitude`: 위도/경도 (지구본 마커 위치)
- `country`: 국가
- `pm25`: PM2.5 농도 (μg/m³)
- `pm10`: PM10 농도 (μg/m³)
- `aqi`: 공기질 지수
- `timestamp`: 측정 시간
- `source`: 데이터 출처 (WAQI)

---

### 3️⃣ **policy-impact/index.json** (정책 영향 인덱스)

**용도**: 빠른 국가 접근 및 메타데이터

**구조**:
```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-08T12:00:00Z",
  "description": "Policy Impact Data Index",
  "countries": [
    {
      "country": "China",
      "countryCode": "CN",
      "region": "East Asia",
      "flag": "🇨🇳",
      "dataFile": "china.json",
      "policyCount": 2,
      "lastUpdated": "2025-11-08T12:00:00Z",
      "coordinates": {
        "lat": 35.8617,
        "lon": 104.1954
      }
    }
  ]
}
```

**필드 설명**:
- `country`: 국가명
- `countryCode`: ISO 국가 코드
- `region`: 지역 (예: East Asia)
- `flag`: 국기 이모지
- `dataFile`: 해당 국가 상세 파일명
- `policyCount`: 정책 수
- `coordinates`: 국가 중심 좌표

---

### 4️⃣ **policy-impact/[country].json** (국가별 상세 정책 영향)

**용도**: 정책별 상세 분석 및 시계열 데이터

**구조** (south-korea.json 예시):
```json
{
  "country": "South Korea",
  "countryCode": "KR",
  "region": "East Asia",
  "flag": "🇰🇷",
  "coordinates": {
    "lat": 37.5665,
    "lon": 126.9780
  },
  "policies": [
    {
      "id": "kr-fine-dust-special-act",
      "name": "Fine Dust Special Act",
      "implementationDate": "2019-02-15",
      "type": "Comprehensive Regulation",
      "url": "https://...",
      "description": "Comprehensive legislation...",
      "targetPollutants": ["PM2.5", "PM10"],
      "measures": [
        "Emergency reduction measures",
        "Old diesel vehicle phase-out",
        "Seasonal management system"
      ],
      "impact": {
        "beforePeriod": {
          "start": "2015-01-01",
          "end": "2019-02-14",
          "meanPM25": 28.5,
          "medianPM25": 25.8,
          "samples": 1489
        },
        "afterPeriod": {
          "start": "2019-02-15",
          "end": "2024-02-15",
          "meanPM25": 24.2,
          "medianPM25": 21.5,
          "samples": 1825
        },
        "analysis": {
          "deltaMean": -4.3,
          "percentChange": -15.1,
          "pValue": 0.012,
          "significant": true,
          "effectSize": "small"
        }
      },
      "timeline": [
        {
          "date": "2019-02-15",
          "event": "Special Act Enacted",
          "pm25": 28.5
        },
        {
          "date": "2024-02-15",
          "event": "5-Year Review",
          "pm25": 24.2
        }
      ]
    }
  ],
  "realTimeData": {
    "lastUpdated": "2025-11-08T12:00:00Z",
    "currentPM25": 45.0,
    "aqi": 125,
    "aqiLevel": "Unhealthy for Sensitive Groups",
    "trend": "improving",
    "majorCities": [
      {
        "name": "Seoul",
        "pm25": 48.5,
        "aqi": 133,
        "aqiLevel": "Unhealthy for Sensitive Groups"
      }
    ]
  },
  "news": [
    {
      "title": "Special Act on Fine Dust",
      "date": "2019-02-15",
      "source": "Korea Legislation Research Institute",
      "url": "https://..."
    }
  ]
}
```

**주요 섹션**:

#### **4-1. 정책 메타데이터**
- `id`, `name`, `implementationDate`: 기본 정보
- `type`: 정책 유형 (Regulation, Comprehensive, Seasonal 등)
- `targetPollutants`: 대상 오염물질
- `measures`: 구체적 조치

#### **4-2. 정책 영향 분석 (Impact)**
```json
"beforePeriod": {        // 정책 시행 전
  "meanPM25": 28.5,      // 평균 PM2.5
  "medianPM25": 25.8,    // 중앙값
  "samples": 1489        // 표본 수
},
"afterPeriod": {         // 정책 시행 후
  "meanPM25": 24.2,
  "medianPM25": 21.5,
  "samples": 1825
},
"analysis": {            // 통계 분석
  "deltaMean": -4.3,     // 평균 변화량
  "percentChange": -15.1, // 변화율 (%)
  "pValue": 0.012,       // p-값 (유의성)
  "significant": true,    // 통계적 유의성
  "effectSize": "small"   // 효과 크기
}
```

#### **4-3. 시계열 데이터 (Timeline)**
```json
"timeline": [
  {
    "date": "2019-02-15",
    "event": "Special Act Enacted",
    "pm25": 28.5
  },
  {
    "date": "2024-02-15",
    "event": "5-Year Review",
    "pm25": 24.2
  }
]
```

#### **4-4. 실시간 데이터 (realTimeData)**
```json
"realTimeData": {
  "currentPM25": 45.0,
  "aqi": 125,
  "aqiLevel": "Unhealthy for Sensitive Groups",
  "trend": "improving",
  "majorCities": [...]
}
```

#### **4-5. 뉴스 (news)**
정책 관련 뉴스 및 연구 논문 링크

---

### 5️⃣ **policies/enhanced-policies.json** (상세 정책 데이터)

**용도**: 정책 시행 전후 비교, 시계열 분석

**구조**:
```json
{
  "policies": [
    {
      "id": "kr-clean-air-2020",
      "country": "South Korea",
      "title": "Fine Dust Seasonal Management System",
      "implementation_date": "2020-12-01",
      "type": "Emission Control",
      "latitude": 37.5665,
      "longitude": 126.9780,
      "effectiveness": "highly_effective",
      "confidence": "High",
      "description": "...",
      "before_data": [
        { "date": "2020-01", "pm25": 45.2 },
        { "date": "2020-02", "pm25": 42.8 }
      ],
      "after_data": [
        { "date": "2021-01", "pm25": 32.4 },
        { "date": "2021-02", "pm25": 30.1 }
      ],
      "timeline": [
        { "date": "2020-12", "pm25": 38.5, "event": "Policy implementation" },
        { "date": "2021-01", "pm25": 32.4, "event": "First month results" }
      ]
    }
  ]
}
```

---

## 📊 데이터 통계

| 파일명 | 파일 수 | 용도 | 크기 |
|--------|--------|------|------|
| policies.json | 1 | 빠른 로드용 정책 목록 | ~10 KB |
| pm25/latest.json | 1 | 실시간 측정소 데이터 | ~5 KB |
| policy-impact/index.json | 1 | 국가별 메타데이터 | ~30 KB |
| policy-impact/*.json | 67 | 국가별 상세 데이터 | ~400 KB |
| policies/enhanced-policies.json | 1 | 상세 정책 시계열 | ~100 KB |

**총 데이터 파일**: 71개
**총 크기**: ~550 KB

---

## 🔄 데이터 로드 흐름

### **Globe 페이지 초기화**

```
1. policies.json 로드
   ↓
2. policy-impact/index.json 로드
   ↓
3. 각 국가별 policy-impact/[country].json 필요시 로드
   ↓
4. pm25/latest.json 로드
   ↓
5. 지구본에 마커 표시
```

### **데이터 업데이트**

- `pm25/latest.json`: 실시간 업데이트 (매시간)
- `policy-impact/*.json`: 주기적 업데이트 (월 단위)
- `policies.json`: 변경시에만 업데이트

---

## ✅ 데이터 포맷 요약

| 데이터 | 포맷 | 특징 |
|--------|------|------|
| 정책 정보 | JSON | 중첩된 계층 구조 |
| PM2.5 측정 | JSON Array | 배열로 여러 측정소 |
| 시계열 데이터 | JSON Array | 시간순 정렬 |
| 통계 분석 | JSON Object | before/after 구조 |
| 메타데이터 | JSON Object | 인덱싱 정보 포함 |

**모든 데이터는 UTF-8 인코딩, ISO 8601 시간 형식 사용**

