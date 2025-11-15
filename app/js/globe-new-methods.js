
  // 🆕 데이터 구독 설정
  setupDataSubscriptions() {
    // 측정소 데이터 변경 감시
    this.globalDataService.subscribe('stations', (stations, type) => {
      console.log(`📍 Stations updated: ${stations.size}`);
      this.updateStationMarkers(stations);
    });

    // 정책 데이터 변경 감시
    this.globalDataService.subscribe('policies', (policies, type) => {
      console.log(`📋 Policies updated: ${policies.size}`);
      this.updatePolicyUI();
    });

    // 선택 국가 변경 감시
    this.globalDataService.subscribe('selectedCountry', (country, type) => {
      console.log(`🌍 Selected country: ${country?.country}`);
      this.displayCountryPolicy(country);
    });
  }

  // 🆕 마커 시스템으로 마커 생성
  createMarkersWithSystem() {
    if (!this.markerSystem || !this.pm25Data) return;

    // PM2.5 마커 생성
    this.pm25Data.forEach((data, city) => {
      const { lat, lon, aqi } = data;
      this.markerSystem.addPM25Marker(
        city,
        lat,
        lon,
        aqi,
        data
      );
    });

    console.log('✅ Created PM2.5 markers with marker system');
  }

  // 🆕 측정소 마커 업데이트
  updateStationMarkers(stations) {
    if (!this.markerSystem) return;

    this.markerSystem.clearPM25Markers();

    stations.forEach((station, id) => {
      this.markerSystem.addPM25Marker(
        id,
        station.lat,
        station.lon,
        station.pm25 || station.aqi || 50,
        station
      );
    });

    console.log('✅ Updated station markers');
  }

  // 🆕 Policy UI 업데이트
  updatePolicyUI() {
    try {
      const stats = this.policyDataService.generateStatistics();

      const countriesEl = document.getElementById('stat-countries');
      const policiesEl = document.getElementById('stat-policies');
      const regionsEl = document.getElementById('stat-regions');

      if (countriesEl) countriesEl.textContent = stats.totalCountries;
      if (policiesEl) policiesEl.textContent = stats.totalPolicies;
      if (regionsEl) regionsEl.textContent = stats.totalRegions;

      console.log('✅ Policy UI updated');
    } catch (error) {
      console.error('❌ Error updating policy UI:', error);
    }
  }

  // 🆕 국가 정책 표시
  displayCountryPolicy(policy) {
    try {
      if (!policy) return;

      const policyCard = document.getElementById('policy-card');
      if (!policyCard) return;

      // 국기 매핑
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

      // PM2.5 데이터 표시
      const stations = Array.from(this.globalDataService.getStations().values())
        .filter(s => s.country?.toLowerCase() === countryName?.toLowerCase());

      if (stations.length > 0) {
        const avgPM25 = stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
        document.getElementById('policy-pm25').textContent = 
          (Math.round(avgPM25 * 10) / 10).toFixed(1);
        document.getElementById('policy-aqi').textContent = this.getAQIStatus(avgPM25);
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

  // 🆕 AQI 상태 텍스트
  getAQIStatus(value) {
    if (value <= 50) return 'Good';
    if (value <= 100) return 'Moderate';
    if (value <= 150) return 'Unhealthy for Sensitive Groups';
    if (value <= 200) return 'Unhealthy';
    if (value <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  // 🆕 Policy 데이터 로드
  async loadPoliciesData() {
    try {
      console.log('📋 Loading policy data...');
      const policies = await this.policyDataService.loadAllPolicies();
      console.log(`✅ Loaded ${policies.size} policies`);
      
      this.updatePolicyUI();
      return policies;
    } catch (error) {
      console.error('❌ Failed to load policies:', error);
      return new Map();
    }
  }
}
