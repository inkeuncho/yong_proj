/**
 * Policy Markers Integration Guide for globe.js
 * 
 * 이 파일은 globe.js의 displayCountryPolicy 메서드와
 * PolicyMarkersManager를 연동하기 위한 지침을 제공합니다.
 */

// ============================================
// 1️⃣ globe.js의 displayCountryPolicy 메서드 개선
// ============================================

// 원본 메서드 (globe.js에서 찾기)
// displayCountryPolicy(country) { ... }

// 개선된 버전 (아래 코드로 대체)
/*
displayCountryPolicy(policy) {
    try {
        if (!policy) return;

        const policyCard = document.getElementById('policy-card');
        if (!policyCard) return;

        // 국기 매핑
        const flags = {
            'South Korea': '🇰🇷',
            'North Korea': '🇰🇵',
            'China': '🇨🇳',
            'Japan': '🇯🇵',
            'India': '🇮🇳',
            'Bangladesh': '🇧🇩',
            'United States': '🇺🇸',
            'United Kingdom': '🇬🇧',
            'Germany': '🇩🇪',
            'France': '🇫🇷',
            'Russia': '🇷🇺',
            'Australia': '🇦🇺',
            'Brazil': '🇧🇷',
        };

        const countryName = policy.country || policy.name;
        document.getElementById('policy-flag').textContent = flags[countryName] || '🌍';
        document.getElementById('policy-country').textContent = countryName;
        document.getElementById('policy-region').textContent = policy.region || policy.area || '';
        document.getElementById('policy-name').textContent = policy.title || 'Policy Title';
        document.getElementById('policy-desc').textContent = policy.description || 'No description available';

        const date = policy.implementationYear 
            ? new Date(policy.implementationYear, 0).toLocaleDateString()
            : 'Date not available';
        document.getElementById('policy-date').textContent = date;

        // ✨ Policy 마커 시스템과 연동
        if (window.policyMarkersManager) {
            window.policyMarkersManager.selectMarker(
                window.policyMarkersManager.markers.get(countryName)?.marker,
                policy
            );
        }

        // PM2.5 데이터 표시
        const stations = Array.from(this.globalDataService.getStations().values())
            .filter(s => s.country?.toLowerCase() === countryName?.toLowerCase());

        if (stations.length > 0) {
            const avgPM25 = stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
            document.getElementById('policy-pm25').textContent = 
                (Math.round(avgPM25 * 10) / 10).toFixed(1);
            document.getElementById('policy-aqi').textContent = this.getAQIStatus(avgPM25);
            
            const pm25Element = document.getElementById('policy-pm25');
            if (pm25Element) {
                pm25Element.style.color = this.getPM25StatusColor(avgPM25);
            }
        } else {
            document.getElementById('policy-pm25').textContent = '-';
            document.getElementById('policy-aqi').textContent = '-';
        }

        policyCard.style.display = 'block';
        policyCard.classList.add('show');
    } catch (error) {
        console.error('❌ Error displaying country policy:', error);
    }
}
*/

// ============================================
// 2️⃣ main.js에서 정책 데이터 로드 후 마커 초기화
// ============================================

/*
// main.js에서 정책 데이터 로드하는 부분 찾기
// 다음 코드를 그 다음에 추가:

async function initializePolicies() {
    try {
        // 1. 정책 데이터 로드
        const response = await fetch('./data/policies.json');
        const policies = await response.json();
        
        // 2. Policy Markers Manager에 마커 렌더링
        if (window.policyMarkersManager && policies.length > 0) {
            window.policyMarkersManager.renderMarkers(policies, (policy) => {
                // 마커 클릭 시 콜백
                if (window.globeInstance && window.globeInstance.displayCountryPolicy) {
                    window.globeInstance.displayCountryPolicy(policy);
                }
            });
            console.log(`✅ Rendered ${policies.length} policy markers`);
        }
    } catch (error) {
        console.error('❌ Failed to initialize policies:', error);
    }
}

// globe.js 로드 완료 후 호출
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initializePolicies();
    }, 2000);
});
*/

// ============================================
// 3️⃣ 마커 위치 업데이트 (3D → 2D 투영)
// ============================================

