# 🚗 Smart Parking Slot Recommendation System

AI-powered parking recommendation system for the Pune region, integrating XGBoost ML predictions with real-time parking slot status.

## 🎯 System Overview

This system provides intelligent parking recommendations by combining:

- **Geospatial Search**: Find parking spots within radius of destination
- **Real-time Status**: Live slot availability from OpenCV/IoT sensors
- **ML Predictions**: XGBoost model predicts occupancy at arrival time
- **Smart Scoring**: Multi-factor ranking algorithm

## 🏗️ Architecture

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │ HTTP REST
         ▼
┌─────────────────┐
│  Backend API    │
│  (Node.js +     │
│   TypeScript)   │
└────┬───────┬────┘
     │       │
     │       │ HTTP
     │       ▼
     │  ┌──────────────┐
     │  │  ML Service  │
     │  │  (Flask +    │
     │  │   Python)    │
     │  └──────────────┘
     │
     ▼
┌──────────────────┐
│  PostgreSQL DB   │
│  (Parking Data)  │
└──────────────────┘
```

## 📦 Components

### 1. **ML Service** (`/ml_service/`)

Flask-based microservice serving the XGBoost parking occupancy prediction model.

**Features:**

- Single prediction endpoint
- Batch prediction for multiple spots
- Health check and context endpoints

### 2. **Backend API** (`/backend/`)

Node.js + TypeScript + Express backend with Prisma ORM.

**Key Modules:**

- `recommendation`: Smart parking recommendation logic
- `parkingSpot`: Parking spot management
- `booking`: Booking system
- `vehicle`: Vehicle verification
- `auth`: Authentication

### 3. **Mobile App** (`/uber-clone/`)

React Native app with parking spot search and navigation.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.8+
- PostgreSQL 14+
- npm/yarn

### 1. Setup ML Service

```bash
cd ml_service
pip install -r requirements.txt
python app.py
```

The ML service will start on `http://localhost:5001`

### 2. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Setup database
cp .env.example .env
# Edit .env with your database credentials

# Run Prisma migrations
npm run prisma:migrate

# Start server
npm run dev
```

The backend will start on `http://localhost:3000`

### 3. Setup Mobile App

```bash
cd uber-clone
npm install
npx expo start
```

## 📡 API Endpoints

### Parking Recommendations

**POST** `/api/recommend-parking`

Returns top 3 recommended parking spots based on multi-factor scoring.

**Request Body:**

```json
{
  "userLatitude": 18.5204,
  "userLongitude": 73.8567,
  "destinationLatitude": 18.5324,
  "destinationLongitude": 73.8467,
  "vehicleType": "car",
  "radiusKm": 3,
  "arrivalTimeMinutes": 15
}
```

**Response:**

```json
{
  "success": true,
  "recommendations": [
    {
      "spotId": "uuid",
      "name": "PICT Main Campus Parking",
      "address": "Pune Institute of Computer Technology, Dhankawadi",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "distanceFromDestination": 0.5,
      "distanceFromUser": 2.3,
      "estimatedTravelTime": 5,
      "totalSlots": 60,
      "currentFreeSlots": 45,
      "currentOccupancyRate": 0.25,
      "predictedOccupancyProbability": 0.35,
      "predictedAvailability": 0.65,
      "mlConfidence": 0.87,
      "recommendationScore": 92,
      "pricePerHour": 20,
      "isCovered": true,
      "hasSecurity": true,
      "hasEVCharging": false,
      "rating": 4.5,
      "scoreBreakdown": {
        "distanceScore": 30,
        "availabilityScore": 19,
        "mlPredictionScore": 22,
        "priceScore": 10,
        "amenitiesScore": 10
      }
    }
  ],
  "mlServiceAvailable": true,
  "message": "Found 3 recommended parking spots"
}
```

## 🧮 Scoring Algorithm

The recommendation score (0-100) is calculated from:

1. **Distance Score (30 points)**: Proximity to destination

   - Full points if within 500m
   - Linear decrease up to 3km

2. **Availability Score (25 points)**: Current free slots ratio

   - Based on real-time OpenCV/IoT data

3. **ML Prediction Score (25 points)**: Predicted availability at arrival

   - Weighted by ML confidence level
   - Uses XGBoost trained on Pune parking patterns

4. **Price Score (10 points)**: Cost effectiveness

   - Lower price = higher score

5. **Amenities Score (10 points)**: Features (covered, security, EV charging)

## 🤖 ML Model Details

**Model**: XGBoost Binary Classifier

**Input Features:**

- `slot_type`: Vehicle type (car/bike/large_vehicle/disabled)
- `hour`: Time of day (0-23, cyclical encoding)
- `weekday`: Day of week (0-6, cyclical encoding)
- `weather`: Current weather (sunny/rainy/hot)
- `event_type`: Events (none/public_holiday/stadium_event)
- `poi_office_count`: Nearby office POIs
- `poi_restaurant_count`: Nearby restaurant POIs
- `poi_store_count`: Nearby store POIs

**Output:**

- `prob_occupied`: Probability slot will be occupied (0-1)
- `prob_free`: Probability slot will be free (0-1)
- `confidence`: Model confidence (0-1)

**Training Data**:

- Synthetic but hyper-realistic Pune parking data
- 1 month simulation (Jan 2025)
- 15-minute intervals
- 300 parking slots across 6 areas

## 📊 Database Schema

Key tables:

- `ParkingSpot`: Parking lot metadata
- `ParkingSlot`: Individual slots with real-time status
- `Booking`: User bookings
- `Vehicle`: Registered vehicles
- `User`: User accounts

## 🔧 Configuration

### Backend Environment Variables

```env
DATABASE_URL="postgresql://..."
PORT=3000
ML_SERVICE_URL="http://localhost:5001"
CLERK_SECRET_KEY="your_clerk_key"
```

### ML Service Environment Variables

```env
ML_SERVICE_PORT=5001
```

## 🧪 Testing

### Test ML Service

```bash
curl -X POST http://localhost:5001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "slot_type": "car",
    "hour": 14,
    "weekday": 1,
    "weather": "sunny",
    "event_type": "none",
    "poi_office_count": 30,
    "poi_restaurant_count": 5,
    "poi_store_count": 2
  }'
```

### Test Recommendation API

```bash
curl -X POST http://localhost:3000/api/recommend-parking \
  -H "Content-Type: application/json" \
  -d '{
    "userLatitude": 18.5204,
    "userLongitude": 73.8567,
    "destinationLatitude": 18.5324,
    "destinationLongitude": 73.8467,
    "vehicleType": "car"
  }'
```

## 📝 Future Enhancements

- [ ] Real weather API integration (OpenWeatherMap)
- [ ] Events calendar integration
- [ ] Google Places API for POI data
- [ ] Real-time pricing based on demand
- [ ] Multi-objective optimization (price vs distance vs availability)
- [ ] User preference learning
- [ ] Historical occupancy patterns
- [ ] Navigation integration with Google Maps/Waze
- [ ] Push notifications for slot availability changes

## 🤝 Integration Guide

### Adding Real-Time Slot Updates

Update slot status via OpenCV or IoT:

```typescript
import { PrismaClient, SlotStatus } from "@prisma/client";
const prisma = new PrismaClient();

await prisma.parkingSlot.update({
  where: { id: slotId },
  data: {
    status: SlotStatus.OCCUPIED,
    lastUpdated: new Date(),
  },
});
```

### Integrating Weather API

Replace mock weather function in `geospatial.service.ts`:

```typescript
export const getCurrentWeather = async (): Promise<string> => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
  );
  const data = await response.json();
  // Map weather condition to model categories
  return mapWeatherCondition(data.weather[0].main);
};
```

## 📄 License

MIT

## 👥 Contributors

Built for smart city parking management in Pune, India.
