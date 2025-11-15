/**
 * 간단한 정책 마커 시스템 - 복잡도 제거
 * 
 * 문제 해결:
 * 1. "아이콘 날라다니기" 문제 - 마커 위치 계산 제거
 * 2. 렌더링 문제 - 정책 패널에 집중
 * 3. 초기화 문제 - 간단한 구조
 */

class SimplePolicyMarkerSystem {
    constructor() {
        console.log('✅ Simple Policy Marker System initialized');
    }

    /**
     * 정책 패널 업데이트 (마커 없음 - 글로브 클릭으로 패널 표시)
     */
    updatePolicyPanel(policy) {
        if (!policy) return;

        try {
            // 현재 정책 저장 (View Full Details 버튼에서 사용)
            window.currentPolicy = policy;

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
                'Germany': '🇩🇪',
                'USA': '🇺🇸',
                'Canada': '🇨🇦',
                'Mexico': '🇲🇽',
                'France': '🇫🇷',
                'Germany': '🇩🇪',
                'Italy': '🇮🇹',
                'Spain': '🇪🇸',
                'Russia': '🇷🇺',
                'Brazil': '🇧🇷'
            };

            const countryName = policy.country || policy.name;
            const flag = flags[countryName] || '🌍';

            // DOM 업데이트
            const flagEl = document.getElementById('policy-flag');
            if (flagEl) flagEl.textContent = flag;

            const countryEl = document.getElementById('policy-country');
            if (countryEl) countryEl.textContent = countryName;

            const regionEl = document.getElementById('policy-region');
            if (regionEl) regionEl.textContent = policy.region || policy.authority || '';

            const nameEl = document.getElementById('policy-name');
            if (nameEl) nameEl.textContent = policy.title || 'Policy';

            const descEl = document.getElementById('policy-desc');
            if (descEl) descEl.textContent = policy.description || 'No description available';

            const dateEl = document.getElementById('policy-date');
            if (dateEl) {
                const date = policy.implementationYear 
                    ? `Year: ${policy.implementationYear}`
                    : (policy.target_year ? `Target: ${policy.target_year}` : 'Date N/A');
                dateEl.textContent = date;
            }

            // View Full Details 버튼 상태
            const viewMoreBtn = document.getElementById('view-more-btn');
            if (viewMoreBtn) {
                if (policy.url) {
                    viewMoreBtn.style.opacity = '1';
                    viewMoreBtn.style.pointerEvents = 'auto';
                    viewMoreBtn.title = `Visit: ${policy.url}`;
                } else {
                    viewMoreBtn.style.opacity = '0.5';
                    viewMoreBtn.style.pointerEvents = 'none';
                    viewMoreBtn.title = 'No URL available';
                }
            }

            // 패널 표시
            policyCard.style.display = 'block';
            policyCard.classList.add('show');

            console.log(`✅ Policy panel updated: ${countryName}`);
        } catch (error) {
            console.error('❌ Error updating policy panel:', error);
        }
    }

    /**
     * 정책 패널 닫기
     */
    closePanel() {
        const policyCard = document.getElementById('policy-card');
        if (policyCard) {
            policyCard.classList.remove('show');
            setTimeout(() => {
                policyCard.style.display = 'none';
            }, 300);
        }
        window.currentPolicy = null;
    }
}

// 전역 인스턴스 생성
window.policyMarkerSystem = new SimplePolicyMarkerSystem();

export default SimplePolicyMarkerSystem;
