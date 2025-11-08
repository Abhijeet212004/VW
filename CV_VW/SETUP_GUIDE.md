# Number Plate Scanner Integration Setup Guide

## Overview
This guide helps you integrate the CV number plate scanner with your parking management system. The scanner detects vehicle number plates at entrance/exit and automatically updates booking times in the backend.

## Architecture Flow
```
CV Scanner → Detects Plate → Backend API → Updates Booking → Admin Dashboard Shows Activity
```

## 1. Backend Setup

### Start the Backend Server
```bash
cd /Users/abhijeet/Documents/TechWagon/backend
npm install
npm run dev
```

The backend will run on `http://localhost:3000` with new CV endpoints:
- `POST /api/cv/alpr` - Process ALPR events
- `GET /api/cv/logs` - Get CV logs with filters
- `GET /api/cv/activity` - Get recent activity for dashboard

### Test Backend Endpoints
```bash
# Test CV endpoint
curl -X POST http://localhost:3000/api/cv/alpr \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleNumber": "MH01AB1234",
    "eventType": "ENTRY",
    "confidence": 0.85,
    "cameraId": "entrance_cam_001",
    "parkingSpotId": "your-parking-spot-uuid"
  }'
```

## 2. CV Scanner Setup

### Install Python Dependencies
```bash
cd /Users/abhijeet/Documents/TechWagon/CV_VW
pip install -r requirements.txt
```

### Configure Scanner
1. Edit `config.py`:
   ```python
   # Backend Configuration
   BACKEND_API_URL = "http://localhost:3000/api/cv/alpr"
   
   # Camera Configuration  
   CAMERA_ID = "entrance_cam_001"  # Unique ID for this camera
   PARKING_SPOT_ID = "your-parking-spot-uuid"  # Get from database
   EVENT_TYPE = "ENTRY"  # "ENTRY" for entrance, "EXIT" for exit
   
   # Detection Settings
   CONFIDENCE_THRESHOLD = 0.7
   DETECTION_COOLDOWN = 30  # seconds
   ```

2. Update paths in config:
   ```python
   LPR_SCRIPT_PATH = r"YOUR_ACTUAL_PATH\Indian_LPR\infer_objectdet.py"
   VIDEO_PATH = "videos/car.mp4"  # or set USE_WEBCAM = True
   ```

### Run the Scanner
```bash
# Use the enhanced scanner
python enhanced_alpr.py

# Or use the updated original
python numberplate.py
```

## 3. Admin Dashboard Setup

### Start the Dashboard
```bash
cd /Users/abhijeet/Documents/TechWagon/admin-dashboard
npm install
npm run dev
```

Visit `http://localhost:3001/dashboard/activity` to see real-time CV activity.

## 4. Database Setup

### Get Parking Spot IDs
```sql
-- Connect to your database and run:
SELECT id, name, address FROM "ParkingSpot";
```

### Create Test Booking
Before testing, ensure you have:
1. A user with a registered vehicle
2. An active booking for that vehicle
3. The vehicle's registration number matches what the scanner detects

## 5. Testing the Complete Flow

### Test Scenario
1. **Start all services**:
   - Backend: `http://localhost:3000`
   - Admin Dashboard: `http://localhost:3001`
   - CV Scanner: Running with video/webcam

2. **Create test booking**:
   - User books a parking slot
   - Booking status: CONFIRMED

3. **Test scanner detection**:
   - Scanner detects plate number
   - Sends to backend
   - Backend finds active booking
   - Updates `actualEntryTime` and status to ACTIVE

4. **Check admin dashboard**:
   - Go to Activity page
   - See real-time entry event
   - Verify booking was updated

### Debug Common Issues

#### Scanner Issues
- Check if `requests` is installed: `pip install requests`
- Verify backend URL is reachable
- Check if LPR script path is correct
- Ensure Haar cascade file is found

#### Backend Issues  
- Check database connection
- Verify parking spot ID exists
- Ensure vehicle registration matches exactly
- Check for active bookings

#### Dashboard Issues
- Verify NEXT_PUBLIC_BACKEND_URL in `.env.local`
- Check browser console for API errors
- Ensure backend CORS allows frontend domain

## 6. Multiple Camera Setup

For entrance and exit cameras:

### Entrance Camera Config
```python
CAMERA_ID = "entrance_cam_001"
EVENT_TYPE = "ENTRY"
PARKING_SPOT_ID = "spot-uuid-1"
```

### Exit Camera Config  
```python
CAMERA_ID = "exit_cam_001"  
EVENT_TYPE = "EXIT"
PARKING_SPOT_ID = "spot-uuid-1"  # same spot
```

Run separate scanner instances for each camera with different configs.

## 7. Production Deployment

### Environment Variables
Create `.env` files for production:

**Backend `.env`**:
```
DATABASE_URL=your_production_db_url
PORT=3000
```

**Frontend `.env.local`**:
```
NEXT_PUBLIC_BACKEND_URL=https://your-backend-domain.com
```

### Camera Setup
- Install cameras at entrance/exit points
- Configure static IPs for cameras
- Update CAMERA_ID and VIDEO_PATH accordingly
- Set up proper lighting for plate detection

### Monitoring
- Admin dashboard shows real-time activity
- Set up alerts for processing errors
- Monitor detection confidence rates
- Track false positives/negatives

## API Documentation

### CV Endpoints

**POST /api/cv/alpr**
```json
{
  "vehicleNumber": "MH01AB1234",
  "eventType": "ENTRY" | "EXIT", 
  "confidence": 0.85,
  "cameraId": "entrance_cam_001",
  "parkingSpotId": "uuid",
  "imageUrl": "optional-image-url"
}
```

**GET /api/cv/logs**
Query params: `vehicleNumber`, `eventType`, `processed`, `startDate`, `endDate`, `limit`

**GET /api/cv/activity**
Query params: `limit` (default: 20)

## Support

If you encounter issues:
1. Check logs in terminal/console
2. Verify all services are running
3. Test individual components first
4. Check database for test data
5. Verify network connectivity between components