/*
// globe.js의 render/animate 루프에서
// (약 100ms마다) 다음 코드 추가:

if (window.policyMarkersManager) {
    window.policyMarkersManager.updateAllMarkerPositions();
}

// 예를 들어, Three.js 렌더 루프에서:
animate() {
    requestAnimationFrame(() => this.animate());
    
    // 글로브 렌더링
    this.renderer.render(this.scene, this.camera);
    
    // ✨ 마커 위치 업데이트 추가
    if (window.policyMarkersManager) {
        window.policyMarkersManager.updateAllMarkerPositions();
    }
}
*/

// ============================================
// 4️⃣ 검색/필터 기능 연동
// ============================================

/*
// country-search input의 change 이벤트에서:

document.getElementById('country-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    
    if (window.policyMarkersManager) {
        if (searchTerm.length > 0) {
            window.policyMarkersManager.filterMarkers(searchTerm);
        } else {
            window.policyMarkersManager.showAllMarkers();
        }
    }
});
*/

// ============================================
// 5️⃣ 레이어 토글 연동
// ============================================

/*
// 정책 레이어 토글 체크박스:

document.getElementById('toggle-policies').addEventListener('change', (e) => {
    if (window.policyMarkersManager) {
        window.policyMarkersManager.toggleMarkerVisibility(e.target.checked);
    }
});
*/

// ============================================
// 6️⃣ 마커 클릭 해제 (패널 닫힐 때)
// ============================================

/*
// globe.html의 closePolicyCard() 함수는 이미 수정됨:

function closePolicyCard() {
    const card = document.getElementById('policy-card');
    card.classList.remove('show');
    setTimeout(() => {
        card.style.display = 'none';
    }, 300);
    
    // ✨ 마커 선택 해제
    if (window.policyMarkersManager) {
        window.policyMarkersManager.deselectMarker();
    }
}
*/

// ============================================
// 정책 데이터 예시 (policies.json)
// ============================================

/*
[
    {
        "id": "kr_pm25_reduction",
        "country": "South Korea",
        "latitude": 37.5665,
        "longitude": 126.9780,
        "title": "PM2.5 Reduction Policy",
        "description": "National air quality improvement plan focusing on reducing fine dust.",
        "region": "East Asia",
        "implementationYear": 2015,
        "status": "Effective",
        "effectiveness": 75
    },
    {
        "id": "cn_air_quality",
        "country": "China",
        "latitude": 39.9042,
        "longitude": 116.4074,
        "title": "Air Quality Improvement Action Plan",
        "description": "Major initiative to reduce air pollution in key regions.",
        "region": "East Asia",
        "implementationYear": 2013,
        "status": "Highly Effective",
        "effectiveness": 65
    }
    // ... 더 많은 정책
]
*/

// ============================================
// 테스트 체크리스트
// ============================================

/*
✅ PolicyMarkersManager 초기화 확인
   - window.policyMarkersManager 존재
   - 마커 컨테이너 생성됨

✅ 마커 렌더링 확인
   - 마커가 글로브 위에 표시됨
   - 정확한 위치에 표시됨

✅ 마커 인터랙션 확인
   - 마커 호버시 확대
   - 마커 클릭시 패널 열림
   - 패널 닫을 때 마커 선택 해제

✅ 검색/필터 기능 확인
   - 검색어 입력시 마커 필터링
   - 검색 해제시 모든 마커 표시

✅ 레이어 토글 확인
   - "Policies" 체크박스로 마커 표시/숨김

✅ 모바일 반응형 확인
   - 터치 대상 크기 적절 (44px 이상)
   - 마커 크기 모바일에 맞음
*/

export const INTEGRATION_GUIDE = {
    version: '1.0',
    lastUpdated: '2025-11-15',
    status: 'Ready for integration',
    notes: [
        '1. PolicyMarkersManager는 globe.html에서 자동 로드됨',
        '2. globe.js의 displayCountryPolicy() 메서드 수정 필요',
        '3. main.js에서 initializePolicies() 호출 필요',
        '4. 3D→2D 투영은 globe.js의 camera/renderer와 연동 필요'
    ]
};
