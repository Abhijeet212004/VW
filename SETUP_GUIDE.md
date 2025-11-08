# 🚀 SETUP GUIDE - Smart Parking Recommendation System

Complete step-by-step guide to get the system running.

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18+ installed (`node --version`)
- ✅ **Python** 3.8+ installed (`python3 --version`)
- ✅ **PostgreSQL** 14+ installed and running
- ✅ **npm** or **yarn** package manager
- ✅ **Git** for version control

## 🏗️ System Architecture

```
User's Mobile App (React Native)
         ↓ HTTP REST API
Backend Server (Node.js + TypeScript + Prisma)
         ↓ HTTP → ML Service (Flask + Python + XGBoost)
         ↓ SQL → PostgreSQL Database
```

---

## 📦 Installation

### Step 1: Clone and Navigate

```bash
cd /home/krish/Documents/Codes/ML/parkingPrediction
```

### Step 2: Setup PostgreSQL Database

```bash
# Create database
sudo -u postgres psql
CREATE DATABASE parking_db;
CREATE USER parking_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE parking_db TO parking_user;
\q
```

### Step 3: Setup ML Service

```bash
cd ml_service

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Linux/Mac
# OR
venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Verify model files exist
ls -lh ../parking_model_v2.json
ls -lh ../parking_model_data_v2.joblib
```

### Step 4: Setup Backend

```bash
cd ../backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Edit `.env` file:**

```env
DATABASE_URL="postgresql://parking_user:your_password@localhost:5432/parking_db"
PORT=3000
ML_SERVICE_URL="http://localhost:5001"
```

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Seed sample parking data
npm run seed:parking
```

---

## 🚀 Starting the System

### Option 1: Quick Start (Automated)

```bash
cd /home/krish/Documents/Codes/ML/parkingPrediction
./start-services.sh
```

This will:

- Start ML service on port 5001
- Start Backend API on port 3000
- Display all service URLs
- Save process IDs for easy cleanup

### Option 2: Manual Start

**Terminal 1 - ML Service:**

```bash
cd ml_service
source venv/bin/activate
python app.py
```

**Terminal 2 - Backend API:**

```bash
cd backend
npm run dev
```

---

## 🧪 Testing the System

### Automated Integration Tests

```bash
./test-integration.sh
```

### Manual Testing

#### 1. Test ML Service

```bash
# Health check
curl http://localhost:5001/health

# Get current time context
curl http://localhost:5001/context

# Single prediction
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

#### 2. Test Backend API

```bash
# Health check
curl http://localhost:3000/health

# Get parking recommendations
curl -X POST http://localhost:3000/api/recommend-parking \
  -H "Content-Type: application/json" \
  -d '{
    "userLatitude": 18.5204,
    "userLongitude": 73.8567,
    "destinationLatitude": 18.5324,
    "destinationLongitude": 73.8467,
    "vehicleType": "car",
    "radiusKm": 3,
    "arrivalTimeMinutes": 15
  }'
```

---

## 📱 API Documentation

Once the backend is running, access interactive API docs:

**Swagger UI:** http://localhost:3000/api-docs

### Main Endpoint: Parking Recommendations

**POST** `/api/recommend-parking`

**Request:**

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

---

## 🎯 Sample Test Locations in Pune

Use these coordinates for testing:

### 1. PICT Area

- **User Location:** 18.5204, 73.8567
- **Destination:** 18.5224, 73.8587

### 2. Hinjewadi IT Park

- **User Location:** 18.5913, 73.7389
- **Destination:** 18.5950, 73.7420

### 3. Kothrud to FC Road

- **User Location:** 18.5074, 73.8077
- **Destination:** 18.5196, 73.8410

### 4. Pune Station Area

- **User Location:** 18.5288, 73.8740
- **Destination:** 18.5300, 73.8760

---

## 🔧 Troubleshooting

### ML Service Won't Start

**Problem:** `ModuleNotFoundError: No module named 'flask'`

```bash
cd ml_service
source venv/bin/activate
pip install -r requirements.txt
```

**Problem:** Model files not found

```bash
# Verify model files exist in project root
ls -lh parking_model_v2.json parking_model_data_v2.joblib

