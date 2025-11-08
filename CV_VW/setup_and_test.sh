#!/bin/bash

echo "🚗 PICT Smart Parking Prediction System Setup & Test"
echo "=" * 60

# Color codes for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
BLUE='\\033[0;34m'
NC='\\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "prediction.py" ]; then
    print_error "Please run this script from the CV_VW directory"
    exit 1
fi

print_info "Setting up Python environment for ML service..."

# Create virtual environment if it doesn't exist
if [ ! -d "cv_env" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv cv_env
fi

# Activate virtual environment
source cv_env/bin/activate

print_info "Installing Python dependencies..."
pip install -r requirements.txt

print_status "Python environment ready!"

# Generate training data and train model
print_info "Generating training data and training XGBoost model..."
python train_model.py

if [ $? -eq 0 ]; then
    print_status "Model training completed successfully!"
else
    print_warning "Model training had issues, using fallback prediction"
fi

# Start ML service in background
print_info "Starting FastAPI ML service on port 8000..."
uvicorn prediction:app --host 0.0.0.0 --port 8000 --reload &
ML_PID=$!

# Wait for service to start
sleep 5

# Test ML service
print_info "Testing ML service endpoints..."

# Test health endpoint
curl -s http://localhost:8000/health | python -m json.tool > /dev/null
if [ $? -eq 0 ]; then
    print_status "ML service health check passed!"
else
    print_error "ML service health check failed!"
fi

# Test prediction endpoint
print_info "Testing parking availability prediction..."
curl -s -X POST "http://localhost:8000/predict-availability" \\
     -H "Content-Type: application/json" \\
     -d '{
       "user_location": {"lat": 18.5100, "lng": 73.8500},
       "parking_area": "main_gate",
       "vehicle_type": "car",
       "planned_arrival_time": "'$(date -u -d '+1 hour' '+%Y-%m-%dT%H:%M:%SZ')'"
     }' | python -m json.tool

if [ $? -eq 0 ]; then
    print_status "Prediction endpoint working!"
else
    print_warning "Prediction endpoint had issues"
fi

# Test recommendation endpoint
print_info "Testing parking recommendations..."
curl -s -X POST "http://localhost:8000/recommend-parking" \\
     -H "Content-Type: application/json" \\
     -d '{
       "destination_location": {"lat": 18.5204, "lng": 73.8567},
       "planned_arrival_time": "'$(date -u -d '+2 hours' '+%Y-%m-%dT%H:%M:%SZ')'",
       "vehicle_type": "car",
       "max_walking_distance": 500
     }' | python -m json.tool

if [ $? -eq 0 ]; then
    print_status "Recommendation endpoint working!"
else
    print_warning "Recommendation endpoint had issues"
fi

print_info "Testing complete! ML service is running on http://localhost:8000"
print_info "You can test the API at http://localhost:8000/docs"

# Instructions for backend integration
echo ""
print_info "Next Steps:"
print_info "1. Start your backend server: cd ../backend && npm run dev"
print_info "2. Start your React Native app: cd ../uber-clone && npx expo start"
print_info "3. Test the Smart Parking tab in your mobile app"
print_info "4. Monitor predictions at: http://localhost:8000/docs"

# Cleanup function
cleanup() {
    print_info "Stopping ML service..."
    kill $ML_PID 2>/dev/null
    print_status "Cleanup complete!"
}

# Register cleanup function
trap cleanup EXIT

print_info "Press Ctrl+C to stop the ML service"
wait