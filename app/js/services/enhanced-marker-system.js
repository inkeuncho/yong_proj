/**
 * Enhanced Marker System - 시각적으로 구분된 마커
 * 
 * 🎯 목표: 정책 마커를 주요 포커스, PM2.5 마커를 배경 정보로 표현
 * 
 * 마커 계층 구조:
 * - Policy Markers (주요) - 크고 화려한 애니메이션
 * - PM2.5 Markers (보조) - 작고 부드러운 애니메이션
 * - User Location (강조) - 중간 크기
 */

import * as THREE from 'three';

export class EnhancedMarkerSystem {
  constructor(scene, earth) {
    this.scene = scene;
    this.earth = earth;
    
    // Marker storage
    this.pm25Markers = new Map(); // ID → Marker object
    this.policyMarkers = new Map(); // Country → Marker object
    this.markerGroups = {
      pm25: new THREE.Group(),      // PM2.5 마커 그룹
      policies: new THREE.Group(),  // 정책 마커 그룹
      user: null                     // 사용자 위치
    };
    
    // 🔍 마커 그룹 이름 설정 (디버깅용)
    this.markerGroups.pm25.name = 'PM25-Markers';
    this.markerGroups.policies.name = 'Policy-Markers';
    
    // Scene 추가
    this.earth.add(this.markerGroups.pm25);
    this.earth.add(this.markerGroups.policies);
    
    // 🔍 디버깅: 마커 그룹이 씬에 추가되었는지 확인
    console.log('✅ Marker groups created and added to earth');
    console.log('  - PM25 group:', this.markerGroups.pm25);
    console.log('  - Policy group:', this.markerGroups.policies);
    console.log('  - Earth children count:', this.earth.children.length);
    
    // Animation tracking
    this.animationFrameIndex = 0;
    this.materials = {
      pm25: new Map(),
      policies: new Map()
    };
  }

  /**
   * PM2.5 마커 생성 (배경 역할)
   * ➤ 작은 크기 (0.01 반지름)
   * ➤ 반투명 (60% 투명도)
   * ➤ 부드러운 펄싱 애니메이션
   */
  createPM25Marker(data) {
    const { id, latitude, longitude, pm25, country } = data;

    // ================================
    // 점에서 빛나는 효과 (Glowing Dot Style)
    // ================================
    const markerRadius = 0.008;
    const color = this.getPM25Color(pm25);

    // 1️⃣ 메인 구체 (중심 점)
    const sphereGeometry = new THREE.SphereGeometry(markerRadius, 12, 12);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.8,
      roughness: 0.2,
      emissive: color,
      emissiveIntensity: 0.8,
      wireframe: false,
      opacity: 1,
      transparent: false
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.userData = { type: 'pm25', id, pm25, country };

    // 2️⃣ 글로우 구 (빛나는 아우라)
    const glowGeometry = new THREE.SphereGeometry(markerRadius * 1.5, 12, 12);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: color,
      opacity: 0.3,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

    // ================================
    // 그룹 생성
    // ================================
    const markerGroup = new THREE.Group();
    markerGroup.add(sphere);
    markerGroup.add(glowMesh);
    markerGroup.add(light);

    // 위치 설정 (지구 표면)
    const position = this.latLonToPosition(latitude, longitude);
    markerGroup.position.copy(position);

    // 지구를 향하게 회전
    markerGroup.lookAt(this.earth.position.clone().add(position));

    // 그룹에 추가
    this.markerGroups.pm25.add(markerGroup);

    // 저장
    this.pm25Markers.set(id, {
      group: markerGroup,
      sphere: sphere,
      glow: glowMesh,
      light: light,
      data: data,
      time: 0,
      sphereMaterial: sphereMaterial,
      glowMaterial: glowMaterial
    });

    return markerGroup;
  }

