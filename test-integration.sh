#!/bin/bash

# 🧪 Integration Test Script for Smart Parking System

echo "🧪 Running Integration Tests for Smart Parking System"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local method=$3
    local data=$4
    
    echo -n "Testing: $name... "
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$url")
    else
        response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        echo -e "${GREEN}✅ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC} (HTTP $http_code)"
        echo "Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

echo "1. Testing ML Service"
echo "---------------------"

# Test ML Service Health
test_endpoint "ML Service Health Check" \
    "http://localhost:5001/health" \
    "GET"

# Test ML Service Context
test_endpoint "ML Service Context" \
    "http://localhost:5001/context" \
    "GET"

# Test ML Service Single Prediction
test_endpoint "ML Single Prediction" \
    "http://localhost:5001/predict" \
    "POST" \
    '{"slot_type":"car","hour":14,"weekday":1,"weather":"sunny","event_type":"none","poi_office_count":30,"poi_restaurant_count":5,"poi_store_count":2}'

# Test ML Service Batch Prediction
test_endpoint "ML Batch Prediction" \
    "http://localhost:5001/predict/batch" \
    "POST" \
    '{"spots":[{"spot_id":"TEST-001","slot_type":"car","weather":"sunny","event_type":"none","poi_office_count":30,"poi_restaurant_count":5,"poi_store_count":2}]}'

echo ""
echo "2. Testing Backend API"
echo "----------------------"

# Test Backend Health
test_endpoint "Backend Health Check" \
    "http://localhost:3000/health" \
    "GET"

# Test Parking Recommendation (main feature)
echo ""
echo -e "${YELLOW}🎯 Testing Main Feature: Parking Recommendations${NC}"
test_endpoint "Parking Recommendations" \
    "http://localhost:3000/api/recommend-parking" \
    "POST" \
    '{"userLatitude":18.5204,"userLongitude":73.8567,"destinationLatitude":18.5324,"destinationLongitude":73.8467,"vehicleType":"car","radiusKm":5}'

echo ""
echo "3. Testing Different Scenarios"
echo "-------------------------------"

# Test with bike
test_endpoint "Recommendation for Bike" \
    "http://localhost:3000/api/recommend-parking" \
    "POST" \
    '{"userLatitude":18.5074,"userLongitude":73.8077,"destinationLatitude":18.5196,"destinationLongitude":73.8410,"vehicleType":"bike","radiusKm":3}'

# Test with large vehicle
test_endpoint "Recommendation for Large Vehicle" \
    "http://localhost:3000/api/recommend-parking" \
    "POST" \
    '{"userLatitude":18.5288,"userLongitude":73.8740,"destinationLatitude":18.5913,"destinationLongitude":73.7389,"vehicleType":"large_vehicle","radiusKm":10}'

# Test with custom arrival time
test_endpoint "Recommendation with Future Arrival" \
    "http://localhost:3000/api/recommend-parking" \
    "POST" \
    '{"userLatitude":18.5204,"userLongitude":73.8567,"destinationLatitude":18.5224,"destinationLongitude":73.8587,"vehicleType":"car","arrivalTimeMinutes":30}'

echo ""
echo "4. Testing Error Handling"
echo "-------------------------"

# Test missing parameters
echo -n "Testing: Missing Parameters... "
response=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:3000/api/recommend-parking" \
    -H "Content-Type: application/json" \
    -d '{"userLatitude":18.5204}')
http_code=$(echo "$response" | tail -n1)

if [ "$http_code" -eq 400 ]; then
    echo -e "${GREEN}✅ PASSED${NC} (Correctly returned 400)"
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}❌ FAILED${NC} (Expected 400, got $http_code)"
    FAILED=$((FAILED + 1))
fi

echo ""
echo "======================================================"
echo "📊 Test Results"
echo "======================================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
