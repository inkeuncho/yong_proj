# 🧪 로컬 테스트 가이드

## Step 1: 로컬 서버 시작

```bash
# 터미널 열기
cd "/Volumes/WD_BLACK SN770M 2TB/My_proj/Finedust_proj"

# Python 서버 시작
python3 -m http.server 8000

# 출력:
# Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

## Step 2: 브라우저에서 테스트

```
URL: http://localhost:8000/app/globe.html
```

## Step 3: 브라우저 콘솔 확인 (F12 → Console)

### 정상 작동 신호:
```
✅ Policy Globe initialized
✅ Enhanced Mode: Loaded XXX real-time monitoring stations from WAQI!
✅ Created policy markers
✅ Enhanced visualization ready
✅ Marker System updateAll() 호출됨 (계속 반복)
```

### 에러 신호 (있으면 안됨):
```
❌ createPM25Markers is not a function
❌ createCountryPolicyMarkers is not a function
❌ animatePolicyMarkers is not a function
❌ getAQIColor is not defined
```

## Step 4: 시각적 테스트

1. **글로브 렌더링**: 지구본이 보이는가?
2. **마커 표시**: 
   - PM2.5 마커 (작은 점들) - 보일까?
   - 정책 마커 (큰 팔각형) - 보일까?
3. **애니메이션**: 마커들이 움직이는가?
4. **인터랙션**: 마우스로 드래그하면 회전하는가?
5. **성능**: 부드럽게 돌아가는가? (60 FPS)

## Step 5: 네트워크 탭 확인

- WAQI API 호출: 성공했는가?
- 데이터 로드 완료: 측정소 데이터 받았는가?
- 정책 데이터: JSON 파일들 로드되었는가?

## Step 6: 마커 테스트

```javascript
// 브라우저 콘솔에서 다음 명령어 실행:

// 1. 마커 시스템 확인
console.log('PM2.5 마커:', globe.markerSystem.pm25Markers.size);
console.log('정책 마커:', globe.markerSystem.policyMarkers.size);

// 2. 마커 그룹 확인
console.log('PM2.5 그룹:', globe.markerSystem.markerGroups.pm25);
console.log('정책 그룹:', globe.markerSystem.markerGroups.policies);

// 3. 가시성 확인
console.log('PM2.5 보임?', globe.markerSystem.markerGroups.pm25.visible);
console.log('정책 보임?', globe.markerSystem.markerGroups.policies.visible);
```

## ✅ 테스트 체크리스트

- [ ] 서버 시작 성공
- [ ] URL 접속 성공
- [ ] 콘솔 에러 없음
- [ ] 글로브 렌더링됨
- [ ] PM2.5 마커 보임
- [ ] 정책 마커 보임
- [ ] 애니메이션 동작
- [ ] 마우스 인터랙션 동작
- [ ] 성능 부드러움 (60 FPS)
- [ ] 데이터 로드 완료

## 🚨 문제 해결

### "마커가 안 보인다"
```javascript
// 확인:
console.log(globe.markerSystem);
console.log(globe.earth);

// 해결:
- 콘솔 에러 확인
- 캐시 초기화 (Ctrl+Shift+Delete)
- 페이지 새로고침
```

### "메모리 누수"
```javascript
// 확인:
- Chrome DevTools → Memory 탭
- 메모리 사용량 증가 확인

// 해결:
- globe.js 파일 재검토
- 이벤트 리스너 해제 확인
```

### "성능 저하"
```javascript
// 확인:
- FPS 확인 (F12 → Rendering 탭)
- 마커 개수 확인

// 해결:
- marker LOD (Level of Detail) 검토
- 마커 개수 제한
- 렌더링 최적화
```

## 📝 테스트 결과 기록

```
테스트 날짜: ___________
테스트자: ___________

결과:
[  ] 성공
[  ] 실패
[  ] 부분 성공

에러:
_______________________________________

해결 방법:
_______________________________________
```

---

**이 테스트가 모두 성공하면 배포 준비 완료! 🚀**
