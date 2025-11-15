/**
 * Globe Integration Guide - globe.js에 적용할 통합 코드
 * 
 * 이 파일의 코드를 globe.js의 해당 부분에 적용하세요.
 * 검색 키워드로 위치를 찾을 수 있습니다.
 */

// ============================================
// 파일 상단에 추가 (imports 섹션)
// ============================================

import { globalDataService } from './services/shared-data-service.js';
import { GlobeMarkerSystem } from './services/globe-marker-system.js';
import { policyDataService } from './services/policy-data-service.js';

// ============================================
// PolicyGlobe 클래스 생성자 수정 (약 라인 20-80)
// ============================================

// 기존 constructor에서 이 부분들을 추가하세요:

// 데이터 서비스 통합
this.markerSystem = null; // GlobeMarkerSystem 인스턴스
this.globalDataService = globalDataService;
this.policyDataService = policyDataService;

// 구독: 데이터 변경사항 감시
this.setupDataSubscriptions();

// ============================================
// PolicyGlobe.init() 메서드 수정 (약 라인 100-150)
// ============================================

// 기존 init() 메서드를 이렇게 수정:

async init() {
  try {
    this.createLights();
    this.createStars();
    await this.createRealisticEarth();
    this.createAtmosphere();
    this.createClouds();
    
    // ✅ NEW: 마커 시스템 초기화
    this.markerSystem = new GlobeMarkerSystem(this.earth, this.scene);
    this.markerSystem.init();
    
    this.createParticles();
    this.createCountryBorders();

    // ✅ NEW: 정책 데이터 로드
    await this.loadAllPolicies();
    
    // ✅ NEW: 측정소 데이터 로드
    await this.loadAllStations();

    // ✅ CHANGED: 마커 시스템 사용
    this.createMarkersWithSystem();

    this.setupEventListeners();
    this.setupToggleSwitches();
    this.getUserLocationAndHighlight();

    // ✅ NEW: 정책 UI 업데이트
    this.updatePolicyUI();

    console.log('✅ Globe initialization complete');

    if (typeof window.GlobeIntegration !== 'undefined') {
      try {
        this.globeIntegration = new window.GlobeIntegration(this.scene, this.camera, this);
        await this.globeIntegration.init();
      } catch (error) {
        console.warn('⚠️ Enhanced visualization failed:', error);
      }
    }

    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.style.opacity = '0';
      loadingIndicator.style.transition = 'opacity 0.5s ease-out';
      setTimeout(() => loadingIndicator.remove(), 500);
    }
  } catch (error) {
    console.error('❌ Initialization error:', error);
  }
}

// ============================================
// NEW 메서드: 데이터 구독 설정 (추가)
// ============================================

setupDataSubscriptions() {
  // 측정소 데이터 변경 감시
  this.globalDataService.subscribe('stations', (stations, type) => {
    console.log(`📍 Stations updated: ${stations.size}`);
    this.updateStationMarkers(stations);
  });

  // 정책 데이터 변경 감시
  this.globalDataService.subscribe('policies', (policies, type) => {
    console.log(`📋 Policies updated: ${policies.size}`);
    this.updatePolicyMarkers(policies);
    this.updatePolicyUI();
  });

  // 선택 국가 변경 감시
  this.globalDataService.subscribe('selectedCountry', (country, type) => {
    console.log(`🌍 Selected country: ${country?.country}`);
    this.displayCountryPolicy(country);
  });
}

// ============================================
// NEW 메서드: 마커 시스템으로 마커 생성 (추가)
// ============================================

createMarkersWithSystem() {
  if (!this.markerSystem) return;

  // PM2.5 마커 생성
  const stations = this.globalDataService.getStations();
  stations.forEach((station, id) => {
    this.markerSystem.addPM25Marker(
      id,
      station.lat,
      station.lon,
      station.pm25,
      station
    );
  });

  // 정책 마커 생성
  const policies = this.globalDataService.getPolicies();
  const countryCapitals = {
    'South Korea': { lat: 37.5665, lon: 126.9780 },
    'China': { lat: 39.9042, lon: 116.4074 },
    'Japan': { lat: 35.6762, lon: 139.6503 },
    'India': { lat: 28.6139, lon: 77.2090 },
    'Bangladesh': { lat: 23.8103, lon: 90.4125 },
    'United States': { lat: 38.9072, lon: -77.0369 },
    'United Kingdom': { lat: 51.5074, lon: -0.1278 },
    'Germany': { lat: 52.5200, lon: 13.4050 }
  };

  policies.forEach((policy, country) => {
    const coords = countryCapitals[country];
    if (coords) {
      this.markerSystem.addPolicyMarker(
        country,
        coords.lat,
        coords.lon,
        policy.status || 'Effective',
        policy
      );
    }
  });
}

