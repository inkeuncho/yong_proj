#!/bin/bash

# WAQI 토큰 안전 설정 가이드

echo "🔐 WAQI API 토큰 안전 설정 가이드"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 3가지 안전한 방법:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "방법 1: 로컬 config.js 파일 사용 (권장)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 현재 js/config.js 파일을 열어서 토큰을 추가하세요:"
echo ""
cat << 'EXAMPLE'
// js/config.js
const API_CONFIG = {
  waqi: {
    token: 'YOUR_ACTUAL_TOKEN_HERE',  // ← 여기에 받은 토큰 입력
    enabled: true  // ← true로 변경
  },
  // ... 나머지는 그대로
};
EXAMPLE
echo ""
echo "2. 파일을 저장하면 끝!"
echo "   ✅ js/config.js는 이미 .gitignore에 있어서 절대 커밋되지 않습니다"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "방법 2: 환경 변수 사용 (프로덕션 환경)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. 프로젝트 루트에 .env 파일 생성:"
echo ""
cat << 'ENV_EXAMPLE'
# .env
VITE_WAQI_TOKEN=your_actual_token_here
VITE_OPENWEATHER_KEY=your_key_if_needed
ENV_EXAMPLE
echo ""
echo "2. js/config.js를 수정하여 환경 변수 사용:"
echo ""
cat << 'CODE_EXAMPLE'
const API_CONFIG = {
  waqi: {
    token: import.meta.env.VITE_WAQI_TOKEN || null,
    enabled: !!import.meta.env.VITE_WAQI_TOKEN
  },
  // ...
};
CODE_EXAMPLE
echo ""
echo "3. .env 파일이 .gitignore에 있는지 확인 (이미 있음)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "방법 3: GitHub Secrets (GitHub Pages 배포용)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. GitHub 저장소 → Settings → Secrets and variables → Actions"
echo "2. 'New repository secret' 클릭"
echo "3. Secret 추가:"
echo "   Name: WAQI_TOKEN"
echo "   Value: your_actual_token_here"
echo ""
echo "4. GitHub Actions workflow 수정:"
echo ""
cat << 'WORKFLOW_EXAMPLE'
# .github/workflows/deploy.yml
jobs:
  deploy:
    steps:
      - name: Build with secrets
        env:
          VITE_WAQI_TOKEN: ${{ secrets.WAQI_TOKEN }}
        run: npm run build
WORKFLOW_EXAMPLE
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 권장 방법:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🏠 로컬 개발: 방법 1 (config.js 직접 수정)"
echo "   └─ 가장 간단하고 빠름"
echo "   └─ .gitignore로 보호됨"
echo ""
echo "🚀 배포: 방법 2 (환경 변수) 또는 방법 3 (GitHub Secrets)"
echo "   └─ 프로덕션 환경에 안전"
echo "   └─ 팀 협업에 적합"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔒 보안 체크리스트:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ js/config.js가 .gitignore에 있음"
echo "✅ .env가 .gitignore에 있음"
echo "✅ 템플릿 파일만 공유 (config.js.example)"
echo "✅ GitHub Secrets로 CI/CD 보호"
echo ""
echo "❌ 절대 하지 말아야 할 것:"
echo "   • config.js를 git add 하지 마세요"
echo "   • 토큰을 소스코드에 하드코딩 하지 마세요"
echo "   • 토큰을 스크린샷으로 공유하지 마세요"
echo "   • 토큰을 공개 저장소에 올리지 마세요"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "지금 바로 토큰을 추가하시겠습니까? (y/n)"
read -r CHOICE

if [ "$CHOICE" = "y" ]; then
    echo ""
    echo "토큰을 입력하세요:"
    read -r TOKEN
    
    if [ -n "$TOKEN" ]; then
        CONFIG_FILE="/Users/joymin/Coding_proj/Finedust_proj/js/config.js"
        
        # 백업 생성
        cp "$CONFIG_FILE" "$CONFIG_FILE.backup"
        
        # token: null을 실제 토큰으로 교체
        sed -i '' "s/token: null,/token: '$TOKEN',/" "$CONFIG_FILE"
        
        # enabled: false를 true로 교체
        sed -i '' "s/enabled: false \/\/ Optional: Set to true after adding token/enabled: true \/\/ WAQI enabled/" "$CONFIG_FILE"
        
        echo ""
        echo "✅ 토큰이 js/config.js에 안전하게 추가되었습니다!"
        echo "✅ 백업: js/config.js.backup"
        echo ""
        echo "🔍 확인:"
        grep -A2 "waqi:" "$CONFIG_FILE" | head -3
        echo ""
        echo "🎉 이제 앱에서 11,000+ WAQI 측정소 데이터를 사용할 수 있습니다!"
    else
        echo "❌ 토큰이 입력되지 않았습니다."
    fi
else
    echo ""
    echo "나중에 직접 js/config.js 파일을 수정하세요."
fi

echo ""
echo "📚 더 자세한 내용은 docs/API_SETUP.md를 참고하세요"
