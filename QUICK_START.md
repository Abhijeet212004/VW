# 🚀 Quick Start Guide - Smart Parking ML Integration

## Before You Start (5 minutes)

### ✅ Prerequisites Check

Run these commands to verify your setup:

```bash
# Check Node.js (need v18+)
node --version

# Check Python (need v3.8+)
python3 --version

# Check PostgreSQL (need v14+)
psql --version

# Check if ports are available
lsof -i :3000   # Backend port (should be empty)
lsof -i :5001   # ML service port (should be empty)
lsof -i :5432   # PostgreSQL port (should show postgres)
```

---

## 🎯 Step-by-Step Setup (10 minutes)

### Step 1: Start Backend Services (2 min)

```bash
cd /home/krish/Documents/Codes/ML/parkingPrediction

# One command to start everything
./start-services.sh
```

**What this does:**

- ✅ Starts ML service (Flask) on port 5001
- ✅ Starts Backend API (Node.js) on port 3000
- ✅ Connects to PostgreSQL database

**Verify it worked:**

```bash
# Check ML service (should return "ML service is healthy")
curl http://localhost:5001/health

# Check backend (should return API documentation page)
curl http://localhost:3000/api-docs

# Expected output:
# ML Service: {"status": "healthy", ...}
# Backend: <!DOCTYPE html> ... (Swagger UI HTML)
```

---

### Step 2: Seed Database (1 min)

```bash
cd backend

# Install dependencies (first time only)
npm install

# Seed parking data
npm run seed
```

**What this does:**

- ✅ Creates 6 parking locations in Pune
- ✅ Generates 710 parking slots
- ✅ Sets up realistic occupancy data

**Expected output:**

```
✅ Seeded 6 parking spots
✅ Created 710 parking slots
✅ Database seeding completed!
```

---

### Step 3: Configure Mobile App (2 min)

```bash
cd ../uber-clone
```

**Choose your configuration:**

**Option A: iOS Simulator (recommended for Mac)**

```bash
# Open lib/parking.ts and verify line 5:
const API_BASE_URL = 'http://localhost:3000/api';
```

**Option B: Android Emulator**

```bash
# Edit lib/parking.ts, change line 5 to:
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Option C: Physical Device**

```bash
# Find your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Edit lib/parking.ts, change line 5 to:
const API_BASE_URL = 'http://YOUR_IP_HERE:3000/api';
# Example: 'http://192.168.1.100:3000/api'
```

📖 **Full guide:** `uber-clone/API_CONFIGURATION.md`

---

### Step 4: Start Mobile App (5 min)

```bash
cd /home/krish/Documents/Codes/ML/parkingPrediction/uber-clone

# Install dependencies (first time only)
npm install