  /**
   * 정책 마커 생성 (주요 포커스)
   * ➤ 큰 크기 (0.075 반지름)
   * ➤ 5가지 시각 요소
   * ➤ 화려한 애니메이션 (회전, 호흡, 헤일로)
   */
  createPolicyMarker(data) {
    const { country, effectivenessScore = 0.5 } = data;
    
    // ================================
    // 1️⃣ 팔각형 메인 마커 (Octahedron)
    // ================================
    const mainSize = 0.075;
    const octaGeometry = new THREE.OctahedronGeometry(mainSize, 2);
    const policyColor = this.getPolicyColor(effectivenessScore);
    const octaMaterial = new THREE.MeshStandardMaterial({
      color: policyColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: policyColor,
      emissiveIntensity: 0.4,
      wireframe: false
    });
    const octahedron = new THREE.Mesh(octaGeometry, octaMaterial);
    
    // ================================
    // 2️⃣ 회전 헤일로 (Torus)
    // ================================
    const haloGeometry = new THREE.TorusGeometry(mainSize * 1.6, mainSize * 0.15, 16, 100);
    const haloMaterial = new THREE.MeshStandardMaterial({
      color: policyColor,
      metalness: 0.6,
      roughness: 0.4,
      emissive: policyColor,
      emissiveIntensity: 0.3,
      opacity: 0.6,
      transparent: true
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.set(Math.PI / 4, 0, 0);
    
    // ================================
    // 3️⃣ 펄싱 아우라 (Sphere with scale animation)
    // ================================
    const auraGeometry = new THREE.SphereGeometry(mainSize * 0.8, 16, 16);
    const auraMaterial = new THREE.MeshStandardMaterial({
      color: policyColor,
      metalness: 0,
      roughness: 1,
      emissive: policyColor,
      emissiveIntensity: 0.2,
      opacity: 0.2,
      transparent: true
    });
    const aura = new THREE.Mesh(auraGeometry, auraMaterial);
    
    // ================================
    // 4️⃣ 국가 라벨 (Canvas Texture)
    // ================================
    const labelSprite = this.createCountryLabel(country, policyColor);
    labelSprite.scale.set(0.3, 0.15, 1);
    labelSprite.position.z = mainSize * 1.5;
    
    // ================================
    // 5️⃣ 효과도 표시 바 (Bar visualization)
    // ================================
    const barGroup = this.createEffectivenessBar(effectivenessScore, policyColor);
    barGroup.position.z = -mainSize * 1.2;
    
    // ================================
    // 그룹 생성
    // ================================
    const markerGroup = new THREE.Group();
    markerGroup.add(octahedron);
    markerGroup.add(halo);
    markerGroup.add(aura);
    markerGroup.add(labelSprite);
    markerGroup.add(barGroup);
    
    // 위치 설정
    const latitude = data.latitude || 37.5;
    const longitude = data.longitude || 126.9;
    const position = this.latLonToPosition(latitude, longitude);
    markerGroup.position.copy(position);
    
    // 지구를 향하게 회전
    markerGroup.lookAt(this.earth.position.clone().add(position));
    
    // 그룹에 추가
    this.markerGroups.policies.add(markerGroup);
    
    // 저장
    this.policyMarkers.set(country, {
      group: markerGroup,
      octahedron: octahedron,
      halo: halo,
      aura: aura,
      labelSprite: labelSprite,
      barGroup: barGroup,
      data: data,
      time: 0,
      octaMaterial: octaMaterial,
      halMaterial: haloMaterial,
      auraMaterial: auraMaterial
    });
    
    return markerGroup;
  }

  /**
   * 국가 라벨 생성 (Canvas Texture)
   */
  createCountryLabel(countryCode, color) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    
    // 배경
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 테두리
    ctx.strokeStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // 텍스트
    ctx.fillStyle = `rgb(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(color.b * 255)})`;
    ctx.font = 'Bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countryCode, canvas.width / 2, canvas.height / 2);
    
    // Texture 생성
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    
    return sprite;
  }

  /**
   * 효과도 표시 바 생성
   */
  createEffectivenessBar(effectiveness, color) {
    const group = new THREE.Group();
    
    // 배경 바
    const bgGeometry = new THREE.BoxGeometry(0.1, 0.015, 0.01);
    const bgMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      metalness: 0.5,
      roughness: 0.5,
      opacity: 0.5,
      transparent: true
    });
    const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
    group.add(bgBar);
    
