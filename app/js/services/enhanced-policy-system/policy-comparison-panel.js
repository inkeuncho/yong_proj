/**
 * Policy Comparison UI Component
 * 정책 전후 비교를 위한 사용자 인터페이스
 */

export class PolicyComparisonPanel {
  constructor(containerElement) {
    this.container = containerElement || document.getElementById('policy-comparison-panel');
    this.selectedPolicy = null;
    this.comparisonChart = null;
    
    // Chart.js가 로드되었는지 확인
    this.chartLibLoaded = typeof Chart !== 'undefined';
    
    this.createPanel();
  }

  /**
   * 비교 패널 생성
   */
  createPanel() {
    if (!this.container) {
      // 컨테이너가 없으면 생성
      this.container = document.createElement('div');
      this.container.id = 'policy-comparison-panel';
      document.body.appendChild(this.container);
    }

    this.container.innerHTML = `
      <div class="policy-comparison-container">
        <!-- 헤더 -->
        <div class="panel-header">
          <h3 class="panel-title">
            <span class="icon">📊</span>
            정책 효과 비교 분석
          </h3>
          <button class="close-btn" id="close-comparison-panel">×</button>
        </div>

        <!-- 정책 정보 -->
        <div class="policy-info-section">
          <div class="policy-title" id="policy-title">정책을 선택하세요</div>
          <div class="policy-country" id="policy-country"></div>
          <div class="policy-date" id="policy-date"></div>
        </div>

        <!-- 개선율 표시 -->
        <div class="improvement-display">
          <div class="improvement-metric">
            <div class="metric-label">PM2.5 개선율</div>
            <div class="metric-value" id="improvement-rate">
              <span class="value">--</span>
              <span class="unit">%</span>
            </div>
            <div class="metric-trend" id="improvement-trend"></div>
          </div>
          
          <div class="improvement-metric">
            <div class="metric-label">시행 전</div>
            <div class="metric-value before" id="before-value">
              <span class="value">--</span>
              <span class="unit">μg/m³</span>
            </div>
          </div>
          
          <div class="improvement-metric">
            <div class="metric-label">시행 후</div>
            <div class="metric-value after" id="after-value">
              <span class="value">--</span>
              <span class="unit">μg/m³</span>
            </div>
          </div>
        </div>

        <!-- 차트 영역 -->
        <div class="chart-container">
          <canvas id="comparison-chart"></canvas>
        </div>

        <!-- 타임라인 -->
        <div class="timeline-section">
          <h4>시간별 변화 추이</h4>
          <div class="timeline-container" id="timeline-container">
            <!-- 타임라인 동적 생성 -->
          </div>
        </div>

        <!-- 추가 정보 -->
        <div class="additional-info">
          <div class="info-card">
            <div class="info-label">영향 지역</div>
            <div class="info-value" id="affected-areas">--</div>
          </div>
          <div class="info-card">
            <div class="info-label">정책 유형</div>
            <div class="info-value" id="policy-type">--</div>
          </div>
          <div class="info-card">
            <div class="info-label">신뢰도</div>
            <div class="info-value" id="confidence-level">--</div>
          </div>
        </div>

        <!-- 액션 버튼 -->
        <div class="panel-actions">
          <button class="action-btn primary" id="view-details-btn">
            상세 보기
          </button>
          <button class="action-btn secondary" id="compare-others-btn">
            다른 정책과 비교
          </button>
        </div>
      </div>
    `;

    this.attachEventListeners();
    this.applyStyles();
  }