# Start Metro bundler
npx expo start
```

**Then choose platform:**

**iOS Simulator:**

```bash
# Press 'i' in terminal
# OR in new terminal:
npm run ios
```

**Android Emulator:**

```bash
# Press 'a' in terminal
# OR in new terminal:
npm run android
```

**Physical Device (Expo Go):**

1. Install Expo Go app on your phone
2. Scan QR code shown in terminal
3. Wait for app to load

---

## 🧪 Test the Integration (5 minutes)

### Test 1: Check Console Logs (1 min)

1. Open mobile app
2. Navigate to "Find Parking" screen
3. Look for logs in Metro bundler terminal:

**Expected logs:**

```
🎯 Calling recommendation API...
User: 18.5204, 73.8567
Destination: 18.5314, 73.8446
✅ Received 3 recommendations
First recommendation: {...}
```

**✅ Success:** If you see these logs  
**❌ Failed:** See Troubleshooting section below

---

### Test 2: Search for Parking (2 min)

1. In app, tap the search bar
2. Search for "Pune Railway Station" or any location
3. Wait 2-3 seconds for results

**What you should see:**

- ✅ Map updates with parking markers
- ✅ Bottom sheet shows 3 parking cards
- ✅ Each card has green score badge (🎯 Score: XX/100)
- ✅ ML Confidence percentage shown
- ✅ Predicted availability (🤖 Predicted: XX%)
- ✅ EV charging badge (if available)
- ✅ Prices in ₹ (INR)

---

### Test 3: Verify Scoring (1 min)

Check that parking spots are ranked by score:

**Expected order:**

```
1. 🎯 Score: 92/100  (highest - closest + best availability)
2. 🎯 Score: 85/100  (second best)
3. 🎯 Score: 78/100  (third best)
```

**✅ Pass:** Scores decrease from top to bottom  
**❌ Fail:** Random order or missing scores

---

### Test 4: Check ML Data (1 min)

Tap on the highest-scored parking card and verify:

- ✅ Score badge visible at top
- ✅ ML Confidence shows percentage (e.g., "87%")
- ✅ Predicted availability shows percentage (e.g., "78% available")
- ✅ If has EV charging, yellow badge visible
- ✅ Distance shown (e.g., "0.8 km away")
- ✅ Price in ₹ (e.g., "₹30 / hour")

---

## 🐛 Troubleshooting

### Problem: "Network request failed"

**Solution 1: Check Backend is Running**

```bash
curl http://localhost:3000/health
# Expected: {"status": "healthy"}
```

If not working:

```bash
cd backend
npm run dev
```

**Solution 2: Check API URL (Android Emulator)**

```typescript
// In uber-clone/lib/parking.ts
const API_BASE_URL = "http://10.0.2.2:3000/api";
```

**Solution 3: Check Firewall (Physical Device)**

```bash
# Allow port 3000 through firewall
# macOS:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add `which node`
```

---

### Problem: No parking spots displayed

**Check database is seeded:**

```bash
cd backend
npm run seed
```

**Check ML service is running:**

```bash
curl http://localhost:5001/health
# Expected: {"status": "healthy", "model_loaded": true}
```

If not working:

```bash
cd ml_service
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python app.py
```

---

### Problem: Scores not showing

**Check type definitions:**

```bash
# Verify uber-clone/types/type.d.ts has these fields:
# - recommendationScore?: number;
# - mlConfidence?: number;
# - predictedAvailability?: number;
```

**Check ParkingCard component:**

```bash
# Open uber-clone/components/ParkingCard.tsx
# Search for "recommendationScore" - should appear 3 times
```

**Restart Metro bundler:**

```bash
# In uber-clone terminal, press Ctrl+C, then:
npx expo start --clear
```

---

### Problem: App crashes on startup

**Clear Metro cache:**

```bash
cd uber-clone
npx expo start --clear
```

**Reinstall dependencies:**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Check React Native version:**

```bash
npm list react-native
# Should be compatible with Expo SDK
```

---

## 📊 Success Criteria

Your integration is working correctly if ALL of these are true:

### Backend

- [x] ML service responds at http://localhost:5001/health
- [x] Backend API responds at http://localhost:3000/api-docs
- [x] Database has 6 parking spots (check: `psql -d parking_db -c "SELECT COUNT(*) FROM parking_spots;"`)
- [x] Integration test passes: `./test-integration.sh`

### Mobile App

- [x] App builds and runs without errors
- [x] Console logs show "🎯 Calling recommendation API..."
- [x] Console logs show "✅ Received 3 recommendations"
- [x] No red error screens in app

### UI Display

- [x] Parking cards show green score badges
- [x] ML Confidence percentage visible
- [x] Predicted availability visible
- [x] EV charging badges appear (when applicable)
- [x] Prices show in ₹ (not $)
- [x] Spots ranked by score (highest first)

### Functionality

- [x] Searching destination triggers new recommendations
- [x] Map markers update when searching
- [x] Tapping card selects parking spot
- [x] Fallback works when backend stopped

---

## 🎉 You're Done!

If all tests pass, your smart parking ML integration is working!

**What you have now:**

- 🤖 ML-powered parking recommendations
- 🎯 Smart scoring algorithm (0-100 points)
- 📊 Real-time occupancy data
- ⚡ Advanced amenities (EV charging)
- 🇮🇳 Localized pricing (₹)
- 📱 Beautiful mobile UI

---

## 📚 Next Steps

### Learn More

- Read `MOBILE_APP_INTEGRATION.md` for detailed integration guide
- Check `ARCHITECTURE_DIAGRAM.md` to understand system design
- Review `IMPLEMENTATION_SUMMARY.md` for technical details

### Customize

- Update scoring weights in `backend/src/services/recommendation.service.ts`
- Add more parking locations in `backend/scripts/seed-parking-spots.ts`
- Customize UI colors in `uber-clone/components/ParkingCard.tsx`

### Deploy

- Follow production deployment guide in `SETUP_GUIDE.md`
- Update API URL to production backend
- Build app: `eas build --platform all`

---

## 💬 Get Help

**Check logs:**

```bash
# Backend logs
cd backend && npm run dev

# ML service logs
cd ml_service && python app.py

# Mobile app logs
cd uber-clone && npx expo start
```

**Common commands:**

```bash
# Restart everything
./stop-services.sh
./start-services.sh

# Run integration test
./test-integration.sh

# Check service health
curl http://localhost:3000/health
curl http://localhost:5001/health
```

---

## ⏱️ Time Summary

- ✅ Prerequisites Check: 5 minutes
- ✅ Backend Setup: 3 minutes
- ✅ Mobile Configuration: 2 minutes
- ✅ Testing: 5 minutes
- **Total:** ~15 minutes to fully operational system

---

**Ready to start?** Run: `./start-services.sh`  
**Need help?** Check: `MOBILE_APP_INTEGRATION.md`  
**Status:** ✅ All systems ready!
