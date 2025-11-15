/**
 * Enhanced Globe Marker System - 개선된 마커 시각화
 * PM2.5 마커: 작고 간결 (보조 역할)
 * 정책 마커: 크고 화려 (주요 포커스)
 */

import * as THREE from 'three';

export class GlobeMarkerSystem {
  constructor(globe, scene) {
    this.globe = globe;
    this.scene = scene;
    
    // 마커 그룹들
    this.markerGroups = {
      pm25: null,        // PM2.5 측정소 (작음, 간결)
      policies: null,    // 정책 마커 (크고 화려)
      users: null        // 사용자 위치
    };
    
    this.markerData = new Map();
    this.isUpdating = false;
    
    // 정책 마커 텍스트 라벨을 위한 캔버스
    this.labelCanvas = null;
  }

  /**
   * 초기화
   */
  init() {
    this.markerGroups.pm25 = new THREE.Group();
    this.markerGroups.policies = new THREE.Group();
    this.markerGroups.users = new THREE.Group();
    
    // 계층 순서: PM2.5 → 정책 → 사용자 (정책이 위에 렌더링됨)
    this.globe.add(this.markerGroups.pm25);
    this.globe.add(this.markerGroups.policies);
    this.globe.add(this.markerGroups.users);
    
    console.log('✅ Enhanced Globe Marker System initialized');
  }

  /**
   * 위도/경도를 3D 위치로 변환
   */
  latLonToPosition(lat, lon, radius = 1.05) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    
    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * PM2.5 마커 추가 - 작고 간결한 스타일
   */
  addPM25Marker(id, lat, lon, value, data = {}) {
    const position = this.latLonToPosition(lat, lon, 1.02);
    const color = this.getAQIColor(value);
    
    // ▼ 메인 마커 (아주 작은 구, 반투명)
    const markerGeometry = new THREE.SphereGeometry(0.01, 12, 12); // 더 작음
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.6,  // 반투명
      emissive: color,
      emissiveIntensity: 0.2,
      metalness: 0.2,
      roughness: 0.6,
      depthWrite: false // 오버드로우 방지
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    marker.userData = { id, type: 'pm25', value, data };
    
    // ▼ 간단한 링 (가는 선)
    const ringGeometry = new THREE.RingGeometry(0.012, 0.015, 24);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.copy(position);
    ring.lookAt(position.clone().normalize().multiplyScalar(2));
    ring.userData = { id, type: 'pm25-ring' };
    
    this.markerGroups.pm25.add(marker);
    this.markerGroups.pm25.add(ring);
    
    this.markerData.set(id, {
      mesh: marker,
      ring: ring,
      position: position,
      lat: lat,
      lon: lon,
      value: value,
      data: data,
      type: 'pm25'
    });
    
    return { marker, ring };
  }

