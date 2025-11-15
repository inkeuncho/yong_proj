/**
 * Enhanced Global Data Integration Service
 * 모든 페이지 간 실시간 데이터 동기화 및 최적화
 */

export class EnhancedDataIntegrationService {
  constructor() {
    // 중앙 데이터 저장소
    this.centralStore = {
      stations: new Map(),
      policies: new Map(),
      comparisons: new Map(),
      userPreferences: {},
      cache: new Map()
    };
    
    // WebWorker를 활용한 백그라운드 처리
    this.worker = null;
    
    // 실시간 업데이트 설정
    this.updateInterval = 30000; // 30초마다 업데이트
    this.updateTimer = null;
    
    // 이벤트 이미터 (페이지 간 통신)
    this.events = new EventTarget();
    
    // LocalStorage를 활용한 영구 캐시
    this.storageKey = 'airlens_data_cache';
    
    // 성능 모니터링
    this.performanceMetrics = {
      dataFetchTime: 0,
      renderTime: 0,
      cacheHitRate: 0
    };
    
    this.init();
  }

  /**
   * 초기화
   */
  async init() {
    // LocalStorage에서 캐시된 데이터 로드
    this.loadCachedData();
    
    // WebWorker 초기화 (백그라운드 데이터 처리용)
    this.initWebWorker();
    
    // BroadcastChannel을 통한 탭 간 통신
    this.initBroadcastChannel();
    
    // 초기 데이터 로드
    await this.loadInitialData();
    
    // 자동 업데이트 시작
    this.startAutoUpdate();
    
    console.log('✅ Enhanced Data Integration Service initialized');
  }

