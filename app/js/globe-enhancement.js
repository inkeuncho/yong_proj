/**
 * Enhanced Globe Integration
 * 개선된 정책 시각화 및 데이터 통합을 포함한 Globe 업데이트
 */

// 새로운 시스템 임포트
import { EnhancedPolicyVisualization } from './services/enhanced-policy-system/policy-visualization.js';
import { PolicyComparisonPanel } from './services/enhanced-policy-system/policy-comparison-panel.js';
import { dataIntegrationService } from './services/enhanced-policy-system/data-integration-service.js';

// 기존 Globe 클래스 확장
export function enhanceGlobe(PolicyGlobe) {
  
  // 원본 init 메서드 저장
  const originalInit = PolicyGlobe.prototype.init;
  
  // init 메서드 오버라이드
  PolicyGlobe.prototype.init = async function() {
    // 원본 init 실행
    await originalInit.call(this);
    
    // 개선된 정책 시각화 시스템 초기화
    this.enhancedPolicyViz = new EnhancedPolicyVisualization(this.scene, this.earth);
    
    // 정책 비교 패널 초기화
    this.comparisonPanel = new PolicyComparisonPanel();
    
    // 데이터 통합 서비스 구독
    this.setupDataIntegration();
    
    // 최적화된 데이터 로드
    await this.loadOptimizedData();
    
    console.log('✅ Globe enhanced with new policy visualization system');
  };
  
  /**
   * 데이터 통합 설정
   */
  PolicyGlobe.prototype.setupDataIntegration = function() {
    // 데이터 업데이트 구독
    this.dataUnsubscribe = dataIntegrationService.subscribe((event) => {
      const { type, data } = event.detail;
      
      switch(type) {
        case 'stations':
          this.updateStationMarkers(data);
          break;
        case 'policies':
          this.updatePolicyMarkers(data);
          break;
        case 'policy_impact':
          this.showPolicyImpact(data);
          break;
      }
    });
  };
  
  /**
   * 최적화된 데이터 로드
   */
  PolicyGlobe.prototype.loadOptimizedData = async function() {
    // 중앙 데이터 서비스에서 데이터 가져오기
    const stations = dataIntegrationService.getStations();
    const policies = dataIntegrationService.centralStore.policies;
    const comparisons = dataIntegrationService.centralStore.comparisons;
    
    // 정책 마커 생성 (빛나는 점으로)
    let policyCount = 0;
    for (const [id, policy] of policies) {
      try {
        // 정책 위치 정보가 있는 경우만
        if (policy.latitude && policy.longitude) {
          const effectiveness = this.calculatePolicyEffectiveness(policy, comparisons.get(id));
          
          this.enhancedPolicyViz.createPolicyMarker({
            id: policy.id,
            lat: policy.latitude,
            lon: policy.longitude,
            country: policy.country,
            effectiveness: effectiveness,
            title: policy.title,
            implementation_date: policy.implementation_date
          });
          
          // 비교 데이터 설정
          const comparison = comparisons.get(id);
          if (comparison) {
            this.enhancedPolicyViz.setPolicyComparisonData(
              policy.id,
              { pm25: comparison.before.average },
              { pm25: comparison.after.average }
            );
          }
          
          policyCount++;
        }
      } catch (error) {
        console.error(`Error creating policy marker for ${id}:`, error);
      }
    }
    
    console.log(`✅ Created ${policyCount} enhanced policy markers`);
    
    // 측정소 마커 업데이트 (기존 방식 유지)
    this.updateStationMarkers(stations);
  };
  
  /**
   * 정책 효과성 계산
   */
  PolicyGlobe.prototype.calculatePolicyEffectiveness = function(policy, comparison) {
    if (!comparison) return 'moderate';
    
    const improvement = parseFloat(comparison.improvement);
    
    if (improvement > 30) return 'highly_effective';
    if (improvement > 20) return 'effective';
    if (improvement > 10) return 'moderate';
    if (improvement > 0) return 'low';
    return 'minimal';
  };
  
  /**
   * 측정소 마커 업데이트
   */
  PolicyGlobe.prototype.updateStationMarkers = function(stations) {
    // 기존 마커 시스템 사용하여 업데이트
    if (this.markerSystem) {
      // 기존 마커 제거
      this.markerSystem.clearPM25Markers();
      
      // 새 마커 생성
      for (const [id, station] of stations) {
        this.markerSystem.createPM25Marker({
          id: station.id || id,
          latitude: station.lat || station.latitude,
          longitude: station.lon || station.longitude,
          pm25: station.pm25 || station.aqi || 0,
          country: station.country || 'Unknown'
        });
      }
    }
  };
  
  /**
   * 정책 마커 업데이트
   */
  PolicyGlobe.prototype.updatePolicyMarkers = function(policies) {
    // 기존 마커 제거
    this.enhancedPolicyViz.clearAllMarkers();
    
    // 새 마커 생성
    for (const [id, policy] of policies) {
      if (policy.latitude && policy.longitude) {
        const comparison = dataIntegrationService.centralStore.comparisons.get(id);
        const effectiveness = this.calculatePolicyEffectiveness(policy, comparison);
        
        this.enhancedPolicyViz.createPolicyMarker({
          id: policy.id,
          lat: policy.latitude,
          lon: policy.longitude,
          country: policy.country,
          effectiveness: effectiveness,
          title: policy.title,
          implementation_date: policy.implementation_date
        });
      }
    }
  };
  
  /**
   * 정책 영향 표시
   */
  PolicyGlobe.prototype.showPolicyImpact = function(impactData) {
    // 비교 패널에 데이터 표시
    if (this.comparisonPanel) {
      this.comparisonPanel.updatePolicyData({
        ...impactData,
        comparison: {
          before_pm25: impactData.beforeAverage,
          after_pm25: impactData.afterAverage,
          timeline: []
        }
      });
    }
  };
  
  /**
   * 마우스 인터랙션 개선
   */
  PolicyGlobe.prototype.onMouseMove = function(event) {
    // 원본 마우스 이벤트 처리
    if (this.originalOnMouseMove) {
      this.originalOnMouseMove.call(this, event);
    }
    
    // 정책 마커 호버 효과
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // 정책 마커와의 교차점 확인
    const policyMarkers = this.enhancedPolicyViz.policyMarkersGroup.children;
    const intersects = this.raycaster.intersectObjects(policyMarkers, true);
    
    if (intersects.length > 0) {
      const marker = intersects[0].object.parent;
      if (marker.userData && marker.userData.type === 'policy') {
        // 하이라이트 효과
        this.enhancedPolicyViz.highlightPolicy(marker.userData.id);
        
        // 툴팁 표시
        this.showPolicyTooltip(marker.userData, event.clientX, event.clientY);
      }
    } else {
      // 하이라이트 제거
      if (this.highlightedPolicyId) {
        this.enhancedPolicyViz.unhighlightPolicy(this.highlightedPolicyId);
        this.highlightedPolicyId = null;
        this.hidePolicyTooltip();
      }
    }
  };
  
  /**
   * 정책 툴팁 표시
   */
  PolicyGlobe.prototype.showPolicyTooltip = function(policyData, x, y) {
    if (!this.policyTooltip) {
      this.createPolicyTooltip();
    }
    
    const comparison = dataIntegrationService.centralStore.comparisons.get(policyData.id);
    
    this.policyTooltip.innerHTML = `
      <div class="policy-tooltip-content">
        <div class="tooltip-title">${policyData.title}</div>
        <div class="tooltip-country">🌍 ${policyData.country}</div>
        <div class="tooltip-date">📅 ${policyData.implementation_date}</div>
        ${comparison ? `
          <div class="tooltip-improvement">
            개선율: <span class="${parseFloat(comparison.improvement) > 0 ? 'positive' : 'negative'}">
              ${comparison.improvement}%
            </span>
          </div>
        ` : ''}
        <div class="tooltip-hint">클릭하여 상세 보기</div>
      </div>
    `;
    
    this.policyTooltip.style.left = `${x + 10}px`;
    this.policyTooltip.style.top = `${y - 10}px`;
    this.policyTooltip.style.display = 'block';
    
    this.highlightedPolicyId = policyData.id;
  };
  
  /**
   * 정책 툴팁 생성
   */
  PolicyGlobe.prototype.createPolicyTooltip = function() {
    this.policyTooltip = document.createElement('div');
    this.policyTooltip.className = 'policy-tooltip';
    this.policyTooltip.style.cssText = `
      position: fixed;
      background: rgba(16, 33, 34, 0.95);
      border: 1px solid rgba(37, 226, 244, 0.5);
      border-radius: 8px;
      padding: 12px;
      color: white;
      font-size: 13px;
      pointer-events: none;
      z-index: 10000;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      display: none;
      max-width: 250px;
    `;
    
    document.body.appendChild(this.policyTooltip);
  };
  
  /**
   * 정책 툴팁 숨기기
   */
  PolicyGlobe.prototype.hidePolicyTooltip = function() {
    if (this.policyTooltip) {
      this.policyTooltip.style.display = 'none';
    }
  };
  
  /**
   * 클릭 이벤트 개선
   */
  PolicyGlobe.prototype.onClick = function(event) {
    // 원본 클릭 이벤트 처리
    if (this.originalOnClick) {
      this.originalOnClick.call(this, event);
    }
    
    // 정책 마커 클릭 처리
    if (this.highlightedPolicyId) {
      const policy = dataIntegrationService.centralStore.policies.get(this.highlightedPolicyId);
      const comparison = dataIntegrationService.centralStore.comparisons.get(this.highlightedPolicyId);
      
      if (policy) {
        // 비교 패널 표시
        this.comparisonPanel.updatePolicyData({
          ...policy,
          comparison: comparison ? {
            before_pm25: comparison.before.average,
            after_pm25: comparison.after.average,
            timeline: comparison.timeline
          } : null,
          affected_areas: policy.affected_areas || 'N/A',
          type: policy.type || 'General',
          confidence: policy.confidence || 'Medium'
        });
      }
    }
  };
  
  /**
   * 애니메이션 루프 개선
   */
  PolicyGlobe.prototype.animate = function() {
    requestAnimationFrame(() => this.animate());
    
    const time = this.clock.getElapsedTime();
    
    // 개선된 정책 시각화 업데이트
    if (this.enhancedPolicyViz) {
      this.enhancedPolicyViz.update(time);
    }
    
    // 원본 애니메이션 로직 실행
    if (this.originalAnimate) {
      this.originalAnimate.call(this);
    } else {
      // 기본 애니메이션
      if (this.controls) {
        this.controls.update();
      }
      
      if (this.clouds) {
        this.clouds.rotation.y += 0.0001;
      }
      
      if (this.renderer) {
        this.renderer.render(this.scene, this.camera);
      }
    }
  };
  
  /**
   * 성능 최적화: LOD (Level of Detail) 시스템
   */
  PolicyGlobe.prototype.optimizePerformance = function() {
    const distance = this.camera.position.length();
    
    // 거리에 따른 마커 표시 조정
    if (distance > 3) {
      // 멀리 있을 때: 주요 마커만 표시
      this.enhancedPolicyViz.setVisible(false);
      if (this.markerSystem) {
        this.markerSystem.setLOD('low');
      }
    } else if (distance > 2) {
      // 중간 거리: 정책 마커 표시
      this.enhancedPolicyViz.setVisible(true);
      if (this.markerSystem) {
        this.markerSystem.setLOD('medium');
      }
    } else {
      // 가까이: 모든 디테일 표시
      this.enhancedPolicyViz.setVisible(true);
      if (this.markerSystem) {
        this.markerSystem.setLOD('high');
      }
    }
    
    // 프러스텀 컬링 최적화
    this.scene.traverse((object) => {
      if (object.isMesh) {
        object.frustumCulled = true;
      }
    });
  };
  
  /**
   * 정리 메서드
   */
  PolicyGlobe.prototype.dispose = function() {
    // 원본 dispose 실행
    if (this.originalDispose) {
      this.originalDispose.call(this);
    }
    
    // 추가된 요소들 정리
    if (this.dataUnsubscribe) {
      this.dataUnsubscribe();
    }
    
    if (this.policyTooltip) {
      document.body.removeChild(this.policyTooltip);
    }
    
    if (this.enhancedPolicyViz) {
      this.enhancedPolicyViz.clearAllMarkers();
    }
  };
}
