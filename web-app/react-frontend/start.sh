#!/bin/bash

# ExoPlanet AI Website Startup Script

echo "🌟 Starting ExoPlanet AI Website..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if backend API is running
echo "🔍 Checking backend API connection..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API is running"
else
    echo "⚠️  Backend API is not running. Please start it with:"
    echo "   cd ../deployment && python api_server.py --model ../outputs/cpu_model"
    echo ""
    echo "   The website will still work, but the ExpoAI page will show connection errors."
fi

# Set environment variables
export REACT_APP_API_URL=http://localhost:8000

# Start the development server
echo "🚀 Starting React development server..."
echo "   Website will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

npm start