  /**
   * 정책 마커 추가 - 크고 화려한 스타일
   * 이것이 주요 시각화 요소!
   */
  addPolicyMarker(countryCode, lat, lon, status = 'Effective', data = {}) {
    const position = this.latLonToPosition(lat, lon, 1.12); // 더 높게
    const color = this.getPolicyStatusColor(status);
    
    // ▼ 1️⃣ 메인 마커 (큰 팔각형 = 두드러짐)
    const markerGeometry = new THREE.OctahedronGeometry(0.05, 1);
    const markerMaterial = new THREE.MeshStandardMaterial({
      color: color,
      transparent: true,
      opacity: 0.95,
      emissive: color,
      emissiveIntensity: 0.6,  // 강한 빛남
      metalness: 0.7,
      roughness: 0.15,
      wireframe: false
    });
    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.copy(position);
    marker.scale.set(1.5, 1.5, 1.5); // 시작부터 크게
    marker.userData = { 
      id: countryCode, 
      type: 'policy', 
      status, 
      data,
      rotationSpeed: Math.random() * 0.01 + 0.005 // 회전 속도 변화
    };
    
    // ▼ 2️⃣ 헤일로 효과 (주변 고리)
    const haloGeometry = new THREE.TorusGeometry(0.08, 0.015, 32, 100);
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.position.copy(position);
    halo.userData = { id: countryCode, type: 'policy-halo' };
    
    // ▼ 3️⃣ 펄싱 아우라 (더 큼, 맥박하는 효과)
    const auraGeometry = new THREE.SphereGeometry(0.07, 32, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide, // 내부에서 빛남
      depthWrite: false
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    aura.position.copy(position);
    aura.scale.set(1, 1, 1);
    aura.userData = { id: countryCode, type: 'policy-aura' };
    
    // ▼ 4️⃣ 텍스트 라벨 (국가 코드)
    const labelTexture = this.createTextTexture(countryCode, color);
    const labelGeometry = new THREE.PlaneGeometry(0.08, 0.04);
    const labelMaterial = new THREE.MeshBasicMaterial({
      map: labelTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const label = new THREE.Mesh(labelGeometry, labelMaterial);
    label.position.copy(position.clone().normalize().multiplyScalar(1.18)); // 마커 위에 표시
    label.lookAt(this.scene.position);
    label.userData = { id: countryCode, type: 'policy-label' };
    
    // ▼ 5️⃣ 상태 표시 바 (정책 효과도)
    const barGeometry = new THREE.BoxGeometry(0.12, 0.008, 0.001);
    const effectiveness = this.getEffectiveness(status);
    const barColor = this.getEffectivenessColor(effectiveness);
    const barMaterial = new THREE.MeshBasicMaterial({
      color: barColor,
      transparent: true,
      opacity: 0.8,
      depthWrite: false
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.copy(position.clone().add(new THREE.Vector3(0, -0.08, 0)));
    bar.userData = { id: countryCode, type: 'policy-bar' };
    
    // 그룹에 모두 추가
    this.markerGroups.policies.add(marker);
    this.markerGroups.policies.add(halo);
    this.markerGroups.policies.add(aura);
    this.markerGroups.policies.add(label);
    this.markerGroups.policies.add(bar);
    
    // 마커 데이터 저장
    this.markerData.set(`policy-${countryCode}`, {
      mesh: marker,
      halo: halo,
      aura: aura,
      label: label,
      bar: bar,
      position: position,
      lat: lat,
      lon: lon,
      status: status,
      data: data,
      type: 'policy',
      effectiveness: effectiveness
    });
    
    return { marker, halo, aura, label, bar };
  }

  /**
   * 텍스트 라벨 생성 (캔버스 텍스처)
   */
  createTextTexture(text, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    
    const ctx = canvas.getContext('2d');
    
    // 배경 (반투명 검정)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.roundRect(10, 10, 236, 108, 8);
    ctx.fill();
    
    // 테두리
    const rgb = color.getHexString();
    ctx.strokeStyle = `#${rgb}`;
    ctx.lineWidth = 3;
    ctx.roundRect(10, 10, 236, 108, 8);
    ctx.stroke();
    
    // 텍스트
    ctx.fillStyle = `#${rgb}`;
    ctx.font = 'bold 40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    
    return texture;
  }

  /**
   * 정책 효과도 (0-100)
   */
  getEffectiveness(status) {
    const scores = {
      'Exemplary': 95,
      'Highly Effective': 85,
      'Effective': 70,
      'Partial Progress': 50,
      'Limited Progress': 30,
      'default': 50
    };
    return scores[status] || scores.default;
  }

  /**
   * 효과도에 따른 색상
   */
  getEffectivenessColor(effectiveness) {
    if (effectiveness >= 80) return new THREE.Color(0x00ff88); // 밝은 녹색
    if (effectiveness >= 60) return new THREE.Color(0x00dd66);
    if (effectiveness >= 40) return new THREE.Color(0xffaa00); // 주황
    return new THREE.Color(0xff6600); // 빨강
  }

  /**
   * 사용자 위치 마커
   */
  addUserLocationMarker(lat, lon) {
    const position = this.latLonToPosition(lat, lon, 1.15);
    
    // ▼ 별 모양 (노란색, 눈에 띔)
    const starGeometry = new THREE.TetrahedronGeometry(0.035, 0);
    const starMaterial = new THREE.MeshStandardMaterial({
      color: 0xffeb3b,
      emissive: 0xffeb3b,
      emissiveIntensity: 0.8,
      metalness: 0.8,
      roughness: 0.1
    });
    const star = new THREE.Mesh(starGeometry, starMaterial);
    star.position.copy(position);
    star.userData = { type: 'user-location' };
    
    // ▼ 펄싱 큰 링
    const pulseGeometry = new THREE.SphereGeometry(0.05, 32, 32);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      color: 0xffeb3b,
      transparent: true,
      opacity: 0.3,
      wireframe: false,
      depthWrite: false
    });
    const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
    pulse.position.copy(position);
    pulse.userData = { type: 'user-pulse' };
    
    this.markerGroups.users.add(star);
    this.markerGroups.users.add(pulse);
    
    this.markerData.set('user-location', {
      mesh: star,
      pulse: pulse,
      position: position,
      lat: lat,
      lon: lon,
      type: 'user'
    });
    
    return { star, pulse };
  }

  /**
   * 마커 제거
   */
  clearPM25Markers() {
    this.markerGroups.pm25.children.forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
      if (child.material?.map) child.material.map.dispose();
    });
    this.markerGroups.pm25.clear();
    
    for (let [key, value] of this.markerData) {
      if (value.type === 'pm25') {
        this.markerData.delete(key);
      }
    }
  }

  /**
   * 정책 마커 제거
   */
  clearPolicyMarkers() {
    this.markerGroups.policies.children.forEach(child => {
      child.geometry?.dispose();
      child.material?.dispose();
      if (child.material?.map) child.material.map.dispose();
    });
    this.markerGroups.policies.clear();
    
    for (let [key, value] of this.markerData) {
      if (value.type === 'policy') {
        this.markerData.delete(key);
      }
    }
  }

  /**
   * 마커 그룹 가시성
   */
  setMarkerGroupVisibility(groupName, visible) {
    if (this.markerGroups[groupName]) {
      this.markerGroups[groupName].visible = visible;
    }
  }

  /**
   * PM2.5 색상 (AQI 기준)
   */
  getAQIColor(value) {
    if (value <= 50) return new THREE.Color(0x00e400);   // 녹색
    if (value <= 100) return new THREE.Color(0xffff00);  // 노랑
    if (value <= 150) return new THREE.Color(0xff7e00);  // 주황
    if (value <= 200) return new THREE.Color(0xff0000);  // 빨강
    if (value <= 300) return new THREE.Color(0x8f3f97);  // 보라
    return new THREE.Color(0x7e1946);                     // 검붉음
  }

  /**
   * 정책 상태 색상 (매우 구분되도록)
   */
  getPolicyStatusColor(status) {
    const colors = {
      'Exemplary': 0x00ff88,          // 매우 밝은 녹색
      'Highly Effective': 0x00ff44,   // 밝은 녹색
      'Effective': 0x44ff00,          // 노란 녹색
      'Partial Progress': 0xffdd00,   // 밝은 노랑
      'Limited Progress': 0xff8800,   // 주황
      'default': 0xff4400             // 빨강
    };
    return new THREE.Color(colors[status] || colors.default);
  }

  /**
   * 애니메이션 업데이트 (매 프레임)
   */
  update(deltaTime) {
    this.markerData.forEach((markerData, id) => {
      if (markerData.type === 'user' && markerData.pulse) {
        // 사용자 마커 펄싱
        const scale = 1 + Math.sin(Date.now() * 0.003) * 0.3;
        markerData.pulse.scale.set(scale, scale, scale);
      }
      
      if (markerData.type === 'policy') {
        // 정책 마커 회전
        if (markerData.mesh) {
          markerData.mesh.rotation.x += markerData.mesh.userData.rotationSpeed;
          markerData.mesh.rotation.y += markerData.mesh.userData.rotationSpeed * 0.7;
          
          // 크기 변화 (숨쉬는 효과)
          const breathe = 1 + Math.sin(Date.now() * 0.002) * 0.15;
          markerData.mesh.scale.set(breathe * 1.5, breathe * 1.5, breathe * 1.5);
        }
        
        // 헤일로 회전
        if (markerData.halo) {
          markerData.halo.rotation.z += 0.005;
        }
        
        // 아우라 펄싱
        if (markerData.aura) {
          const auraPulse = 0.9 + Math.sin(Date.now() * 0.004) * 0.2;
          markerData.aura.scale.set(auraPulse, auraPulse, auraPulse);
        }
        
        // 라벨 항상 카메라 보기
        if (markerData.label && markerData.label.parent) {
          markerData.label.lookAt(0, 0, 0);
        }
      }
      
      // PM2.5 마커 가벼운 펄싱
      if (markerData.type === 'pm25' && markerData.ring) {
        const pulse = 1 + Math.sin(Date.now() * 0.001 + id.charCodeAt(0)) * 0.1;
        markerData.ring.scale.set(pulse, pulse, pulse);
      }
    });
  }

  /**
   * 마커 선택
   */
  selectMarker(id) {
    this.markerData.forEach(markerData => {
      if (markerData.mesh) {
        if (markerData.type === 'pm25') {
          markerData.mesh.material.emissiveIntensity = 0.2;
        } else if (markerData.type === 'policy') {
          markerData.mesh.material.emissiveIntensity = 0.6;
        }
      }
    });
    
    const selected = this.markerData.get(id) || this.markerData.get(`policy-${id}`);
    if (selected && selected.mesh) {
      selected.mesh.material.emissiveIntensity = 
        selected.type === 'pm25' ? 0.8 : 1.0;
    }
  }

  /**
   * 모두 선택 해제
   */
  deselectAll() {
    this.markerData.forEach(markerData => {
      if (markerData.mesh) {
        markerData.mesh.material.emissiveIntensity = 
          markerData.type === 'pm25' ? 0.2 : 0.6;
      }
    });
  }
}
