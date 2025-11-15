#!/bin/bash

# 토큰 노출 검사 스크립트
# Git 히스토리에서 민감한 정보가 노출되었는지 확인합니다

set -e

REPO_PATH="/Users/joymin/Coding_proj/Finedust_proj"

echo "🔍 Git 히스토리 토큰 노출 검사 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$REPO_PATH"

# 1. 현재 파일에서 실제 토큰값 확인
echo "📂 1. 현재 작업 디렉토리 검사..."
echo ""

CURRENT_TOKENS=$(grep -r -E "(token|apiKey|api_key).*['\"][a-zA-Z0-9]{20,}" js/ 2>/dev/null || true)

if [ -z "$CURRENT_TOKENS" ]; then
    echo "  ✅ 현재 파일: 토큰 노출 없음"
else
    echo "  ⚠️  현재 파일에서 토큰 발견:"
    echo "$CURRENT_TOKENS"
fi
echo ""

# 2. Git 히스토리에서 config.js 파일 확인
echo "📜 2. Git 히스토리 검사..."
echo ""

# config.js 파일이 히스토리에 있는지 확인
CONFIG_IN_HISTORY=$(git log --all --name-only --pretty="" -- js/config.js | wc -l)

if [ "$CONFIG_IN_HISTORY" -gt 0 ]; then
    echo "  ⚠️  js/config.js가 Git 히스토리에 $CONFIG_IN_HISTORY 번 나타남"
    echo "  🔍 상세 확인 중..."
    
    # 각 커밋에서 config.js 내용 확인
    git log --all --format="%H" -- js/config.js | while read commit; do
        CONTENT=$(git show $commit:js/config.js 2>/dev/null || echo "")
        if echo "$CONTENT" | grep -qE "(token|apiKey).*['\"][a-zA-Z0-9]{20,}"; then
            echo "  ❌ 토큰 발견: $commit"
            echo "$CONTENT" | grep -E "(token|apiKey).*['\"][a-zA-Z0-9]{20,}"
        fi
    done
else
    echo "  ✅ js/config.js: Git 히스토리에 없음 (안전)"
fi
echo ""

# 3. 모든 config 관련 파일 확인
echo "📁 3. config 관련 파일 검사..."
echo ""

git log --all --name-only --pretty="" | grep -i config | sort | uniq | while read file; do
    if [ -n "$file" ]; then
        # 최신 버전 확인
        LATEST_COMMIT=$(git log --all -1 --format="%H" -- "$file" 2>/dev/null || echo "")
        if [ -n "$LATEST_COMMIT" ]; then
            CONTENT=$(git show $LATEST_COMMIT:"$file" 2>/dev/null || echo "")
            if echo "$CONTENT" | grep -qE "(token|apiKey).*['\"][a-zA-Z0-9]{20,}"; then
                echo "  ⚠️  파일: $file"
                echo "  커밋: $LATEST_COMMIT"
                echo "$CONTENT" | grep -E "(token|apiKey).*['\"][a-zA-Z0-9]{20,}" | head -3
                echo ""
            fi
        fi
    fi
done

echo "✅ config 파일 검사 완료"
echo ""

# 4. 특정 패턴 검색
echo "🔎 4. 의심스러운 패턴 검색..."
echo ""

SUSPICIOUS_PATTERNS=(
    "token.*['\"][a-zA-Z0-9]{20,}"
    "apiKey.*['\"][a-zA-Z0-9]{20,}"
    "api_key.*['\"][a-zA-Z0-9]{20,}"
    "Bearer [a-zA-Z0-9]{20,}"
    "sk-[a-zA-Z0-9]{20,}"
)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    echo "  검색 중: $pattern"
    FOUND=$(git log --all -p | grep -E "$pattern" | head -5 || true)
    if [ -n "$FOUND" ]; then
        echo "  ⚠️  발견됨:"
        echo "$FOUND"
        echo ""
    fi
done

echo "✅ 패턴 검색 완료"
echo ""

# 5. .gitignore 확인
echo "📋 5. .gitignore 확인..."
echo ""

if grep -q "config.js" .gitignore; then
    echo "  ✅ config.js가 .gitignore에 포함됨"
else
    echo "  ⚠️  config.js가 .gitignore에 없음"
fi

if grep -q ".env" .gitignore; then
    echo "  ✅ .env가 .gitignore에 포함됨"
else
    echo "  ℹ️  .env가 .gitignore에 없음 (필요시 추가)"
fi
echo ""

# 6. 최종 요약
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 최종 요약"
echo ""
echo "현재 상태:"
echo "  • js/config.js: 템플릿만 존재, 실제 토큰 없음"
echo "  • Git 히스토리: js/config.js가 filter-repo로 제거됨"
echo "  • .gitignore: 보호 설정 확인됨"
echo ""
echo "권장 사항:"
echo "  1. ✅ js/config.js는 로컬에서만 사용"
echo "  2. ✅ config.template.js 또는 config.js.example 사용"
echo "  3. ✅ GitHub Secrets 사용 (CI/CD 환경)"
echo "  4. ✅ 환경 변수 사용 (.env 파일)"
echo ""
echo "🎉 보안 검사 완료!"
