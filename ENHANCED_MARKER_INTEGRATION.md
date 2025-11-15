# 🎨 Enhanced Marker System 통합 가이드

**작성일:** 2025-11-14  
**상태:** 🆕 새로운 시각화 시스템  
**목표:** 정책 마커를 주요 포커스, PM2.5 마커를 배경으로 표현

---

## 📋 개요

이전의 단순한 마커 시스템에서 향상된 시각화로 전환합니다.

### 변경 전 (Before)
```
정책 마커: 기본 구체 (크기 0.03)
        └─ 1개 요소 (메인 구체)

PM2.5 마커: 기본 구체 (크기 0.02)
          └─ 1개 요소 (메인 구체)

구분: ❌ 명확하지 않음
```

### 변경 후 (After)
```
정책 마커: 🌟 화려한 팔각형 (크기 0.075)
        ├─ 1️⃣ 팔각형 메인 (회전 + 스케일 변화)
        ├─ 2️⃣ 회전 헤일로 (빠른 회전)
        ├─ 3️⃣ 펄싱 아우라 (호흡 효과)
        ├─ 4️⃣ 국가 라벨 (텍스트)
        └─ 5️⃣ 효과도 바 (진행 상태)

PM2.5 마커: 💫 미니 마커 (크기 0.01)
          ├─ 메인 구체 (반투명)
          └─ 펄싱 링 (부드러운 애니메이션)

구분: ✅ 분명함 (크기 7배 차이)
```

---

## 🔧 Step 1: 마커 시스템 교체

### A. enhanced-marker-system.js 생성

**파일:** `app/js/services/enhanced-marker-system.js` ✅ 완료

생성된 파일 내용:
- `EnhancedMarkerSystem` 클래스
- PM2.5 마커 생성 로직
- 정책 마커 생성 로직 (5개 요소)
- 애니메이션 업데이트 로직

### B. globe.js에서 Import 변경

**변경 위치:** `app/js/globe.js` 상단 (약 10줄)

```javascript
// ❌ 이전
import { GlobeMarkerSystem } from './services/globe-marker-system.js';

// ✅ 새로운 것 추가
import { EnhancedMarkerSystem } from './services/enhanced-marker-system.js';
```

---

## 🔄 Step 2: 마커 시스템 초기화 변경

### 위치: `globe.js` 생성자 (약 80-90줄)

**변경 전:**
```javascript
// 🆕 Data Services Integration
this.markerSystem = null;

// init() 메서드에서
this.markerSystem = new GlobeMarkerSystem(this.earth, this.scene);
```

**변경 후:**
```javascript
// 🆕 Enhanced Marker System
this.markerSystem = null;

// init() 메서드에서
this.markerSystem = new EnhancedMarkerSystem(this.scene, this.earth);
```

---

## 📊 Step 3: 마커 생성 메서드 수정

### A. PM2.5 마커 생성

**위치:** `globe.js`의 `createPM25Markers()` 또는 해당 메서드

**변경:**
```javascript
// 기존
stations.forEach(station => {
  // 마커 생성 로직
});

// 새로운 것
stations.forEach(station => {
  this.markerSystem.createPM25Marker({
    id: station.id,
    latitude: station.latitude,
    longitude: station.longitude,
    pm25: station.pm25,
    country: station.country
  });
});
```

### B. 정책 마커 생성

**새로운 메서드 추가:**
```javascript
createPolicyMarkers(policies) {
  policies.forEach(policy => {
    this.markerSystem.createPolicyMarker({
      country: policy.country,
      latitude: policy.latitude || 0,
      longitude: policy.longitude || 0,
      effectivenessScore: policy.effectivenessScore || 0.5,
      title: policy.title,
      description: policy.description
    });
  });
}
```

---

## 🎬 Step 4: 애니메이션 루프 업데이트

### 위치: `globe.js`의 `animate()` 메서드

**변경 전:**
```javascript
animate() {
  // ... 기존 코드
  // 마커 애니메이션이 없거나 간단함
}
```

**변경 후:**
```javascript
animate() {
  // ... 기존 코드
  const deltaTime = this.clock.getDelta();
  
  // ✨ 마커 애니메이션 업데이트
  if (this.markerSystem) {
    this.markerSystem.updateAll(deltaTime);
  }
  
  // ... 나머지 코드
}
```

---

## 📍 Step 5: Policy 마커 표시/숨김

### 위치: `globe.js`의 토글 이벤트 핸들러

**추가할 토글:**
```javascript
// Policy 마커 표시/숨김
document.getElementById('toggle-policies')?.addEventListener('change', (e) => {
  if (this.markerSystem) {
    this.markerSystem.markerGroups.policies.visible = e.target.checked;
  }
});

// PM2.5 마커 표시/숨김
document.getElementById('toggle-pm25')?.addEventListener('change', (e) => {
  if (this.markerSystem) {
    this.markerSystem.markerGroups.pm25.visible = e.target.checked;
  }
});
```

---

## 🎯 Step 6: Policy 마커 클릭 이벤트

### 위치: 마우스 이벤트 핸들러

```javascript
onMouseClick(event) {
  // 레이캐스팅 로직...
  const intersects = this.raycaster.intersectObject(this.markerSystem.markerGroups.policies);
  
  if (intersects.length > 0) {
    const clickedMarker = intersects[0].object;
    
    // 정책 마커가 클릭된 경우
    if (clickedMarker.userData?.type === 'policy') {
      const country = clickedMarker.userData.country;
      this.onPolicyMarkerClicked(country);
    }
  }
}

onPolicyMarkerClicked(country) {
  // Policy Explorer 패널 업데이트
  const marker = this.markerSystem.policyMarkers.get(country);
  if (marker) {
    this.displayCountryPolicy(marker.data);
  }
}
```

