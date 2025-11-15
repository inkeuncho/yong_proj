/**
 * Enhanced Policy Visualization System
 * 정책 전후 비교 및 빛나는 효과를 위한 개선된 시각화 시스템
 */

import * as THREE from 'three';

export class EnhancedPolicyVisualization {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    
    // 정책 마커 그룹
    this.policyMarkersGroup = new THREE.Group();
    this.policyMarkersGroup.name = 'policyMarkers';
    this.scene.add(this.policyMarkersGroup);
    
    // 빛나는 효과를 위한 그룹
    this.glowEffectsGroup = new THREE.Group();
    this.glowEffectsGroup.name = 'glowEffects';
    this.scene.add(this.glowEffectsGroup);
    
    // 정책 데이터 저장
    this.policies = new Map();
    this.policyEffects = new Map(); // 정책 효과 데이터
    
    // 애니메이션 설정
    this.animationSpeed = 0.01;
    this.glowIntensity = 1.0;
    this.pulseSpeed = 2.0;
    
    // 색상 설정 (정책 효과에 따른)
    this.colors = {
      highly_effective: new THREE.Color(0x00ff00), // 녹색 - 매우 효과적
      effective: new THREE.Color(0x88ff00),        // 연녹색 - 효과적
      moderate: new THREE.Color(0xffff00),         // 노랑 - 보통
      low: new THREE.Color(0xff8800),              // 주황 - 낮음
      minimal: new THREE.Color(0xff0000),          // 빨강 - 최소
      new: new THREE.Color(0x00ffff)              // 청록 - 새로운 정책
    };
    
    // Shader materials for glowing effects
    this.createGlowMaterials();
    