// ============================================
// NEW 메서드: 정책 데이터 로드 (추가)
// ============================================

async loadAllPolicies() {
  try {
    console.log('📋 Loading policies...');
    const policies = await this.policyDataService.loadAllPolicies();
    console.log(`✅ Loaded ${policies.size} policies`);
  } catch (error) {
    console.error('❌ Failed to load policies:', error);
  }
}

// ============================================
// NEW 메서드: 측정소 데이터 로드 (추가)
// ============================================

async loadAllStations() {
  try {
    console.log('📍 Loading stations...');
    // 여기서 WAQI 또는 다른 API에서 데이터 로드
    // 기존 this.loadPM25Data()를 호출하거나 개선
    await this.loadPM25Data();
  } catch (error) {
    console.error('❌ Failed to load stations:', error);
  }
}

// ============================================
// NEW 메서드: 측정소 마커 업데이트 (추가)
// ============================================

updateStationMarkers(stations) {
  if (!this.markerSystem) return;

  // 기존 PM2.5 마커 제거
  this.markerSystem.clearPM25Markers();

  // 새 마커 추가
  stations.forEach((station, id) => {
    this.markerSystem.addPM25Marker(
      id,
      station.lat,
      station.lon,
      station.pm25,
      station
    );
  });
}

// ============================================
// NEW 메서드: 정책 마커 업데이트 (추가)
// ============================================

updatePolicyMarkers(policies) {
  if (!this.markerSystem) return;

  this.markerSystem.clearPolicyMarkers();

  const countryCapitals = {
    'South Korea': { lat: 37.5665, lon: 126.9780 },
    'China': { lat: 39.9042, lon: 116.4074 },
    'Japan': { lat: 35.6762, lon: 139.6503 },
    'India': { lat: 28.6139, lon: 77.2090 },
    'Bangladesh': { lat: 23.8103, lon: 90.4125 },
    'United States': { lat: 38.9072, lon: -77.0369 },
    'United Kingdom': { lat: 51.5074, lon: -0.1278 },
    'Germany': { lat: 52.5200, lon: 13.4050 }
  };

  policies.forEach((policy, country) => {
    const coords = countryCapitals[country];
    if (coords) {
      this.markerSystem.addPolicyMarker(
        country,
        coords.lat,
        coords.lon,
        policy.status || 'Effective',
        policy
      );
    }
  });
}

// ============================================
// NEW 메서드: Policy UI 업데이트 (추가)
// ============================================

async updatePolicyUI() {
  try {
    // 통계 데이터 생성
    const stats = this.policyDataService.generateStatistics();
    
    // UI 업데이트
    document.getElementById('stat-countries').textContent = stats.totalCountries;
    document.getElementById('stat-policies').textContent = stats.totalPolicies;
    document.getElementById('stat-regions').textContent = stats.totalRegions;
    
  } catch (error) {
    console.error('❌ Error updating policy UI:', error);
  }
}

// ============================================
// NEW 메서드: 국가 정책 표시 (추가)
// ============================================

displayCountryPolicy(policy) {
  try {
    if (!policy) return;

    const policyCard = document.getElementById('policy-card');
    if (!policyCard) return;

    // 국기 이모지 매핑 (또는 데이터에서 가져오기)
    const flags = {
      'South Korea': '🇰🇷',
      'China': '🇨🇳',
      'Japan': '🇯🇵',
      'India': '🇮🇳',
      'Bangladesh': '🇧🇩',
      'United States': '🇺🇸',
      'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪'
    };

    // UI 업데이트
    document.getElementById('policy-flag').textContent = flags[policy.country] || '🌍';
    document.getElementById('policy-country').textContent = policy.country || 'Unknown';
    document.getElementById('policy-region').textContent = policy.region || '';
    document.getElementById('policy-name').textContent = policy.title || 'No title';
    document.getElementById('policy-desc').textContent = policy.description || 'No description';
    document.getElementById('policy-date').textContent = 
      new Date(policy.implementationYear, 0).toLocaleDateString();
    
    // PM2.5 데이터 표시
    const stations = Array.from(this.globalDataService.getStations().values())
      .filter(s => s.country?.toLowerCase() === policy.country?.toLowerCase());
    
    if (stations.length > 0) {
      const avgPM25 = stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
      document.getElementById('policy-pm25').textContent = Math.round(avgPM25 * 10) / 10;
      document.getElementById('policy-aqi').textContent = this.getAQIStatus(avgPM25);
    }

    policyCard.style.display = 'block';
  } catch (error) {
    console.error('❌ Error displaying country policy:', error);
  }
}

