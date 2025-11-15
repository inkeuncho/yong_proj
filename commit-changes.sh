#!/bin/bash

# AirLens 프로젝트 구조 정리 커밋 스크립트

echo "🔄 Staging changes..."

# Stage all changes
git add .

echo "📝 Committing changes..."

# Commit with detailed message
git commit -m "♻️ Refactor: Reorganize project structure

- Move all HTML/CSS/JS files to app/ directory
- Remove unused React (airlens-react) folder
- Remove unused markdown documentation files
- Clean up node_modules
- Update README.md for new structure
- Update .gitignore for new paths
- Update GitHub Actions workflow for deployment
- Create root index.html as redirect to app/
- Archive old docs to archive/ folder

Benefits:
- Cleaner project structure
- Single source of truth (HTML/vanilla JS)
- Easier maintenance
- Better organization
- Simpler deployment"

echo ""
echo "✅ Changes committed successfully!"
echo ""
echo "📊 Project structure:"
echo "  ├── app/          (All application files)"
echo "  ├── archive/      (Old versions)"
echo "  ├── index.html    (Redirect to app/)"
echo "  └── README.md     (Updated documentation)"
echo ""
echo "🚀 Ready to push to GitHub!"
echo ""
echo "Run: git push origin main"
