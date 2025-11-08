# Mobile App Integration Guide

## Smart Parking ML Recommendations in React Native

This guide covers the integration of the ML-powered parking recommendation system with your React Native mobile app.

---

## 📱 Integration Overview

The mobile app now connects to the smart parking recommendation backend to display ML-powered parking suggestions with:

- **Recommendation scores** (0-100 points)
- **ML confidence levels** (probability percentage)
- **Predicted availability** (% chance of finding a spot)
- **Real-time occupancy status**
- **Distance & travel time estimates**

---

## 🔧 Files Modified

### 1. **uber-clone/lib/parking.ts**

Added new function for ML-powered recommendations:

```typescript
export const getParkingRecommendations = async (
  userLatitude: number,
  userLongitude: number,
  destinationLatitude: number,
  destinationLongitude: number,
  vehicleType: string = 'car',
  radiusKm: number = 3
): Promise<ParkingSpot[]>
```

**Features:**

- Calls backend API at `/api/recommend-parking`
- Converts `ParkingRecommendation` response to `ParkingSpot` format
- Includes automatic fallback to mock data if API unavailable
- Full error handling and logging

### 2. **uber-clone/types/type.d.ts**

Extended `ParkingSpot` interface with ML fields:

```typescript
interface ParkingSpot {
  // ... existing fields
  spotId?: string;
  recommendationScore?: number;
  predictedAvailability?: number;
  mlConfidence?: number;
  estimatedTravelTime?: string;
  scoreBreakdown?: {
    distance: number;
    availability: number;
    mlPrediction: number;
    price: number;
    amenities: number;
  };
  has_ev_charging?: boolean;
}
```

### 3. **uber-clone/components/ParkingCard.tsx**

Enhanced UI to display ML data:

**New Features:**

- 🎯 **Recommendation Score Badge** (green, top of card)
- 🤖 **ML Confidence Display** (below score)
- 📊 **Predicted Availability Row** (percentage with icon)
- ⚡ **EV Charging Badge** (yellow, in features section)
- 🇮🇳 **Currency Update** (changed from $ to ₹)

### 4. **uber-clone/app/(root)/find-parking.tsx**

Updated to use ML recommendations:

**Key Changes:**

- Imports `getParkingRecommendations`
- `handleLocationSearch` now calls ML API when user searches destination
- Passes user location + destination to get smart recommendations
- Falls back to simple location search if user location unavailable
- Enhanced logging for debugging

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

```bash
cd uber-clone
npm install
```

### Step 2: Update API Base URL

In `uber-clone/lib/parking.ts`, update the API URL:

```typescript
// For local development
const API_BASE_URL = "http://localhost:3000/api";

// For production (replace with your actual backend URL)
// const API_BASE_URL = 'https://your-backend-domain.com/api';
```

⚠️ **Important:** For Android emulator, use `http://10.0.2.2:3000/api` instead of `localhost`
⚠️ **Important:** For iOS simulator, `localhost` works fine

### Step 3: Start Backend Services

In the project root directory:

```bash
# Start ML service + Backend
./start-services.sh
```

Or manually:

```bash
# Terminal 1 - ML Service
cd ml_service
source venv/bin/activate
python app.py

# Terminal 2 - Backend
cd backend
npm run dev
```

Verify services are running:

- ML Service: http://localhost:5001/health
- Backend API: http://localhost:3000/api-docs

### Step 4: Run Mobile App

```bash
cd uber-clone

# For iOS
npm run ios

# For Android
npm run android

# Or use Expo Go
npx expo start
```

---

## 🧪 Testing the Integration

### Test 1: Check API Connection

1. Open the app and navigate to "Find Parking" screen
2. Check console logs for:

   ```
   🎯 Calling recommendation API...
   User: 18.xxxx, 73.xxxx
   Destination: 18.xxxx, 73.xxxx
   ```

3. Verify response:
   ```
   ✅ Received 3 recommendations
   First recommendation: {...}
   ```

### Test 2: Verify ML Data Display

1. Search for a destination on the "Find Parking" screen
2. View parking cards in the bottom sheet
3. Check for:
   - ✅ Green score badge at top (e.g., "🎯 Score: 85/100")
   - ✅ ML confidence text (e.g., "ML Confidence: 87%")
   - ✅ Predicted availability row (e.g., "🤖 Predicted: 78% available")
   - ✅ EV charging badge (if applicable)
   - ✅ Prices in ₹ (INR currency)