// ============================================
// NEW 메서드: 마커 애니메이션 업데이트 (추가)
// ============================================

// animate() 메서드의 마지막에 이 코드 추가:

animateMarkers() {
  if (this.markerSystem) {
    this.markerSystem.update(this.clock.getDelta());
  }
}

// 기존 animate() 메서드 내부에 추가:
// this.animateMarkers(); // 다른 애니메이션 코드 다음에

// ============================================
// 기존 메서드: setupToggleSwitches() 수정
// ============================================

// setupToggleSwitches() 메서드에서 토글 스위치 처리 시:

// PM2.5 토글
document.getElementById('toggle-pm25').addEventListener('change', (e) => {
  if (this.markerSystem) {
    this.markerSystem.setMarkerGroupVisibility('pm25', e.target.checked);
  }
});

// Borders 토글
document.getElementById('toggle-borders').addEventListener('change', (e) => {
  if (this.countryBorders) {
    this.countryBorders.visible = e.target.checked;
  }
});

// Flow/Particles 토글
document.getElementById('toggle-particles').addEventListener('change', (e) => {
  if (this.particles) {
    this.particles.visible = e.target.checked;
  }
});

// ============================================
// 마커 클릭 이벤트 처리 (기존 코드 수정)
// ============================================

// onCanvasClick() 또는 similar 메서드에서:

onCanvasClick(event) {
  const rect = this.canvas.getBoundingClientRect();
  this.mouse.x = ((event.clientX - rect.left) / window.innerWidth) * 2 - 1;
  this.mouse.y = -((event.clientY - rect.top) / window.innerHeight) * 2 + 1;

  this.raycaster.setFromCamera(this.mouse, this.camera);

  // 마커 레이캐스팅
  const markersToTest = [
    ...this.markerSystem.markerGroups.pm25.children,
    ...this.markerSystem.markerGroups.policies.children
  ];

  const intersects = this.raycaster.intersectObjects(markersToTest);

  if (intersects.length > 0) {
    const clicked = intersects[0].object;
    const markerData = clicked.userData;

    if (markerData.type === 'policy') {
      // 정책 마커 클릭
      const policy = this.globalDataService.getPoliciesByCountry(markerData.id);
      this.globalDataService.setSelectedCountry(policy);
    } else if (markerData.type === 'pm25') {
      // PM2.5 측정소 클릭
      console.log('📍 Station clicked:', markerData.data);
    }
  }
}

// ============================================
// 실시간 데이터 새로고침 (기존 코드 개선)
// ============================================

// 새로고침 버튼 핸들러:

document.getElementById('refresh-data').addEventListener('click', async () => {
  const button = document.getElementById('refresh-data');
  const icon = document.getElementById('refresh-icon');
  
  button.disabled = true;
  icon.classList.add('animate-spin');
  
  try {
    // 데이터 새로고침
    await this.loadAllStations();
    await this.loadAllPolicies();
    
    // UI 업데이트
    document.getElementById('last-update').textContent = 
      'Updated: ' + new Date().toLocaleTimeString();
    
    console.log('✅ Data refreshed');
  } catch (error) {
    console.error('❌ Refresh failed:', error);
  } finally {
    button.disabled = false;
    icon.classList.remove('animate-spin');
  }
}

// ============================================
// 정책 데이터 필터링 (새로운 기능)
// ============================================

setupPolicyFilters() {
  // 지역 필터
  document.getElementById('filter-region').addEventListener('click', () => {
    const policies = this.policyDataService.getPoliciesByCategory('region');
    console.log('Filtered by region:', policies);
  });

  // 유형 필터
  document.getElementById('filter-policy').addEventListener('click', () => {
    const byEffectiveness = this.policyDataService.getPoliciesByEffectiveness();
    console.log('Sorted by effectiveness:', byEffectiveness);
  });

  // 검색 필터
  document.getElementById('country-search').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const policies = Array.from(this.globalDataService.getPolicies().values())
      .filter(p => p.country?.toLowerCase().includes(searchTerm));
    console.log('Search results:', policies);
  });
}

// ============================================
// animate() 루프에 추가할 코드
// ============================================

// animate() 메서드 내부 (this.controls.update() 다음):

// 마커 애니메이션 업데이트
if (this.markerSystem) {
  this.markerSystem.update(this.clock.getDelta());
}

// render() 호출 전
