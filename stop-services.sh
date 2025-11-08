#!/bin/bash

# Stop Smart Parking System Services

echo "⏹️  Stopping Smart Parking System services..."

# Check if PID file exists
if [ -f ".service_pids" ]; then
    source .service_pids
    
    if [ ! -z "$ML_PID" ]; then
        echo "🤖 Stopping ML Service (PID: $ML_PID)..."
        kill $ML_PID 2>/dev/null || echo "   ML Service already stopped"
    fi
    
    if [ ! -z "$BACKEND_PID" ]; then
        echo "🌐 Stopping Backend API (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null || echo "   Backend already stopped"
    fi
    
    rm .service_pids
    echo "✅ Services stopped"
else
    echo "⚠️  No PID file found. Trying to find processes..."
    
    # Try to find and kill processes
    pkill -f "python app.py" && echo "🤖 Stopped ML Service"
    pkill -f "ts-node-dev.*server.ts" && echo "🌐 Stopped Backend API"
    
    echo "✅ Done"
fi