# If missing, run the training notebook
jupyter notebook Model.ipynb
```

### Backend Won't Start

**Problem:** Database connection failed

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify DATABASE_URL in .env
cat backend/.env

# Test connection
psql -d parking_db -U parking_user
```

**Problem:** Prisma client not generated

```bash
cd backend
npm run prisma:generate
```

### No Parking Spots Found

**Problem:** Database is empty

```bash
cd backend
npm run seed:parking
```

### ML Service Unavailable

The system gracefully handles ML service downtime:

- Returns neutral predictions (50% occupied)
- Still provides recommendations based on real-time data
- Sets `mlServiceAvailable: false` in response

---

## 📊 Database Management

### View Data

```bash
cd backend
npm run prisma:studio
```

Opens GUI at http://localhost:5555

### Reset Database

```bash
cd backend
npm run prisma:migrate reset
npm run seed:parking
```

### Backup Database

```bash
pg_dump -U parking_user parking_db > backup.sql
```

---

## 🛑 Stopping the System

### Quick Stop (if started with script)

```bash
./stop-services.sh
```

### Manual Stop

```bash
# Find and kill processes
ps aux | grep "python app.py"
ps aux | grep "ts-node-dev"

# Kill by PID
kill <PID>
```

---

## 📈 Monitoring and Logs

### ML Service Logs

```bash
tail -f ml_service.log
```

### Backend Logs

Backend logs appear in the terminal where it's running.

### Database Queries

Enable Prisma query logging in `backend/src/config/database.ts`:

```typescript
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});
```

---

## 🚢 Production Deployment

### Environment Variables

**.env.production:**

```env
DATABASE_URL="postgresql://..."
PORT=3000
ML_SERVICE_URL="http://ml-service:5001"
NODE_ENV=production
```

### Docker Deployment (Optional)

Create `docker-compose.yml`:

```yaml
version: "3.8"
services:
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: parking_db
      POSTGRES_USER: parking_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"

  ml-service:
    build: ./ml_service
    ports:
      - "5001:5001"
    depends_on:
      - db

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://parking_user:${DB_PASSWORD}@db:5432/parking_db
      ML_SERVICE_URL: http://ml-service:5001
    depends_on:
      - db
      - ml-service
```

---

## 📚 Additional Resources

- **Main README:** `README_SMART_PARKING.md`
- **ML Service README:** `ml_service/README.md`
- **Backend README:** `backend/README.md`
- **API Documentation:** http://localhost:3000/api-docs
- **Prisma Studio:** http://localhost:5555

---

## 🐛 Common Issues and Solutions

| Issue                     | Solution                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| Port already in use       | Change PORT in .env or kill process: `lsof -ti:3000 \| xargs kill` |
| ML predictions always 0.5 | ML service not running or model files missing                      |
| No parking spots returned | Run seed script: `npm run seed:parking`                            |
| Database migration error  | Reset database: `npm run prisma:migrate reset`                     |
| Python module not found   | Activate venv: `source ml_service/venv/bin/activate`               |

---

## ✅ Quick Verification Checklist

- [ ] PostgreSQL running
- [ ] Database created and migrated
- [ ] Sample parking spots seeded
- [ ] ML service responds to `/health`
- [ ] Backend responds to `/health`
- [ ] Model files exist and load correctly
- [ ] Recommendation API returns results
- [ ] API documentation accessible

---

## 🎉 Success!

If you can access:

- ✅ http://localhost:5001/health
- ✅ http://localhost:3000/health
- ✅ http://localhost:3000/api-docs

And the recommendation API returns results, you're all set! 🚀

Need help? Check the logs or run: `./test-integration.sh`