---

## 🔍 Step 7: HTML/CSS 업데이트

### Policy 마커 토글 스위치 추가

**위치:** `globe.html` 약 740줄 (Layers 섹션)

```html
<!-- Policy Markers -->
<label class="flex items-center gap-1.5 bg-transparent px-1.5 min-h-[32px] py-0.5 justify-between cursor-pointer hover:bg-white/5 rounded-lg transition-colors">
  <div class="flex items-center gap-1.5">
    <div class="text-white flex items-center justify-center rounded-lg bg-black/20 shrink-0 size-6">
      <span class="material-symbols-outlined !text-sm">policy</span>
    </div>
    <div class="flex flex-col justify-center">
      <p class="text-white text-[10px] font-medium leading-tight line-clamp-1">Policies</p>
    </div>
  </div>
  <div class="shrink-0">
    <div class="toggle-switch checked" id="toggle-policies-switch" style="width: 32px; height: 18px;">
      <input type="checkbox" id="toggle-policies" checked>
      <div class="toggle-knob" style="width: 14px; height: 14px;"></div>
    </div>
  </div>
</label>
```

---

## ✨ 시각적 차이점

### 마커 크기 비교

```
정책 마커:     ████████████ (0.075 반지름)
             
PM2.5 마커:    █ (0.01 반지름)
             
크기 비교:    정책이 PM2.5보다 7.5배 큼
```

### 애니메이션 특성

| 항목 | PM2.5 | 정책 |
|------|-------|------|
| **회전 속도** | 느림 (0.5x) | 빠름 (1.5x) |
| **호흡 효과** | 부드러움 | 화려함 |
| **아우라** | 없음 | 있음 |
| **라벨** | 없음 | 국가코드 |
| **효과도** | 없음 | 진행 바 |
| **메인 도형** | 구체 | 팔각형 |
| **초점** | 배경 정보 | 주요 포커스 |

---

## 🧪 테스트 체크리스트

### ✓ 마커 렌더링
- [ ] PM2.5 마커들이 작고 반투명하게 표시되는가?
- [ ] 정책 마커들이 크고 화려하게 표시되는가?
- [ ] 모든 마커들이 지구 표면에 올바르게 위치하는가?

### ✓ 애니메이션
- [ ] PM2.5 마커의 펄싱 링이 부드럽게 움직이는가?
- [ ] 정책 마커의 헤일로가 빠르게 회전하는가?
- [ ] 정책 마커의 아우라가 호흡하는 것 같은가?

### ✓ 상호작용
- [ ] 정책 마커를 클릭하면 Policy Explorer가 업데이트되는가?
- [ ] Policy 토글을 켜고 끄면 마커가 나타났다 사라지는가?
- [ ] PM2.5 토글을 켜고 끄면 마커가 나타났다 사라지는가?

### ✓ 성능
- [ ] 프레임율이 60 FPS에서 유지되는가?
- [ ] 메모리 사용이 합리적인 범위 내인가?
- [ ] 지구본 회전이 부드러운가?

---

## 🎨 색상 체계

### PM2.5 마커 (AQI 기반)
```
PM2.5 ≤ 50   → 🟢 #00e400 (Good)
PM2.5 ≤ 100  → 🟡 #ffff00 (Moderate)
PM2.5 ≤ 150  → 🟠 #ff7e00 (Unhealthy)
PM2.5 ≤ 200  → 🔴 #ff0000 (Very Unhealthy)
PM2.5 > 200  → 🟣 #8f3f97 (Hazardous)
```

### 정책 마커 (효과도 기반)
```
효과도 ≥ 0.8  → 🟢 #00ff88 (Exemplary)
효과도 ≥ 0.6  → 🟢 #00ff44 (Highly Effective)
효과도 ≥ 0.4  → 🟢 #44ff00 (Effective)
효과도 ≥ 0.2  → 🟡 #ffdd00 (Partial Progress)
효과도 < 0.2  → 🟠 #ff8800 (Limited Progress)
```

---

## 🚀 통합 순서

1. ✅ `enhanced-marker-system.js` 생성
2. ⏳ globe.js import 추가
3. ⏳ 마커 시스템 초기화 변경
4. ⏳ 마커 생성 메서드 수정
5. ⏳ animate() 루프 업데이트
6. ⏳ 토글 이벤트 추가
7. ⏳ 클릭 이벤트 핸들러 구현
8. ⏳ HTML/CSS 업데이트
9. ⏳ 브라우저 테스트

---

## 📞 문제 해결

### 마커가 안 보임
```javascript
// 콘솔에서 확인
console.log('PM2.5 마커:', globe.markerSystem.pm25Markers.size);
console.log('정책 마커:', globe.markerSystem.policyMarkers.size);
```

### 애니메이션이 안 됨
```javascript
// animate() 루프에서 updateAll() 호출 확인
console.log('Delta time:', deltaTime);
```

### 마커가 지구에 고정되지 않음
```javascript
// latLonToPosition() 계산 확인
// quaternion 설정 확인
```

---

## 📈 성능 최적화

### 마커 개수 제한
```javascript
// 메모리 절약을 위해 표시 마커 제한
const MAX_MARKERS = 500;
if (this.markerSystem.pm25Markers.size > MAX_MARKERS) {
  // 거리 기반 필터링
}
```

### LOD (Level of Detail)
```javascript
// 줌 레벨에 따라 상세도 조절
if (distance > 3) {
  // PM2.5 마커 숨김
} else {
  // 모든 마커 표시
}
```

---

**다음 단계:** globe.js 수정 후 테스트!

