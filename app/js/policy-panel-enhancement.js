/**
 * Policy Panel Visual Enhancement - Policy 패널의 시각적 개선사항
 * globe.js의 displayCountryPolicy() 메서드에 추가할 코드
 */

// 🆕 정책 효과도 표시 (Policy 패널에 추가)
displayCountryPolicyEnhanced(policy) {
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

    // ▼ 정책 효과도 바 표시
    const effectiveness = this.calculatePolicyEffectiveness(policy);
    const effectivenessBar = document.getElementById('policy-effectiveness-bar');
    if (effectivenessBar) {
      effectivenessBar.style.width = `${effectiveness}%`;
      effectivenessBar.style.background = this.getEffectivenessGradient(effectiveness);
    }
    
    const effectivenessPercent = document.getElementById('policy-effectiveness-percent');
    if (effectivenessPercent) {
      effectivenessPercent.textContent = `${effectiveness}%`;
      effectivenessPercent.style.color = this.getEffectivenessColor(effectiveness);
    }

    // ▼ PM2.5 데이터 표시
    const stations = Array.from(this.globalDataService.getStations().values())
      .filter(s => s.country?.toLowerCase() === countryName?.toLowerCase());

    if (stations.length > 0) {
      const avgPM25 = stations.reduce((sum, s) => sum + (s.pm25 || 0), 0) / stations.length;
      document.getElementById('policy-pm25').textContent = 
        (Math.round(avgPM25 * 10) / 10).toFixed(1);
      document.getElementById('policy-aqi').textContent = this.getAQIStatus(avgPM25);
      
      // ▼ PM2.5 상태 색상
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

/**
 * 정책 효과도 계산 (0-100)
 */
calculatePolicyEffectiveness(policy) {
  let score = 50; // 기본 점수

  // 정책 상태에 따른 점수
  const statusScores = {
    'Exemplary': 95,
    'Highly Effective': 85,
    'Effective': 70,
    'Partial Progress': 50,
    'Limited Progress': 30
  };
  
  if (policy.status) {
    score = statusScores[policy.status] || 50;
  }

  // 이행 연도에 따른 조정 (최근 정책일수록 높은 점수)
  if (policy.implementationYear) {
    const yearsAgo = new Date().getFullYear() - policy.implementationYear;
    if (yearsAgo < 5) {
      score += (5 - yearsAgo) * 2;
    }
  }

  // PM2.5 감소량에 따른 조정
  if (policy.pm25Reduction) {
    const reductionBonus = Math.min(10, policy.pm25Reduction / 10);
    score += reductionBonus;
  }

  return Math.min(100, Math.round(score));
}

/**
 * 효과도에 따른 그래디언트 색상
 */
getEffectivenessGradient(effectiveness) {
  if (effectiveness >= 85) {
    return 'linear-gradient(90deg, #00ff88 0%, #00dd66 100%)'; // 녹색
  } else if (effectiveness >= 70) {
    return 'linear-gradient(90deg, #44ff00 0%, #00ff88 100%)'; // 노란 녹색
  } else if (effectiveness >= 50) {
    return 'linear-gradient(90deg, #ffdd00 0%, #ffaa00 100%)'; // 노랑 주황
  } else if (effectiveness >= 30) {
    return 'linear-gradient(90deg, #ff8800 0%, #ff6600 100%)'; // 주황
  } else {
    return 'linear-gradient(90deg, #ff4400 0%, #ff0000 100%)'; // 빨강
  }
}

/**
 * 효과도에 따른 텍스트 색상
 */
getEffectivenessColor(effectiveness) {
  if (effectiveness >= 85) return '#00ff88';
  if (effectiveness >= 70) return '#44ff00';
  if (effectiveness >= 50) return '#ffdd00';
  if (effectiveness >= 30) return '#ff8800';
  return '#ff4400';
}

/**
 * PM2.5 값에 따른 색상
 */
getPM25StatusColor(value) {
  if (value <= 50) return '#00e400';   // 녹색
  if (value <= 100) return '#ffff00';  // 노랑
  if (value <= 150) return '#ff7e00';  // 주황
  if (value <= 200) return '#ff0000';  // 빨강
  if (value <= 300) return '#8f3f97';  // 보라
  return '#7e1946';                    // 검붉음
}

/**
 * AQI 상태 텍스트
 */
getAQIStatus(value) {
  if (value <= 50) return 'Good';
  if (value <= 100) return 'Moderate';
  if (value <= 150) return 'Unhealthy for Sensitive Groups';
  if (value <= 200) return 'Unhealthy';
  if (value <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}