  /**
   * WebWorker 초기화
   */
  initWebWorker() {
    const workerCode = `
      self.addEventListener('message', async function(e) {
        const { type, data } = e.data;
        
        switch(type) {
          case 'PROCESS_PM25_DATA':
            const processed = processPM25Data(data);
            self.postMessage({ type: 'PM25_PROCESSED', data: processed });
            break;
            
          case 'CALCULATE_POLICY_IMPACT':
            const impact = calculatePolicyImpact(data);
            self.postMessage({ type: 'IMPACT_CALCULATED', data: impact });
            break;
        }
      });
      
      function processPM25Data(stations) {
        // 데이터 처리 로직
        return stations.map(station => ({
          ...station,
          category: getPM25Category(station.pm25),
          healthRisk: calculateHealthRisk(station.pm25)
        }));
      }
      
      function calculatePolicyImpact(policyData) {
        // 정책 영향 계산
        const beforeAvg = policyData.before.reduce((sum, val) => sum + val, 0) / policyData.before.length;
        const afterAvg = policyData.after.reduce((sum, val) => sum + val, 0) / policyData.after.length;
        const improvement = ((beforeAvg - afterAvg) / beforeAvg) * 100;
        
        return {
          beforeAverage: beforeAvg,
          afterAverage: afterAvg,
          improvementRate: improvement,
          effectiveness: improvement > 20 ? 'high' : improvement > 10 ? 'medium' : 'low'
        };
      }
      
      function getPM25Category(pm25) {
        if (pm25 <= 12) return 'good';
        if (pm25 <= 35.4) return 'moderate';
        if (pm25 <= 55.4) return 'unhealthy_sensitive';
        if (pm25 <= 150.4) return 'unhealthy';
        if (pm25 <= 250.4) return 'very_unhealthy';
        return 'hazardous';
      }
      
      function calculateHealthRisk(pm25) {
        // 건강 위험도 계산
        return Math.min(100, (pm25 / 250) * 100);
      }
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(workerUrl);
    
    this.worker.addEventListener('message', (e) => {
      this.handleWorkerMessage(e.data);
    });
  }

  /**
   * BroadcastChannel 초기화 (탭 간 통신)
   */
  initBroadcastChannel() {
    this.channel = new BroadcastChannel('airlens_data_sync');
    
    this.channel.addEventListener('message', (e) => {
      const { type, data } = e.data;
      
      switch(type) {
        case 'DATA_UPDATE':
          this.handleRemoteDataUpdate(data);
          break;
        case 'USER_ACTION':
          this.handleRemoteUserAction(data);
          break;
      }
    });
  }

  /**
   * 초기 데이터 로드
   */
  async loadInitialData() {
    const startTime = performance.now();
    
    try {
      // 병렬로 모든 데이터 로드
      const [stationsData, policiesData] = await Promise.all([
        this.fetchStationsData(),
        this.fetchPoliciesData()
      ]);
      
      // 중앙 저장소에 저장
      this.updateStations(stationsData);
      this.updatePolicies(policiesData);
      
      // 성능 메트릭 업데이트
      this.performanceMetrics.dataFetchTime = performance.now() - startTime;
      
      // 캐시에 저장
      this.saveToCacge();
      
      // 모든 구독자에게 알림
      this.notifyDataUpdate('initial_load', {
        stations: this.centralStore.stations.size,
        policies: this.centralStore.policies.size
      });
      
      console.log(`✅ Initial data loaded in ${this.performanceMetrics.dataFetchTime.toFixed(2)}ms`);
    } catch (error) {
      console.error('❌ Failed to load initial data:', error);
      // 캐시에서 로드 시도
      this.loadFromCache();
    }
  }

  /**
   * 측정소 데이터 가져오기
   */
  async fetchStationsData() {
    try {
      const response = await fetch('/data/pm25/latest.json');
      if (!response.ok) throw new Error('Failed to fetch stations');
      
      const data = await response.json();
      return data.stations || [];
    } catch (error) {
      console.error('Error fetching stations:', error);
      return [];
    }
  }

  /**
   * 정책 데이터 가져오기
   */
  async fetchPoliciesData() {
    try {
      const response = await fetch('/data/policies/enhanced-policies.json');
      if (!response.ok) throw new Error('Failed to fetch policies');
      
      const data = await response.json();
      return data.policies || [];
    } catch (error) {
      console.error('Error fetching policies:', error);
      return [];
    }
  }

  /**
   * 측정소 데이터 업데이트
   */
  updateStations(stations) {
    // WebWorker로 처리 위임
    if (this.worker) {
      this.worker.postMessage({
        type: 'PROCESS_PM25_DATA',
        data: stations
      });
    } else {
      // 폴백: 메인 스레드에서 처리
      stations.forEach(station => {
        this.centralStore.stations.set(station.id || station.name, station);
      });
    }
  }

  /**
   * 정책 데이터 업데이트
   */
  updatePolicies(policies) {
    policies.forEach(policy => {
      // 정책별 전후 비교 데이터 생성
      if (policy.before_data && policy.after_data) {
        const comparison = this.createComparisonData(policy);
        this.centralStore.comparisons.set(policy.id, comparison);
      }
      
      this.centralStore.policies.set(policy.id, policy);
    });
  }

  /**
   * 비교 데이터 생성
   */
  createComparisonData(policy) {
    const beforeValues = policy.before_data.map(d => d.pm25);
    const afterValues = policy.after_data.map(d => d.pm25);
    
    const beforeAvg = beforeValues.reduce((sum, val) => sum + val, 0) / beforeValues.length;
    const afterAvg = afterValues.reduce((sum, val) => sum + val, 0) / afterValues.length;
    
    return {
      policyId: policy.id,
      before: {
        average: beforeAvg,
        min: Math.min(...beforeValues),
        max: Math.max(...beforeValues),
        values: beforeValues
      },
      after: {
        average: afterAvg,
        min: Math.min(...afterValues),
        max: Math.max(...afterValues),
        values: afterValues
      },
      improvement: ((beforeAvg - afterAvg) / beforeAvg * 100).toFixed(1),
      timeline: policy.timeline || []
    };
  }

  /**
   * 자동 업데이트 시작
   */
  startAutoUpdate() {
    this.updateTimer = setInterval(() => {
      this.refreshData();
    }, this.updateInterval);
  }

  /**
   * 데이터 새로고침
   */
  async refreshData() {
    console.log('🔄 Refreshing data...');
    
    // 다른 탭에 새로고침 시작 알림
    this.broadcastUpdate('REFRESH_START', {});
    
    await this.loadInitialData();
    
    // 다른 탭에 새로고침 완료 알림
    this.broadcastUpdate('REFRESH_COMPLETE', {
      stations: this.centralStore.stations.size,
      policies: this.centralStore.policies.size
    });
  }

  /**
   * 캐시에 저장
   */
  saveToCacge() {
    const cacheData = {
      stations: Array.from(this.centralStore.stations.entries()),
      policies: Array.from(this.centralStore.policies.entries()),
      comparisons: Array.from(this.centralStore.comparisons.entries()),
      timestamp: Date.now()
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(cacheData));
      console.log('💾 Data saved to cache');
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  }

  /**
   * 캐시에서 로드
   */
  loadCachedData() {
    try {
      const cached = localStorage.getItem(this.storageKey);
      if (!cached) return;
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      
      // 캐시가 1시간 이내인 경우만 사용
      if (age < 3600000) {
        this.centralStore.stations = new Map(cacheData.stations);
        this.centralStore.policies = new Map(cacheData.policies);
        this.centralStore.comparisons = new Map(cacheData.comparisons);
        
        console.log('📦 Loaded data from cache');
        this.performanceMetrics.cacheHitRate++;
      }
    } catch (error) {
      console.error('Failed to load from cache:', error);
    }
  }

  /**
   * Worker 메시지 처리
   */
  handleWorkerMessage(message) {
    const { type, data } = message;
    
    switch(type) {
      case 'PM25_PROCESSED':
        data.forEach(station => {
          this.centralStore.stations.set(station.id || station.name, station);
        });
        this.notifyDataUpdate('stations', this.centralStore.stations);
        break;
        
      case 'IMPACT_CALCULATED':
        // 정책 영향 계산 결과 처리
        this.notifyDataUpdate('policy_impact', data);
        break;
    }
  }

  /**
   * 다른 탭으로 업데이트 브로드캐스트
   */
  broadcastUpdate(type, data) {
    if (this.channel) {
      this.channel.postMessage({
        type: type,
        data: data,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 원격 데이터 업데이트 처리
   */
  handleRemoteDataUpdate(data) {
    console.log('📡 Received remote data update');
    // 로컬 스토어 업데이트
    this.notifyDataUpdate('remote_update', data);
  }

  /**
   * 원격 사용자 액션 처리
   */
  handleRemoteUserAction(data) {
    console.log('👤 Remote user action:', data);
    this.notifyDataUpdate('user_action', data);
  }

  /**
   * 데이터 업데이트 알림
   */
  notifyDataUpdate(type, data) {
    const event = new CustomEvent('dataUpdate', {
      detail: {
        type: type,
        data: data,
        timestamp: Date.now()
      }
    });
    
    this.events.dispatchEvent(event);
  }

  /**
   * 데이터 업데이트 구독
   */
  subscribe(callback) {
    this.events.addEventListener('dataUpdate', callback);
    
    // 구독 해제 함수 반환
    return () => {
      this.events.removeEventListener('dataUpdate', callback);
    };
  }

  /**
   * 특정 국가의 정책 효과 분석
   */
  analyzePolicyEffect(countryCode) {
    const policies = Array.from(this.centralStore.policies.values())
      .filter(p => p.country === countryCode);
    
    const comparisons = policies.map(policy => {
      const comparison = this.centralStore.comparisons.get(policy.id);
      return {
        policy: policy,
        comparison: comparison,
        effectiveness: this.calculateEffectiveness(comparison)
      };
    });
    
    return comparisons.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * 정책 효과성 계산
   */
  calculateEffectiveness(comparison) {
    if (!comparison) return 0;
    
    const improvement = parseFloat(comparison.improvement);
    const consistency = this.calculateConsistency(comparison.after.values);
    const duration = comparison.timeline ? comparison.timeline.length : 1;
    
    // 가중 평균 계산
    return (improvement * 0.5) + (consistency * 0.3) + (duration * 0.2);
  }

  /**
   * 데이터 일관성 계산
   */
  calculateConsistency(values) {
    if (!values || values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    
    // 낮은 표준편차 = 높은 일관성
    return Math.max(0, 100 - stdDev);
  }

  /**
   * 글로벌 통계 가져오기
   */
  getGlobalStats() {
    const stations = Array.from(this.centralStore.stations.values());
    const policies = Array.from(this.centralStore.policies.values());
    
    const pm25Values = stations.map(s => s.pm25).filter(v => v > 0);
    const avgPM25 = pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length;
    
    const effectivePolicies = policies.filter(p => {
      const comp = this.centralStore.comparisons.get(p.id);
      return comp && parseFloat(comp.improvement) > 10;
    });
    
    return {
      totalStations: stations.length,
      totalPolicies: policies.length,
      averagePM25: avgPM25.toFixed(1),
      effectivePolicies: effectivePolicies.length,
      dataQuality: this.calculateDataQuality(),
      lastUpdate: new Date().toISOString()
    };
  }

  /**
   * 데이터 품질 평가
   */
  calculateDataQuality() {
    const stations = Array.from(this.centralStore.stations.values());
    const recentStations = stations.filter(s => {
      const age = Date.now() - new Date(s.timestamp).getTime();
      return age < 3600000; // 1시간 이내
    });
    
    return (recentStations.length / stations.length * 100).toFixed(0);
  }

  /**
   * 정리 (cleanup)
   */
  destroy() {
    // 타이머 정리
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }
    
    // Worker 종료
    if (this.worker) {
      this.worker.terminate();
    }
    
    // 채널 닫기
    if (this.channel) {
      this.channel.close();
    }
    
    // 캐시 저장
    this.saveToCacge();
    
    console.log('🔄 Data Integration Service destroyed');
  }
}

// 싱글톤 인스턴스 생성
export const dataIntegrationService = new EnhancedDataIntegrationService();