  /**
   * 스타일 적용
   */
  applyStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #policy-comparison-panel {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 400px;
        max-height: 80vh;
        background: rgba(16, 33, 34, 0.95);
        backdrop-filter: blur(10px);
        border-radius: 16px;
        border: 1px solid rgba(37, 226, 244, 0.3);
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        z-index: 1000;
        overflow: hidden;
        transition: all 0.3s ease;
      }

      .policy-comparison-container {
        height: 100%;
        overflow-y: auto;
        padding: 24px;
      }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 1px solid rgba(37, 226, 244, 0.2);
        padding-bottom: 15px;
      }

      .panel-title {
        font-size: 20px;
        font-weight: 600;
        color: #25e2f4;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .close-btn {
        background: none;
        border: none;
        color: #8c9fa2;
        font-size: 28px;
        cursor: pointer;
        transition: color 0.2s;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .close-btn:hover {
        color: #25e2f4;
      }

      .policy-info-section {
        margin-bottom: 20px;
      }

      .policy-title {
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        margin-bottom: 8px;
      }

      .policy-country,
      .policy-date {
        font-size: 14px;
        color: #8c9fa2;
      }

      .improvement-display {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 15px;
        margin-bottom: 25px;
      }

      .improvement-metric {
        background: rgba(37, 226, 244, 0.1);
        border-radius: 12px;
        padding: 15px;
        text-align: center;
        border: 1px solid rgba(37, 226, 244, 0.2);
      }

      .metric-label {
        font-size: 12px;
        color: #8c9fa2;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .metric-value {
        font-size: 24px;
        font-weight: 700;
        color: #25e2f4;
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 4px;
      }

      .metric-value.before {
        color: #ff6b6b;
      }

      .metric-value.after {
        color: #51cf66;
      }

      .metric-value .unit {
        font-size: 14px;
        color: #8c9fa2;
        font-weight: 400;
      }

      .metric-trend {
        margin-top: 5px;
        font-size: 12px;
      }

      .metric-trend.positive {
        color: #51cf66;
      }

      .metric-trend.negative {
        color: #ff6b6b;
      }

      .chart-container {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 12px;
        padding: 15px;
        margin-bottom: 20px;
        height: 200px;
      }

      .timeline-section {
        margin-bottom: 20px;
      }

      .timeline-section h4 {
        font-size: 14px;
        color: #25e2f4;
        margin-bottom: 10px;
      }

      .timeline-container {
        position: relative;
        padding: 10px 0;
      }

      .additional-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-bottom: 20px;
      }

      .info-card {
        background: rgba(0, 0, 0, 0.3);
        border-radius: 8px;
        padding: 10px;
        text-align: center;
      }

      .info-label {
        font-size: 11px;
        color: #8c9fa2;
        margin-bottom: 5px;
      }

      .info-value {
        font-size: 14px;
        color: #ffffff;
        font-weight: 600;
      }

      .panel-actions {
        display: flex;
        gap: 10px;
      }

      .action-btn {
        flex: 1;
        padding: 12px;
        border-radius: 8px;
        border: none;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }

      .action-btn.primary {
        background: #25e2f4;
        color: #102122;
      }

      .action-btn.primary:hover {
        background: #1bc8d8;
      }

      .action-btn.secondary {
        background: rgba(37, 226, 244, 0.2);
        color: #25e2f4;
        border: 1px solid rgba(37, 226, 244, 0.3);
      }

      .action-btn.secondary:hover {
        background: rgba(37, 226, 244, 0.3);
      }

      /* 애니메이션 */
      @keyframes slideIn {
        from {
          transform: translateX(100%) translateY(-50%);
        }
        to {
          transform: translateX(0) translateY(-50%);
        }
      }

      .panel-show {
        animation: slideIn 0.3s ease;
      }

      /* 스크롤바 스타일 */
      .policy-comparison-container::-webkit-scrollbar {
        width: 6px;
      }

      .policy-comparison-container::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
      }

      .policy-comparison-container::-webkit-scrollbar-thumb {
        background: rgba(37, 226, 244, 0.5);
        border-radius: 3px;
      }

      .policy-comparison-container::-webkit-scrollbar-thumb:hover {
        background: rgba(37, 226, 244, 0.8);
      }
    `;

    if (!document.getElementById('policy-comparison-styles')) {
      style.id = 'policy-comparison-styles';
      document.head.appendChild(style);
    }
  }

  /**
   * 이벤트 리스너 연결
   */
  attachEventListeners() {
    // 닫기 버튼
    const closeBtn = document.getElementById('close-comparison-panel');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.hide());
    }

    // 상세 보기 버튼
    const detailsBtn = document.getElementById('view-details-btn');
    if (detailsBtn) {
      detailsBtn.addEventListener('click', () => this.viewDetails());
    }

    // 다른 정책과 비교 버튼
    const compareBtn = document.getElementById('compare-others-btn');
    if (compareBtn) {
      compareBtn.addEventListener('click', () => this.compareWithOthers());
    }
  }

  /**
   * 정책 데이터 업데이트
   */
  updatePolicyData(policyData) {
    this.selectedPolicy = policyData;
    
    // 정책 정보 업데이트
    document.getElementById('policy-title').textContent = policyData.title || '정책명 없음';
    document.getElementById('policy-country').textContent = `🌍 ${policyData.country || ''}`;
    document.getElementById('policy-date').textContent = `📅 시행일: ${policyData.implementation_date || ''}`;
    
    // 전후 비교 데이터가 있는 경우
    if (policyData.comparison) {
      this.updateComparisonData(policyData.comparison);
    }
    
    // 추가 정보 업데이트
    document.getElementById('affected-areas').textContent = policyData.affected_areas || '--';
    document.getElementById('policy-type').textContent = policyData.type || '--';
    document.getElementById('confidence-level').textContent = policyData.confidence || '--';
    
    // 패널 표시
    this.show();
  }

  /**
   * 비교 데이터 업데이트
   */
  updateComparisonData(comparison) {
    const beforeValue = comparison.before_pm25 || 0;
    const afterValue = comparison.after_pm25 || 0;
    const improvement = ((beforeValue - afterValue) / beforeValue * 100).toFixed(1);
    
    // 개선율 표시
    const improvementRate = document.getElementById('improvement-rate');
    improvementRate.querySelector('.value').textContent = Math.abs(improvement);
    
    // 트렌드 표시
    const trendElement = document.getElementById('improvement-trend');
    if (improvement > 0) {
      trendElement.textContent = '↓ 개선됨';
      trendElement.className = 'metric-trend positive';
    } else if (improvement < 0) {
      trendElement.textContent = '↑ 악화됨';
      trendElement.className = 'metric-trend negative';
    } else {
      trendElement.textContent = '→ 변화 없음';
      trendElement.className = 'metric-trend';
    }
    
    // 전후 값 표시
    document.getElementById('before-value').querySelector('.value').textContent = beforeValue.toFixed(1);
    document.getElementById('after-value').querySelector('.value').textContent = afterValue.toFixed(1);
    
    // 차트 업데이트
    if (this.chartLibLoaded) {
      this.updateChart(comparison);
    }
    
    // 타임라인 업데이트
    this.updateTimeline(comparison.timeline);
  }

  /**
   * 차트 업데이트
   */
  updateChart(comparison) {
    const ctx = document.getElementById('comparison-chart');
    if (!ctx) return;
    
    // 기존 차트가 있으면 제거
    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }
    
    // 새 차트 생성
    this.comparisonChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['시행 전', '시행 후'],
        datasets: [{
          label: 'PM2.5 (μg/m³)',
          data: [comparison.before_pm25, comparison.after_pm25],
          backgroundColor: [
            'rgba(255, 107, 107, 0.8)',
            'rgba(81, 207, 102, 0.8)'
          ],
          borderColor: [
            'rgba(255, 107, 107, 1)',
            'rgba(81, 207, 102, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#25e2f4',
            bodyColor: '#ffffff',
            borderColor: 'rgba(37, 226, 244, 0.5)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            },
            ticks: {
              color: '#8c9fa2'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#8c9fa2'
            }
          }
        }
      }
    });
  }

  /**
   * 타임라인 업데이트
   */
  updateTimeline(timelineData) {
    const container = document.getElementById('timeline-container');
    if (!container || !timelineData) return;
    
    container.innerHTML = timelineData.map(point => `
      <div class="timeline-point">
        <div class="timeline-date">${point.date}</div>
        <div class="timeline-value">${point.pm25} μg/m³</div>
      </div>
    `).join('');
  }

  /**
   * 패널 표시
   */
  show() {
    this.container.style.display = 'block';
    this.container.classList.add('panel-show');
  }

  /**
   * 패널 숨기기
   */
  hide() {
    this.container.style.display = 'none';
    this.container.classList.remove('panel-show');
  }

  /**
   * 상세 보기
   */
  viewDetails() {
    if (this.selectedPolicy) {
      window.dispatchEvent(new CustomEvent('viewPolicyDetails', {
        detail: this.selectedPolicy
      }));
    }
  }

  /**
   * 다른 정책과 비교
   */
  compareWithOthers() {
    window.dispatchEvent(new CustomEvent('comparePolicies', {
      detail: this.selectedPolicy
    }));
  }
}
