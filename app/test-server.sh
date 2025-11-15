#!/bin/bash
echo "🚀 Starting local test server..."
echo ""
echo "📍 Server URL: http://localhost:8000"
echo "🌍 Globe page: http://localhost:8000/globe.html"
echo ""
echo "⏹️  Press Ctrl+C to stop"
echo ""
python3 -m http.server 8000