    // 비교 시각화 설정
    this.comparisonMode = false;
    this.beforeAfterData = new Map();
  }

  /**
   * 빛나는 효과를 위한 셰이더 머티리얼 생성
   */
  createGlowMaterials() {
    // Glow vertex shader
    this.glowVertexShader = `
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vPositionNormal = normalize((modelViewMatrix * vec4(position, 1.0)).xyz);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    // Glow fragment shader
    this.glowFragmentShader = `
      uniform vec3 glowColor;
      uniform float intensity;
      uniform float time;
      varying vec3 vNormal;
      varying vec3 vPositionNormal;
      
      void main() {
        float glow = pow(0.7 - dot(vNormal, vPositionNormal), 1.5);
        float pulse = sin(time * 2.0) * 0.3 + 0.7;
        gl_FragColor = vec4(glowColor * intensity * pulse, glow);
      }
    `;
  }

  /**
   * 정책 마커 생성 (빛나는 점)
   */
  createPolicyMarker(policyData) {
    const { id, lat, lon, country, effectiveness, title, implementation_date } = policyData;
    
    // 위도/경도를 3D 좌표로 변환
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    const radius = 1.02; // 지구 표면보다 약간 위
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    
    // 빛나는 구체 생성
    const coreGeometry = new THREE.SphereGeometry(0.006, 16, 16);
    const color = this.colors[effectiveness] || this.colors.moderate;
    
    // 코어 머티리얼 (중심부)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.9
    });
    
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    coreMesh.position.set(x, y, z);
    
    // 글로우 효과 (외부 광환)
    const glowGeometry = new THREE.SphereGeometry(0.015, 16, 16);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: color },
        intensity: { value: this.glowIntensity },
        time: { value: 0 }
      },
      vertexShader: this.glowVertexShader,
      fragmentShader: this.glowFragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.set(x, y, z);
    
    // 펄스 링 효과
    const ringGeometry = new THREE.RingGeometry(0.01, 0.02, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.position.set(x, y, z);
    ringMesh.lookAt(0, 0, 0); // 지구 중심을 향하게
    
    // 그룹으로 묶기
    const markerGroup = new THREE.Group();
    markerGroup.add(coreMesh);
    markerGroup.add(glowMesh);
    markerGroup.add(ringMesh);
    
    // 메타데이터 저장
    markerGroup.userData = {
      type: 'policy',
      id: id,
      country: country,
      title: title,
      effectiveness: effectiveness,
      implementation_date: implementation_date,
      coreMesh: coreMesh,
      glowMesh: glowMesh,
      ringMesh: ringMesh,
      glowMaterial: glowMaterial,
      ringMaterial: ringMaterial
    };
    
    this.policyMarkersGroup.add(markerGroup);
    this.policies.set(id, markerGroup);
    
    return markerGroup;
  }


  /**
   * 정책 전후 비교 데이터 설정
   */
  setPolicyComparisonData(policyId, beforeData, afterData) {
    this.beforeAfterData.set(policyId, {
      before: beforeData,
      after: afterData,
      improvement: this.calculateImprovement(beforeData, afterData)
    });
  }

  /**
   * PM2.5 개선율 계산
   */
  calculateImprovement(beforeData, afterData) {
    if (!beforeData.pm25 || !afterData.pm25) return 0;
    const improvement = ((beforeData.pm25 - afterData.pm25) / beforeData.pm25) * 100;
    return improvement.toFixed(1);
  }

  /**
   * 비교 시각화 토글
   */
  toggleComparisonMode(enabled) {
    this.comparisonMode = enabled;
    
    if (enabled) {
      this.showComparisonVisualization();
    } else {
      this.hideComparisonVisualization();
    }
  }

  /**
   * 비교 시각화 표시
   */
  showComparisonVisualization() {
    // 각 정책 마커에 대해 전후 비교 표시
    this.policies.forEach((marker, policyId) => {
      const comparisonData = this.beforeAfterData.get(policyId);
      if (comparisonData) {
        this.createComparisonVisual(marker, comparisonData);
      }
    });
  }

  /**
   * 비교 시각 요소 생성
   */
  createComparisonVisual(marker, comparisonData) {
    const position = marker.position.clone();
    
    // 비교 바 생성
    const barHeight = Math.abs(comparisonData.improvement) * 0.001;
    const barGeometry = new THREE.BoxGeometry(0.002, barHeight, 0.002);
    
    // 개선된 경우 녹색, 악화된 경우 빨간색
    const barColor = comparisonData.improvement > 0 ? 0x00ff00 : 0xff0000;
    const barMaterial = new THREE.MeshBasicMaterial({
      color: barColor,
      transparent: true,
      opacity: 0.8
    });
    
    const barMesh = new THREE.Mesh(barGeometry, barMaterial);
    barMesh.position.copy(position);
    barMesh.position.y += barHeight / 2;
    
    marker.add(barMesh);
    marker.userData.comparisonBar = barMesh;
  }

  /**
   * 비교 시각화 숨기기
   */
  hideComparisonVisualization() {
    this.policies.forEach(marker => {
      if (marker.userData.comparisonBar) {
        marker.remove(marker.userData.comparisonBar);
        delete marker.userData.comparisonBar;
      }
    });
  }

  /**
   * 애니메이션 업데이트
   */
  update(time) {
    // 모든 정책 마커 애니메이션
    this.policies.forEach(marker => {
      const userData = marker.userData;
      
      // 글로우 펄스 애니메이션
      if (userData.glowMaterial) {
        userData.glowMaterial.uniforms.time.value = time * this.pulseSpeed;
      }
      
      // 링 확장 애니메이션
      if (userData.ringMesh) {
        const scale = 1 + Math.sin(time * this.pulseSpeed) * 0.2;
        userData.ringMesh.scale.set(scale, scale, 1);
        userData.ringMaterial.opacity = 0.3 - Math.sin(time * this.pulseSpeed) * 0.15;
      }
      
      // 코어 밝기 변화
      if (userData.coreMesh) {
        const brightness = 0.7 + Math.sin(time * this.pulseSpeed * 0.5) * 0.3;
        userData.coreMesh.material.opacity = brightness;
      }
    });
  }

  /**
   * 특정 정책 하이라이트
   */
  highlightPolicy(policyId) {
    const marker = this.policies.get(policyId);
    if (!marker) return;
    
    // 크기 확대
    marker.scale.set(1.5, 1.5, 1.5);
    
    // 밝기 증가
    const userData = marker.userData;
    if (userData.glowMaterial) {
      userData.glowMaterial.uniforms.intensity.value = 2.0;
    }
  }

  /**
   * 하이라이트 제거
   */
  unhighlightPolicy(policyId) {
    const marker = this.policies.get(policyId);
    if (!marker) return;
    
    // 크기 복원
    marker.scale.set(1, 1, 1);
    
    // 밝기 복원
    const userData = marker.userData;
    if (userData.glowMaterial) {
      userData.glowMaterial.uniforms.intensity.value = this.glowIntensity;
    }
  }

  /**
   * 모든 정책 마커 제거
   */
  clearAllMarkers() {
    this.policies.forEach(marker => {
      this.policyMarkersGroup.remove(marker);
    });
    this.policies.clear();
    this.beforeAfterData.clear();
  }

  /**
   * 가시성 토글
   */
  setVisible(visible) {
    this.policyMarkersGroup.visible = visible;
    this.glowEffectsGroup.visible = visible;
  }
}
