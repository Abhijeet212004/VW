# API Configuration Guide
## Quick Reference for Different Development Environments

This guide helps you configure the correct API URL in your React Native app based on your development setup.

---

## 📍 Current Configuration

File: `uber-clone/lib/parking.ts`

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## 🔧 Configuration Options

### Option 1: iOS Simulator (Default)
✅ **Use:** `localhost` works perfectly

```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

**When to use:**
- Running app on iOS Simulator
- Backend running on same Mac

**Test command:**
```bash
npm run ios
```

---

### Option 2: Android Emulator
⚠️ **Use:** Special emulator IP address

```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```

**Why:** Android emulator treats `localhost` as the emulator itself, not your computer. Use `10.0.2.2` to access host machine.

**When to use:**
- Running app on Android Emulator (AVD)
- Backend running on your computer

**Test command:**
```bash
npm run android
```

---

### Option 3: Physical Device (Same WiFi)
📱 **Use:** Your computer's local IP address

```typescript
const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
```

**Find your IP:**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for `IPv4 Address` under your WiFi adapter.

**When to use:**
- Testing on real iPhone/Android phone
- Backend running on your computer
- Phone and computer on same WiFi network

**Requirements:**
- ✅ Both devices on same WiFi
- ✅ Firewall allows port 3000
- ✅ Backend listening on `0.0.0.0` (not just `localhost`)

---

### Option 4: Expo Go (Tunnel Mode)
🌐 **Use:** Expo tunnel URL

```bash
# Start with tunnel
npx expo start --tunnel
```

Then use the provided tunnel URL:
```typescript
const API_BASE_URL = 'https://XXXXX.ngrok.io/api';
```

**When to use:**
- Testing on physical device (different WiFi)
- Testing remotely
- Cannot access local network

**Note:** Requires Expo account

---

### Option 5: Production
🚀 **Use:** Your deployed backend URL

```typescript
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

**When to use:**
- Production builds
- App deployed to App Store/Play Store
- Backend deployed to cloud (AWS, Azure, Heroku, etc.)

---

## 🔄 Dynamic Configuration (Recommended)

Instead of hardcoding, use environment variables:

### Step 1: Create `.env` file

Create `uber-clone/.env`:
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### Step 2: Update `parking.ts`

```typescript
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
```

### Step 3: Create Multiple .env Files

**`.env.development` (iOS Simulator)**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

**`.env.android` (Android Emulator)**
```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000/api
```

**`.env.device` (Physical Device)**
```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

**`.env.production` (Production)**
```bash
EXPO_PUBLIC_API_URL=https://api.yourapp.com/api
```

### Step 4: Use with npm scripts

Update `package.json`:
```json
{
  "scripts": {
    "start": "expo start",
    "ios": "EXPO_PUBLIC_ENV=development expo start --ios",
    "android": "EXPO_PUBLIC_ENV=android expo start --android",
    "device": "EXPO_PUBLIC_ENV=device expo start",
    "prod": "EXPO_PUBLIC_ENV=production expo start"
  }
}
```

---

## 🧪 Testing Your Configuration

### Test 1: Check API Reachability

Open app and check console logs:
```
🎯 Calling recommendation API...
User: 18.5204, 73.8567
Destination: 18.5314, 73.8446
```

**Success:** You see:
```
✅ Received 3 recommendations
```

**Failure:** You see:
```
❌ Failed to fetch recommendations: TypeError: Network request failed
```

### Test 2: Manual API Test

**From your terminal:**
```bash
curl http://localhost:3000/api/recommend-parking \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "userLatitude": 18.5204,
    "userLongitude": 73.8567,
    "destinationLatitude": 18.5314,
    "destinationLongitude": 73.8446,
    "vehicleType": "car",
    "radiusKm": 3
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "count": 3,
  "recommendations": [...]
}
```

**From Android Emulator:**
```bash
# Run this inside Android emulator terminal
curl http://10.0.2.2:3000/api/recommend-parking ...
```

**From iOS Simulator:**
```bash
# Same as terminal (localhost works)
curl http://localhost:3000/api/recommend-parking ...
```

---

## 🛠️ Backend Configuration

Make sure your backend is properly configured to accept requests:

### Update `backend/src/server.ts`

```typescript
// Allow requests from mobile app
app.use(cors({
  origin: '*', // For development
  // origin: ['http://localhost:3000', 'https://yourapp.com'], // For production
  credentials: true
}));