### Test 3: Verify Scoring Algorithm

Check that parking spots are ordered by recommendation score (highest first).

**Expected order:**

1. Spot with highest score (closest + best availability + high ML confidence)
2. Second-best spot
3. Third-best spot

### Test 4: Test Fallback Mechanism

1. Stop backend server: `./stop-services.sh`
2. Search for parking in app
3. Verify mock data appears with message:
   ```
   ⚠️ Using mock parking data (API unavailable)
   ```

---

## 🐛 Troubleshooting

### Issue: "Network request failed"

**Solution 1 - Android Emulator:**

```typescript
// Use emulator's special localhost IP
const API_BASE_URL = "http://10.0.2.2:3000/api";
```

**Solution 2 - Physical Device:**

```typescript
// Use your computer's local IP
const API_BASE_URL = "http://192.168.x.x:3000/api";
```

Find your IP:

```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

### Issue: "No parking spots displayed"

**Check:**

1. Backend services running: `./start-services.sh`
2. Database seeded: `npm run seed` in `backend/` directory
3. Console logs show API calls
4. User location permissions granted

### Issue: "Recommendation scores not showing"

**Check:**

1. Backend API returning `recommendationScore` field
2. Type definitions updated in `type.d.ts`
3. `ParkingCard.tsx` using updated interface
4. Console logs show recommendation data

### Issue: TypeScript/JSX errors

These are typically linting warnings and won't affect runtime:

```
Cannot use JSX unless the '--jsx' flag is provided
```

**Solution:** Ignore if app runs correctly. These are build-time warnings only.

---

## 📊 API Request/Response Format

### Request to Backend

```typescript
POST http://localhost:3000/api/recommend-parking
Content-Type: application/json

{
  "userLatitude": 18.5204,
  "userLongitude": 73.8567,
  "destinationLatitude": 18.5314,
  "destinationLongitude": 73.8446,
  "vehicleType": "car",
  "radiusKm": 3
}
```

### Response from Backend

```typescript
{
  "success": true,
  "count": 3,
  "recommendations": [
    {
      "parkingSpotId": "spot-123",
      "name": "PICT Main Campus Parking",
      "latitude": 18.5204,
      "longitude": 73.8567,
      "address": "Survey No. 27, Near Trimurti Chowk...",
      "totalSlots": 150,
      "occupiedSlots": 45,
      "availableSlots": 105,
      "vehicleType": "car",
      "hourlyRate": 30,
      "recommendationScore": 92.5,
      "scoreBreakdown": {
        "distance": 28,
        "availability": 24,
        "mlPrediction": 22,
        "price": 9,
        "amenities": 9.5
      },
      "distanceFromUser": 0.8,
      "distanceFromDestination": 0.3,
      "estimatedTravelTime": "3 mins",
      "mlPrediction": {
        "probability": 0.87,
        "confidence": 0.89,
        "predictedOccupancy": "Low",
        "features": {...}
      },
      "amenities": {
        "has_ev_charging": true,
        "is_covered": true,
        "has_security": true
      }
    },
    // ... 2 more recommendations
  ]
}
```

### Transformed ParkingSpot (for mobile)

```typescript
{
  id: "spot-123",
  name: "PICT Main Campus Parking",
  address: "Survey No. 27...",
  latitude: 18.5204,
  longitude: 73.8567,
  price: "₹30",
  available_slots: 105,
  total_slots: 150,
  type: "car",
  distance: 0.8,
  recommendationScore: 92,
  predictedAvailability: 87,
  mlConfidence: 89,
  estimatedTravelTime: "3 mins",
  has_ev_charging: true,
  scoreBreakdown: {
    distance: 28,
    availability: 24,
    mlPrediction: 22,
    price: 9,
    amenities: 9.5
  }
}
```

---

## 🎨 UI Components Reference

### Score Badge

```tsx
{
  recommendationScore && (
    <View style={styles.scoreBadge}>
      <Text style={styles.scoreText}>
        🎯 Score: {Math.round(recommendationScore)}/100
      </Text>
    </View>
  );
}
```

### ML Confidence

```tsx
{
  mlConfidence && (
    <Text style={styles.confidenceText}>
      ML Confidence: {Math.round(mlConfidence)}%
    </Text>
  );
}
```

### Predicted Availability

```tsx
{
  predictedAvailability && (
    <View style={styles.predictionRow}>
      <Text style={styles.predictionLabel}>🤖 Predicted:</Text>
      <Text style={styles.predictionValue}>
        {Math.round(predictedAvailability)}% available
      </Text>
    </View>
  );
}
```

### EV Charging Badge

```tsx
{
  has_ev_charging && (
    <View style={styles.evBadge}>
      <Text style={styles.evText}>⚡ EV Charging</Text>
    </View>
  );
}
```

---

## 🔄 Data Flow

```
User Opens Find Parking Screen
         ↓
