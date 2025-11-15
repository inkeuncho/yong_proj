#!/bin/bash

# AirLens Test Server
# Simple HTTP server for local development

PORT=8000

echo "🌍 Starting AirLens Test Server..."
echo ""
echo "Server will run at:"
echo "  Local:   http://localhost:$PORT/app/"
echo "  Network: http://$(ipconfig getifaddr en0 || echo "N/A"):$PORT/app/"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start Python HTTP server
python3 -m http.server $PORT