// Listen on all interfaces (not just localhost)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
```

**Important:** Change `app.listen(PORT)` to `app.listen(PORT, '0.0.0.0')` to allow external connections.

---

## 🐛 Troubleshooting

### Error: "Network request failed"

**Checklist:**
1. ✅ Backend services running (`./start-services.sh`)
2. ✅ Correct API URL for your environment
3. ✅ Backend listening on `0.0.0.0` (not just `localhost`)
4. ✅ Firewall allows port 3000
5. ✅ Phone and computer on same WiFi (if using physical device)
6. ✅ CORS enabled in backend

**Debug steps:**

**1. Check backend is running:**
```bash
curl http://localhost:3000/api-docs
```

**2. Check from Android emulator:**
```bash
# In emulator terminal
curl http://10.0.2.2:3000/api-docs
```

**3. Check from physical device:**
```bash
# On your phone browser
http://192.168.1.XXX:3000/api-docs
```

**4. Check Metro bundler logs:**
Look for network errors in the terminal running `npm start`

**5. Enable network debugging (Android):**
```bash
adb shell
settings put global http_proxy <YOUR_IP>:8888
```

---

### Error: "TypeError: fetch failed"

**Solution:** Check if backend URL is reachable:

```bash
# Test backend health
curl http://YOUR_API_URL/health

# Expected: "Recommendation service is healthy"
```

---

### Error: "CORS policy blocked"

**Solution:** Update backend CORS configuration:

```typescript
app.use(cors({
  origin: '*', // Allow all origins (development only)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
```

---

### Backend not accessible from phone

**Solution 1: Check firewall**
```bash
# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/node

# Windows
netsh advfirewall firewall add rule name="Node.js" dir=in action=allow program="C:\Program Files\nodejs\node.exe" enable=yes
```

**Solution 2: Use ngrok**
```bash
# Install ngrok
npm install -g ngrok

# Expose port 3000
ngrok http 3000

# Use the provided URL (e.g., https://abcd1234.ngrok.io/api)
```

---

## 📋 Quick Reference Table

| Environment | API URL | Use Case |
|------------|---------|----------|
| iOS Simulator | `http://localhost:3000/api` | Default development |
| Android Emulator | `http://10.0.2.2:3000/api` | Android AVD testing |
| Physical Device (WiFi) | `http://192.168.1.XXX:3000/api` | Real device testing |
| Expo Tunnel | `https://XXXXX.ngrok.io/api` | Remote testing |
| Production | `https://api.yourapp.com/api` | Production builds |

---

## ✅ Configuration Checklist

Before testing:

- [ ] Backend services running (`./start-services.sh`)
- [ ] Database seeded (`npm run seed` in backend/)
- [ ] Correct API URL for your environment
- [ ] Backend listening on `0.0.0.0`
- [ ] CORS enabled in backend
- [ ] Firewall allows port 3000 (if using physical device)
- [ ] Phone and computer on same WiFi (if using physical device)
- [ ] API health check passes (`curl http://YOUR_URL/health`)
- [ ] Metro bundler running (`npm start` in uber-clone/)

---

## 🎯 Recommended Setup by Use Case

### Daily Development (iOS)
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```
```bash
npm run ios
```

### Daily Development (Android)
```typescript
const API_BASE_URL = 'http://10.0.2.2:3000/api';
```
```bash
npm run android
```

### Testing on Phone
1. Find your IP: `ifconfig | grep inet`
2. Update URL: `http://192.168.1.XXX:3000/api`
3. Start backend: `npm run dev` in backend/
4. Start app: `npm start` in uber-clone/
5. Scan QR code with Expo Go

### Production Build
1. Deploy backend to cloud
2. Update URL: `https://api.yourapp.com/api`
3. Build app: `eas build --platform all`
4. Test with production API

---

**Last Updated:** December 2024  
**Status:** ✅ Ready for development
