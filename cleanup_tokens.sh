#!/bin/bash

# 토큰 제거 스크립트
# Git 히스토리에서 민감한 정보를 완전히 삭제합니다

set -e

REPO_PATH="/Users/joymin/Coding_proj/Finedust_proj"

echo "🔒 Git 히스토리에서 민감한 정보 제거 시작..."
echo ""

cd "$REPO_PATH"

# 1. 현재 상태 확인
echo "📊 현재 상태:"
git status
echo ""

# 2. 원격 저장소 정보 저장
REMOTE_URL=$(git remote get-url origin)
echo "📡 원격 저장소: $REMOTE_URL"
echo ""

# 3. git-filter-repo로 config.js 파일 히스토리에서 완전 삭제
echo "🗑️  js/config.js 파일을 Git 히스토리에서 완전히 제거 중..."
echo ""

git filter-repo --path js/config.js --invert-paths --force

echo "✅ js/config.js가 모든 커밋에서 제거되었습니다"
echo ""

# 4. 원격 저장소 재설정 (filter-repo가 제거함)
echo "🔗 원격 저장소 재연결 중..."
git remote add origin "$REMOTE_URL"
echo "✅ 원격 저장소 재연결 완료"
echo ""

# 5. .gitignore에 config.js 추가 (아직 없다면)
if ! grep -q "js/config.js" .gitignore 2>/dev/null; then
    echo "📝 .gitignore에 js/config.js 추가..."
    echo "" >> .gitignore
    echo "# API Configuration (contains sensitive tokens)" >> .gitignore
    echo "js/config.js" >> .gitignore
    git add .gitignore
    git commit -m "security: Add js/config.js to .gitignore"
    echo "✅ .gitignore 업데이트 완료"
else
    echo "✅ js/config.js는 이미 .gitignore에 있습니다"
fi
echo ""

# 6. config.js 예제 파일 생성
echo "📄 js/config.js.example 생성 중..."
cat > js/config.js.example << 'EOF'
/**
 * API Configuration Template
 * 
 * INSTRUCTIONS:
 * 1. Copy this file to js/config.js
 * 2. Replace 'YOUR_TOKEN_HERE' with your actual API tokens
 * 3. js/config.js is in .gitignore and will never be committed
 */

const API_CONFIG = {
    WAQI: {
        token: 'YOUR_WAQI_TOKEN_HERE',  // Get from: https://aqicn.org/data-platform/token
        enabled: false
    },
    OPENWEATHER: {
        apiKey: 'YOUR_OPENWEATHER_KEY_HERE',  // Get from: https://openweathermap.org/api
        enabled: false
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
EOF

git add js/config.js.example
git commit -m "docs: Add config.js.example template for API keys"
echo "✅ config.js.example 생성 완료"
echo ""

# 7. 최종 상태 확인
echo "📊 최종 상태:"
git log --oneline -10
echo ""
git status
echo ""

echo "✅ 모든 작업 완료!"
echo ""
echo "⚠️  다음 단계:"
echo "1. 변경사항 확인: git log --oneline"
echo "2. 강제 푸시: git push origin --force --all"
echo "3. 모든 브랜치 푸시: git push origin --force --tags"
echo ""
echo "🔐 주의사항:"
echo "- js/config.js가 Git 히스토리에서 완전히 제거되었습니다"
echo "- 로컬에서 js/config.js.example을 js/config.js로 복사하고 토큰을 입력하세요"
echo "- js/config.js는 이제 .gitignore에 추가되어 커밋되지 않습니다"
