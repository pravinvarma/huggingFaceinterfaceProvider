#!/bin/bash

echo "🚀 Starting AI Chat Application..."
echo ""

# Start backend server in background
echo "📡 Starting backend server on http://localhost:3000..."
npm start &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start React frontend
echo "⚛️  Starting React frontend on http://localhost:5173..."
cd client && npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT

