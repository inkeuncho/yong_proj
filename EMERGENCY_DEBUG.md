# 🚨 긴급 문제 진단 가이드

## 진단 1: 브라우저 콘솔에서 실행

```javascript
// 1. 마커 시스템 확인
console.log('=== 마커 시스템 상태 ===');
console.log('globe:', globe);
console.log('markerSystem:', globe?.markerSystem);
console.log('PM2.5 마커 개수:', globe?.markerSystem?.pm25Markers?.size || 0);
console.log('정책 마커 개수:', globe?.markerSystem?.policyMarkers?.size || 0);

// 2. 그룹 확인
console.log('\n=== 마커 그룹 상태 ===');
console.log('PM2.5 Group children:', globe?.markerSystem?.markerGroups?.pm25?.children?.length || 0);
console.log('Policy Group children:', globe?.markerSystem?.markerGroups?.policies?.children?.length || 0);

// 3. 가시성 확인
console.log('\n=== 가시성 상태 ===');
console.log('PM2.5 visible?', globe?.markerSystem?.markerGroups?.pm25?.visible);
console.log('Policies visible?', globe?.markerSystem?.markerGroups?.policies?.visible);

// 4. 데이터 확인
console.log('\n=== 데이터 상태 ===');
console.log('PM2.5 Data 개수:', globe?.pm25Data?.size || 0);
console.log('첫 번째 PM2.5 데이터:', globe?.pm25Data?.entries().next().value);
```

## 진단 2: 네트워크 탭 확인

- **Network 탭에서 확인할 사항:**
  1. WAQI API 호출 - 응답 시간 확인
  2. JSON 파일 로드 - 크기 확인
  3. 로딩 폭포 보기 - 어디서 시간 걸리는지 확인

## 진단 3: 콘솔 에러 확인

F12 → Console 탭에서:
- ❌ "Cannot read property" 에러
- ❌ "undefined" 에러  
- ❌ API 실패 메시지

---

## 🔧 빠른 해결 방법

### 문제: 로딩 느림 (WAQI API)
**원인**: 300개 지역을 순차적으로 조회 (300 × 500ms = 150초+)

**해결**: 병렬 처리로 변경 (동시 10개씩)

### 문제: 마커 안 보임
**원인 1**: enhanced-marker-system에서 마커가 scene에 추가되지 않음
**원인 2**: 마커 생성 데이터가 잘못됨
**원인 3**: 마커 가시성이 false로 설정됨

---

## 다음 단계

1. 위의 브라우저 콘솔 명령어 실행
2. 결과 제공
3. 문제 원인에 따라 코드 수정

**콘솔 출력 결과를 알려주세요!**