Searches for Destination
         ↓
App calls getParkingRecommendations()
         ↓
POST /api/recommend-parking
  - userLocation (18.5204, 73.8567)
  - destination (18.5314, 73.8446)
  - vehicleType: "car"
  - radiusKm: 2
         ↓
Backend: RecommendationService
  1. Find parking spots within radius
  2. Get real-time occupancy (OpenCV)
  3. Call ML Service for predictions
  4. Calculate multi-factor scores
  5. Rank top 3 spots
         ↓
ML Service: XGBoost Prediction
  - Load model (parking_model_v2.json)
  - Extract features (time, weather, location)
  - Predict occupancy probability
  - Return confidence score
         ↓
Backend Response
  - 3 recommended spots
  - Scores & breakdowns
  - ML predictions
  - Real-time data
         ↓
Mobile App: Convert to ParkingSpot
         ↓
Display in ParkingCard Component
  - Score badge
  - ML confidence
  - Predicted availability
  - EV charging indicator
         ↓
User Selects Parking Spot
```

---

## 📝 Environment Variables

Create `.env` file in `uber-clone/`:

```bash
# API Configuration
EXPO_PUBLIC_API_URL=http://localhost:3000/api

# For Android Emulator
# EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api

# For Production
# EXPO_PUBLIC_API_URL=https://your-backend.com/api
```

Update `parking.ts` to use environment variable:

```typescript
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";
```

---

## 🚢 Production Deployment

### 1. Update API URL

```typescript
const API_BASE_URL = "https://your-backend.com/api";
```

### 2. Enable HTTPS

Ensure backend uses SSL certificate in production.

### 3. Build App

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

### 4. Configure Backend CORS

In `backend/src/server.ts`, update allowed origins:

```typescript
app.use(
  cors({
    origin: ["https://your-app-domain.com"],
    credentials: true,
  })
);
```

---

## 📚 Additional Resources

- **Backend API Docs:** http://localhost:3000/api-docs
- **Architecture Guide:** `ARCHITECTURE_DIAGRAM.md`
- **Setup Guide:** `SETUP_GUIDE.md`
- **Testing Scripts:** `test-integration.sh`

---

## 🤝 Support

If you encounter issues:

1. Check backend logs: `cd backend && npm run dev`
2. Check ML service logs: `cd ml_service && python app.py`
3. Check mobile app console in Metro bundler
4. Verify services are running: `./start-services.sh`
5. Run integration tests: `./test-integration.sh`

---

## ✅ Verification Checklist

Before considering integration complete:

- [ ] Backend services running (`./start-services.sh`)
- [ ] Database seeded with 6 parking locations
- [ ] Mobile app connects to API (check logs)
- [ ] ParkingCard displays ML scores
- [ ] Recommendation scores visible (🎯 Score: XX/100)
- [ ] ML confidence displayed (ML Confidence: XX%)
- [ ] Predicted availability shown (🤖 Predicted: XX%)
- [ ] EV charging badges appear when applicable
- [ ] Prices display in ₹ (INR)
- [ ] Parking spots ranked by score (highest first)
- [ ] Fallback to mock data works when API unavailable
- [ ] No console errors in mobile app
- [ ] Search destinations triggers ML recommendations
- [ ] Distance calculations accurate

---

## 🎉 Next Steps

1. **Test on physical device** with real GPS coordinates
2. **Add user vehicle preferences** (instead of hardcoded 'car')
3. **Implement caching** for frequently accessed parking spots
4. **Add pull-to-refresh** to update recommendations
5. **Show loading states** while fetching recommendations
6. **Add error messages** for better UX when API fails
7. **Implement favorites** for frequently used parking spots
8. **Add navigation** to selected parking spot
9. **Integrate payment system** for booking
10. **Add user reviews/ratings** for parking spots

---

**Last Updated:** December 2024  
**Integration Status:** ✅ Complete
