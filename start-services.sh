#!/bin/bash

# 🚀 Quick Start Script for Smart Parking System
# This script starts both ML service and Backend API

echo "🚗 Starting Smart Parking Recommendation System..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL might not be running. Make sure it's started."
fi

echo "✅ Prerequisites check passed"
echo ""

# Start ML Service
echo "🤖 Starting ML Service..."
cd ml_service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f ".deps_installed" ]; then
    echo "📦 Installing ML service dependencies..."
    pip install -r requirements.txt
    touch .deps_installed
fi

# Start ML service in background
echo "🚀 Launching ML service on port 5001..."
python app.py > ../ml_service.log 2>&1 &
ML_PID=$!
echo "   ML Service PID: $ML_PID"

cd ..

# Wait for ML service to be ready
echo "⏳ Waiting for ML service to start..."
sleep 3

# Check if ML service is running
if curl -s http://localhost:5001/health > /dev/null; then
    echo "✅ ML Service is running!"
else
    echo "❌ ML Service failed to start. Check ml_service.log"
    exit 1
fi

echo ""

# Start Backend
echo "🌐 Starting Backend API..."
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials and restart"
    exit 1
fi

# Run Prisma generate
echo "🔧 Generating Prisma client..."
npm run prisma:generate > /dev/null 2>&1

# Start backend
echo "🚀 Launching Backend API on port 3000..."
npm run dev &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "✅ System started successfully!"
echo ""
echo "📍 Service URLs:"
echo "   • ML Service:     http://localhost:5001"
echo "   • Backend API:    http://localhost:3000"
echo "   • API Docs:       http://localhost:3000/api-docs"
echo "   • Health Check:   http://localhost:3000/health"
echo ""
echo "📊 To seed sample parking data, run:"
echo "   cd backend && npm run seed:parking"
echo ""
echo "🧪 Test the recommendation API:"
echo "   curl -X POST http://localhost:3000/api/recommend-parking \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"userLatitude\":18.5204,\"userLongitude\":73.8567,\"destinationLatitude\":18.5324,\"destinationLongitude\":73.8467,\"vehicleType\":\"car\"}'"
echo ""
echo "⏹️  To stop services:"
echo "   kill $ML_PID $BACKEND_PID"
echo ""
echo "📋 Logs:"
echo "   • ML Service: ml_service.log"
echo "   • Backend: Check terminal output"
echo ""

# Save PIDs to file for easy cleanup
echo "ML_PID=$ML_PID" > .service_pids
echo "BACKEND_PID=$BACKEND_PID" >> .service_pids

echo "Process IDs saved to .service_pids"
echo ""
echo "Press Ctrl+C to stop services"

# Wait for user interrupt
wait