    // 진행 바 (효과도 기반)
    const barWidth = 0.1 * Math.max(0.1, effectiveness);
    const barGeometry = new THREE.BoxGeometry(barWidth, 0.012, 0.015);
    const barMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.7,
      roughness: 0.3,
      emissive: color,
      emissiveIntensity: 0.5
    });
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    bar.position.x = (barWidth - 0.1) / 2;
    group.add(bar);
    
    return group;
  }

  /**
   * PM2.5 마커 업데이트 (애니메이션)
   * ➤ 부드러운 펄싱
   * ➤ 약한 회전
   */
  updatePM25Marker(id, deltaTime = 0.016) {
    const marker = this.pm25Markers.get(id);
    if (!marker) return;

    // 시간 누적
    marker.time += deltaTime;

    // ✨ 글로우 스케일 변화 (펄싱 효과)
    const glowScale = 1.4 + Math.sin(marker.time * 2.5) * 0.3;
    marker.glow.scale.set(glowScale, glowScale, glowScale);

    // 글로우 투명도 변화
    const glowOpacity = 0.2 + Math.sin(marker.time * 2.5) * 0.15;
    marker.glowMaterial.opacity = glowOpacity;

    // 빛의 세기 변화
    marker.light.intensity = 0.4 + Math.sin(marker.time * 2) * 0.3;
  }

  /**
   * 정책 마커 업데이트 (화려한 애니메이션)
   * ➤ 빠른 회전 (헤일로)
   * ➤ 호흡 효과 (아우라)
   * ➤ 스케일 변화 (팔각형)
   */
  updatePolicyMarker(country, deltaTime = 0.016) {
    const marker = this.policyMarkers.get(country);
    if (!marker) return;
    
    // 시간 누적
    marker.time += deltaTime;
    
    // 🔄 헤일로 회전 (빠른 속도)
    marker.halo.rotation.z += deltaTime * 1.5;
    marker.halo.rotation.x += deltaTime * 0.7;
    
    // 💨 아우라 호흡 (1.5 ~ 2.5 스케일)
    const breathScale = 1.8 + Math.sin(marker.time * 2.5) * 0.7;
    marker.aura.scale.set(breathScale, breathScale, breathScale);
    
    // 팔각형 회전 (느린 속도)
    marker.octahedron.rotation.x += deltaTime * 0.3;
    marker.octahedron.rotation.y += deltaTime * 0.5;
    
    // 팔각형 스케일 변화 (미묘한 수축 확대)
    const scaleVariation = 1.0 + Math.sin(marker.time * 1.5) * 0.1;
    marker.octahedron.scale.set(scaleVariation, scaleVariation, scaleVariation);
    
    // 전체 그룹 부드러운 상하 진동
    const bobHeight = Math.sin(marker.time * 2) * 0.005;
    marker.group.position.y += bobHeight;
  }

  /**
   * 모든 마커 업데이트
   */
  updateAll(deltaTime = 0.016) {
    // PM2.5 마커 업데이트
    for (const [id, marker] of this.pm25Markers) {
      this.updatePM25Marker(id, deltaTime);
    }
    
    // 정책 마커 업데이트
    for (const [country, marker] of this.policyMarkers) {
      this.updatePolicyMarker(country, deltaTime);
    }
  }

  /**
   * 위도/경도를 3D 위치로 변환
   */
  latLonToPosition(latitude, longitude) {
    const radius = 1;
    const lat = THREE.MathUtils.degToRad(latitude);
    const lon = THREE.MathUtils.degToRad(longitude);
    
    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * PM2.5 값 기반 색상 (AQI)
   */
  getPM25Color(pm25) {
    if (pm25 <= 50) return new THREE.Color(0x00e400);      // 녹색
    if (pm25 <= 100) return new THREE.Color(0xffff00);     // 노랑
    if (pm25 <= 150) return new THREE.Color(0xff7e00);     // 주황
    if (pm25 <= 200) return new THREE.Color(0xff0000);     // 빨강
    return new THREE.Color(0x8f3f97);                       // 보라
  }

  /**
   * 정책 효과도 기반 색상
   */
  getPolicyColor(effectiveness) {
    // 효과도에 따라 색상 변화 (녹색 ~ 노랑 ~ 주황)
    if (effectiveness >= 0.8) {
      return new THREE.Color(0x00ff88);    // 매우 밝은 녹색
    } else if (effectiveness >= 0.6) {
      return new THREE.Color(0x00ff44);    // 밝은 녹색
    } else if (effectiveness >= 0.4) {
      return new THREE.Color(0x44ff00);    // 노란 녹색
    } else if (effectiveness >= 0.2) {
      return new THREE.Color(0xffdd00);    // 밝은 노랑
    } else {
      return new THREE.Color(0xff8800);    // 주황
    }
  }

  /**
   * 마커 제거
   */
  removePM25Marker(id) {
    const marker = this.pm25Markers.get(id);
    if (marker) {
      this.markerGroups.pm25.remove(marker.group);
      this.pm25Markers.delete(id);
    }
  }

  removePolicyMarker(country) {
    const marker = this.policyMarkers.get(country);
    if (marker) {
      this.markerGroups.policies.remove(marker.group);
      this.policyMarkers.delete(country);
    }
  }

  /**
   * 모든 마커 제거
   */
  clearAll() {
    this.pm25Markers.clear();
    this.policyMarkers.clear();
    this.markerGroups.pm25.clear();
    this.markerGroups.policies.clear();
  }

  /**
   * 위도/경도를 3D 위치로 변환
   * @param {number} latitude - 위도 (-90 ~ 90)
   * @param {number} longitude - 경도 (-180 ~ 180)
   * @returns {THREE.Vector3} 3D 위치
   */
  latLonToPosition(latitude, longitude) {
    const radius = 1.01; // 지구 표면에서 약간 떨어진 위치
    const phi = (90 - latitude) * (Math.PI / 180); // 위도를 래디안으로
    const theta = (longitude + 180) * (Math.PI / 180); // 경도를 래디안으로

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new THREE.Vector3(x, y, z);
  }

  /**
   * PM2.5 값을 색상으로 변환
   */
  getPM25Color(pm25) {
    if (pm25 <= 12) return new THREE.Color(0x00e400); // 녹색
    if (pm25 <= 35.5) return new THREE.Color(0xffff00); // 노랑
    if (pm25 <= 55.5) return new THREE.Color(0xff7e00); // 주황
    if (pm25 <= 150.5) return new THREE.Color(0xff0000); // 빨강
    return new THREE.Color(0x8f3f97); // 자주색
  }

  /**
   * 효과도 점수를 색상으로 변환
   */
  getPolicyColor(score) {
    const clampedScore = Math.max(0, Math.min(1, score));
    
    if (clampedScore >= 0.8) return new THREE.Color(0x00ff88); // 밝은 녹색
    if (clampedScore >= 0.6) return new THREE.Color(0x00dd66); // 녹색
    if (clampedScore >= 0.4) return new THREE.Color(0x44cc88); // 연한 녹색
    if (clampedScore >= 0.2) return new THREE.Color(0xffaa00); // 주황
    return new THREE.Color(0xff6600); // 빨강
  }
}

export default EnhancedMarkerSystem;
