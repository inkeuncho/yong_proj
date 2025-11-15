#!/bin/bash

# GitHub Pages 자동 배포 스크립트

set -e

REPO_PATH="/Users/joymin/Coding_proj/Finedust_proj"

echo "🚀 GitHub Pages 배포 시작..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

cd "$REPO_PATH"

# 1. 현재 상태 확인
echo "📊 1. 현재 상태 확인..."
git status
echo ""

# 2. 배포 전 체크리스트
echo "✅ 2. 배포 전 체크리스트..."
echo ""

# .nojekyll 확인
if [ -f ".nojekyll" ]; then
    echo "  ✅ .nojekyll 파일 존재"
else
    echo "  ⚠️  .nojekyll 파일 없음 - 생성 중..."
    touch .nojekyll
fi

# 404.html 확인
if [ -f "404.html" ]; then
    echo "  ✅ 404.html 파일 존재"
else
    echo "  ⚠️  404.html 파일 없음"
fi

# GitHub Actions workflow 확인
if [ -f ".github/workflows/deploy.yml" ]; then
    echo "  ✅ GitHub Actions workflow 존재"
else
    echo "  ❌ GitHub Actions workflow 없음"
    echo "     .github/workflows/deploy.yml 파일이 필요합니다"
fi

# config.js가 Git에 추적되지 않는지 확인
if git ls-files --error-unmatch js/config.js 2>/dev/null; then
    echo "  ⚠️  js/config.js가 Git에 추적되고 있습니다!"
    echo "     보안을 위해 제거해야 합니다"
    read -p "     지금 제거하시겠습니까? (y/n): " REMOVE_CONFIG
    if [ "$REMOVE_CONFIG" = "y" ]; then
        git rm --cached js/config.js
        echo "     ✅ config.js 추적 제거됨"
    fi
else
    echo "  ✅ js/config.js가 Git에 추적되지 않음"
fi

echo ""

# 3. 배포 버전 선택
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 3. 배포 버전 선택"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1) Vanilla JS 버전만 배포 (권장 - 빠름)"
echo "2) React 버전만 배포 (고급)"
echo "3) 둘 다 배포 (Vanilla + React)"
echo "4) 취소"
echo ""
read -p "선택 (1-4): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        DEPLOY_TYPE="vanilla"
        echo "📦 Vanilla JS 버전으로 배포합니다"
        ;;
    2)
        DEPLOY_TYPE="react"
        echo "📦 React 버전으로 배포합니다"
        ;;
    3)
        DEPLOY_TYPE="both"
        echo "📦 두 버전 모두 배포합니다"
        ;;
    4)
        echo "❌ 배포 취소"
        exit 0
        ;;
    *)
        echo "❌ 잘못된 선택"
        exit 1
        ;;
esac

echo ""

# 4. 변경사항 커밋
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 4. 변경사항 커밋"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -n "$(git status --porcelain)" ]; then
    echo "변경된 파일:"
    git status --short
    echo ""
    read -p "커밋 메시지를 입력하세요 (기본: deploy: Update for GitHub Pages): " COMMIT_MSG
    
    if [ -z "$COMMIT_MSG" ]; then
        COMMIT_MSG="deploy: Update for GitHub Pages"
    fi
    
    git add .
    git commit -m "$COMMIT_MSG"
    echo "✅ 커밋 완료"
else
    echo "✅ 변경사항 없음"
fi

echo ""

# 5. 원격 저장소에 푸시
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📤 5. GitHub에 푸시"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

git push origin main

echo "✅ 푸시 완료"
echo ""

# 6. GitHub Actions 상태 확인
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 6. 배포 상태"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "GitHub Actions가 자동으로 배포를 시작합니다."
echo ""
echo "배포 진행 상황 확인:"
echo "  🔗 https://github.com/joymin5655/Finedust_proj/actions"
echo ""
echo "배포 완료 후 다음 URL에서 확인 가능:"
echo "  🌐 https://joymin5655.github.io/Finedust_proj/"
echo ""

# 7. 배포 URL 자동 열기
read -p "배포 상태 페이지를 열까요? (y/n): " OPEN_ACTIONS
if [ "$OPEN_ACTIONS" = "y" ]; then
    open "https://github.com/joymin5655/Finedust_proj/actions"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 배포 프로세스 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 다음 단계:"
echo "  1. GitHub Actions가 배포 완료될 때까지 대기 (약 1-2분)"
echo "  2. 배포 완료 후 사이트 확인:"
echo "     https://joymin5655.github.io/Finedust_proj/"
echo "  3. 문제 발생 시:"
echo "     - Actions 탭에서 에러 로그 확인"
echo "     - docs/GITHUB_PAGES_DEPLOY.md 참고"
echo ""
echo "🎉 배포 완료!"
