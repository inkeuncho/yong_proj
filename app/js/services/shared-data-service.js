/**
 * Shared Data Service - 모든 페이지에서 공유되는 데이터 관리
 * 변경사항이 자동으로 모든 페이지에 반영됨
 */

export class SharedDataService {
  constructor() {
    this.data = {
      stations: new Map(),
      policies: new Map(),
      selectedCountry: null,
      lastUpdate: null,
      refreshing: false
    };
    
    // 구독자들 (변경사항 감시)
    this.subscribers = {
      stations: new Set(),
      policies: new Set(),
      selectedCountry: new Set(),
      global: new Set()
    };
    
    // 캐시 설정
    this.cacheExpiry = 5 * 60 * 1000; // 5분
    this.lastUpdateTime = new Map();
  }

  /**
   * 구독: 데이터 변경사항 감시
   * @param {string} dataType - 'stations', 'policies', 'selectedCountry', 'global'
   * @param {Function} callback - 변경 감지 시 호출할 함수
   */
  subscribe(dataType, callback) {
    if (!this.subscribers[dataType]) {
      this.subscribers[dataType] = new Set();
    }
    this.subscribers[dataType].add(callback);
    this.subscribers.global.add(callback);
    
    console.log(`✅ Subscribed to ${dataType}`);
    
    // 구독 해제 함수 반환
    return () => {
      this.subscribers[dataType].delete(callback);
      this.subscribers.global.delete(callback);
      console.log(`✅ Unsubscribed from ${dataType}`);
    };
  }

  /**
   * 변경사항 알림 (모든 구독자에게)
   */
  notifySubscribers(dataType, newData) {
    if (this.subscribers[dataType]) {
      this.subscribers[dataType].forEach(callback => {
        try {
          callback(newData, dataType);
        } catch (error) {
          console.error(`Error in subscriber callback for ${dataType}:`, error);
        }
      });
    }
  }

  // ==================== STATIONS ====================

  /**
   * 측정소 데이터 설정
   */
  setStations(stations) {
    this.data.stations = new Map();
    
    if (Array.isArray(stations)) {
      stations.forEach(station => {
        this.data.stations.set(station.id || station.name, station);
      });
    } else if (stations instanceof Map) {
      this.data.stations = new Map(stations);
    }
    
    this.lastUpdateTime.set('stations', Date.now());
    this.data.lastUpdate = new Date().toLocaleTimeString();
    
    console.log(`📍 Updated ${this.data.stations.size} stations`);
    this.notifySubscribers('stations', this.data.stations);
  }

  /**
   * 측정소 데이터 가져오기
   */
  getStations() {
    return this.data.stations;
  }

  /**
   * 특정 측정소 데이터 가져오기
   */
  getStation(id) {
    return this.data.stations.get(id);
  }

  /**
   * 측정소 데이터 추가/업데이트
   */
  updateStation(station) {
    const id = station.id || station.name;
    this.data.stations.set(id, station);
    this.lastUpdateTime.set('stations', Date.now());
    this.notifySubscribers('stations', this.data.stations);
  }

  // ==================== POLICIES ====================

  /**
   * 정책 데이터 설정
   */
  setPolicies(policies) {
    this.data.policies = new Map();
    
    if (Array.isArray(policies)) {
      policies.forEach(policy => {
        const countryKey = policy.country || policy.name;
        this.data.policies.set(countryKey, policy);
      });
    } else if (policies instanceof Map) {
      this.data.policies = new Map(policies);
    }
    
    this.lastUpdateTime.set('policies', Date.now());
    console.log(`📋 Updated ${this.data.policies.size} policies`);
    this.notifySubscribers('policies', this.data.policies);
  }

  /**
   * 정책 데이터 가져오기
   */
  getPolicies() {
    return this.data.policies;
  }

  /**
   * 특정 국가 정책 가져오기
   */
  getPoliciesByCountry(country) {
    return this.data.policies.get(country);
  }

  /**
   * 정책 데이터 추가/업데이트
   */
  updatePolicy(policy) {
    const countryKey = policy.country || policy.name;
    this.data.policies.set(countryKey, policy);
    this.lastUpdateTime.set('policies', Date.now());
    this.notifySubscribers('policies', this.data.policies);
  }

  // ==================== SELECTED COUNTRY ====================

  /**
   * 선택된 국가 설정
   */
  setSelectedCountry(countryData) {
    this.data.selectedCountry = countryData;
    console.log(`🌍 Selected country: ${countryData?.country || countryData?.name}`);
    this.notifySubscribers('selectedCountry', countryData);
  }

  /**
   * 선택된 국가 가져오기
   */
  getSelectedCountry() {
    return this.data.selectedCountry;
  }

  // ==================== CACHE MANAGEMENT ====================

  /**
   * 캐시 유효성 확인
   */
  isCacheValid(dataType) {
    const lastUpdate = this.lastUpdateTime.get(dataType);
    if (!lastUpdate) return false;
    return Date.now() - lastUpdate < this.cacheExpiry;
  }

  /**
   * 캐시 초기화
   */
  clearCache(dataType = null) {
    if (dataType) {
      this.lastUpdateTime.delete(dataType);
      console.log(`🗑️ Cleared cache for ${dataType}`);
    } else {
      this.lastUpdateTime.clear();
      console.log(`🗑️ Cleared all caches`);
    }
  }

  // ==================== UTILITY ====================

  /**
   * 모든 데이터 가져오기
   */
  getAllData() {
    return {
      stations: this.data.stations,
      policies: this.data.policies,
      selectedCountry: this.data.selectedCountry,
      lastUpdate: this.data.lastUpdate,
      stationsCount: this.data.stations.size,
      policiesCount: this.data.policies.size
    };
  }

  /**
   * 데이터 통계
   */
  getStats() {
    return {
      totalStations: this.data.stations.size,
      totalPolicies: this.data.policies.size,
      lastUpdate: this.data.lastUpdate,
      cacheStatus: {
        stations: this.isCacheValid('stations'),
        policies: this.isCacheValid('policies')
      }
    };
  }
}

// 전역 싱글톤 인스턴스
export const globalDataService = new SharedDataService();
