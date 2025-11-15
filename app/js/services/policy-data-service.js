/**
 * Policy Data Service - 정책 데이터 로드 및 관리
 * Policy Explorer 패널에 실시간 데이터 표시
 */

import { globalDataService } from './shared-data-service.js';

export class PolicyDataService {
  constructor() {
    this.baseURL = '/Finedust_proj/app/data';
    this.cache = new Map();
    this.cacheExpiry = 10 * 60 * 1000; // 10분
    this.lastUpdateTime = new Map();
  }

  /**
   * 모든 정책 데이터 로드
   */
  async loadAllPolicies() {
    const cacheKey = 'all-policies';
    
    if (this.isCacheValid(cacheKey)) {
      console.log('✅ Using cached policy data');
      return this.cache.get(cacheKey);
    }

    try {
      console.log('📋 Loading policy data from policies.json...');
      
      // 단일 policies.json 파일에서 정책 데이터 로드
      const response = await fetch(`${this.baseURL}/policies.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to load policies.json`);
      }
      
      const data = await response.json();
      const policies = new Map();
      
      if (data.policies && Array.isArray(data.policies)) {
        const countryCoordinates = {
          'South Korea': { lat: 37.5, lon: 126.9 },
          'China': { lat: 39.9, lon: 116.4 },
          'Japan': { lat: 35.6, lon: 139.6 },
          'USA': { lat: 37.7, lon: -95.7 },
          'European Union': { lat: 54.5, lon: 15.2 },
          'India': { lat: 28.6, lon: 77.2 },
          'Germany': { lat: 51.1, lon: 10.4 },
          'France': { lat: 46.2, lon: 2.2 },
          'United Kingdom': { lat: 55.3, lon: -3.4 },
          'Canada': { lat: 56.1, lon: -106.3 }
        };
        
        for (const policy of data.policies) {
          const country = policy.country || 'Unknown';
          const coords = countryCoordinates[country] || { lat: 37.5, lon: 126.9 };
          
          policies.set(country, {
            ...policy,
            latitude: coords.lat,
            longitude: coords.lon,
            effectivenessScore: policy.credibility || 0.5
          });
        }
      }
      
      // 캐시에 저장
      this.setCache(cacheKey, policies);
      
      // 전역 데이터 서비스에 업데이트
      globalDataService.setPolicies(policies);
      
      console.log(`✅ Loaded ${policies.size} policies from policies.json`);
      return policies;
    } catch (error) {
      console.error('❌ Failed to load policies:', error);
      return new Map();
    }
  }

  /**
   * 특정 국가 정책 로드
   */
  async loadPolicyByCountry(country) {
    const cacheKey = `policy-${country}`;
    
    if (this.isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      // 파일명 변환 (공백 -> 하이픈, 소문자)
      const fileName = country
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') + '-policies.json';

      const response = await fetch(`${this.baseURL}/${fileName}`);
      
      if (response.ok) {
        const data = await response.json();
        this.setCache(cacheKey, data);
        
        // 전역 데이터 서비스에 업데이트
        globalDataService.updatePolicy(data);
        
        return data;
      }
    } catch (error) {
      console.warn(`⚠️ Could not load policy for ${country}:`, error);
    }

    return null;
  }

  /**
   * 정책 데이터와 PM2.5 측정소 데이터 병합
   */
  async mergePoliciesWithStations() {
    try {
      const policies = globalDataService.getPolicies();
      const stations = globalDataService.getStations();
      
      console.log('🔗 Merging policies with station data...');
      
      // 각 정책에 해당 국가의 측정소 데이터 추가
      policies.forEach((policy, countryKey) => {
        const stationsInCountry = Array.from(stations.values())
          .filter(station => this.isStationInCountry(station, policy));
        
        policy.relatedStations = stationsInCountry;
        policy.averagePM25 = this.calculateAveragePM25(stationsInCountry);
        policy.areaCode = policy.country?.toUpperCase() || 'UNKNOWN';
      });
      
      console.log('✅ Policies merged with station data');
      return policies;
    } catch (error) {
      console.error('❌ Error merging policies with stations:', error);
      return globalDataService.getPolicies();
    }
  }

  /**
   * 측정소가 국가에 속하는지 확인
   */
  isStationInCountry(station, policy) {
    if (!policy.country || !station.country) return false;
    
    // 정확한 국가명 매칭
    return station.country.toLowerCase() === policy.country.toLowerCase();
  }

  /**
   * 평균 PM2.5 계산
   */
  calculateAveragePM25(stations) {
    if (!stations || stations.length === 0) return 0;
    
    const sum = stations.reduce((acc, station) => {
      return acc + (station.pm25 || 0);
    }, 0);
    
    return Math.round((sum / stations.length) * 10) / 10;
  }

  /**
   * 정책별 카테고리 분류
   */
  getPoliciesByCategory(category) {
    const policies = globalDataService.getPolicies();
    const filtered = new Map();
    
    policies.forEach((policy, key) => {
      if (policy.category === category) {
        filtered.set(key, policy);
      }
    });
    
    return filtered;
  }

  /**
   * 정책별 효과 랭킹
   */
  getPoliciesByEffectiveness() {
    const policies = Array.from(globalDataService.getPolicies().values());
    
    return policies.sort((a, b) => {
      const aScore = this.calculateEffectivenessScore(a);
      const bScore = this.calculateEffectivenessScore(b);
      return bScore - aScore;
    });
  }

  /**
   * 정책 효과 점수 계산
   */
  calculateEffectivenessScore(policy) {
    let score = 50; // 기본 점수
    
    if (policy.implementationYear) {
      // 최근 정책일수록 높은 점수
      const yearsAgo = new Date().getFullYear() - policy.implementationYear;
      score += Math.max(0, 25 - yearsAgo);
    }
    
    if (policy.pm25Reduction) {
      // PM2.5 감소량이 많을수록 높은 점수
      score += Math.min(25, policy.pm25Reduction / 10);
    }
    
    if (policy.status) {
      const statusScores = {
        'Exemplary': 30,
        'Highly Effective': 25,
        'Effective': 20,
        'Partial Progress': 10,
        'Limited Progress': 5
      };
      score += statusScores[policy.status] || 0;
    }
    
    return Math.round(score);
  }

  /**
   * 통계 데이터 생성
   */
  generateStatistics() {
    const policies = Array.from(globalDataService.getPolicies().values());
    const stations = Array.from(globalDataService.getStations().values());
    
    return {
      totalCountries: policies.length,
      totalPolicies: policies.length,
      totalRegions: new Set(
        policies.map(p => p.region || p.country).filter(Boolean)
      ).size,
      totalStations: stations.length,
      averageEffectiveness: this.calculateAverageEffectiveness(policies),
      globalAveragePM25: this.calculateGlobalAveragePM25(stations),
      mostEffectivePolicy: this.getMostEffectivePolicy(policies),
      worstAirQuality: this.getWorstAirQuality(stations)
    };
  }

  /**
   * 평균 효과 계산
   */
  calculateAverageEffectiveness(policies) {
    if (policies.length === 0) return 0;
    const sum = policies.reduce((acc, policy) => {
      return acc + this.calculateEffectivenessScore(policy);
    }, 0);
    return Math.round(sum / policies.length);
  }

  /**
   * 전역 평균 PM2.5
   */
  calculateGlobalAveragePM25(stations) {
    if (stations.length === 0) return 0;
    const sum = stations.reduce((acc, station) => {
      return acc + (station.pm25 || 0);
    }, 0);
    return Math.round((sum / stations.length) * 10) / 10;
  }

  /**
   * 가장 효과적인 정책 찾기
   */
  getMostEffectivePolicy(policies) {
    if (policies.length === 0) return null;
    return policies.reduce((best, current) => {
      const bestScore = this.calculateEffectivenessScore(best);
      const currentScore = this.calculateEffectivenessScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  /**
   * 대기질 가장 나쁜 지역
   */
  getWorstAirQuality(stations) {
    if (stations.length === 0) return null;
    return stations.reduce((worst, current) => {
      return (current.pm25 || 0) > (worst.pm25 || 0) ? current : worst;
    });
  }

  /**
   * 캐시 유효성 확인
   */
  isCacheValid(key) {
    const lastUpdate = this.lastUpdateTime.get(key);
    if (!lastUpdate) return false;
    return Date.now() - lastUpdate < this.cacheExpiry;
  }

  /**
   * 캐시에 저장
   */
  setCache(key, value) {
    this.cache.set(key, value);
    this.lastUpdateTime.set(key, Date.now());
  }

  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    this.lastUpdateTime.clear();
    console.log('🗑️ Policy cache cleared');
  }
}

// 전역 싱글톤 인스턴스
export const policyDataService = new PolicyDataService();
